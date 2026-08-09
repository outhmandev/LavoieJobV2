<?php

namespace App\Services;

use App\Events\ContractRequestUpdated;
use App\Jobs\GenerateContractJob;
use App\Models\Assignment;
use App\Models\ContractRequest;
use App\Models\ContractRequestAudit;
use App\Models\User;
use App\Notifications\ContractRequestApprovedNotification;
use App\Notifications\ContractRequestRejectedNotification;
use App\Notifications\ContractRequestSubmittedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContractApprovalService
{
    /**
     * Generate a contract directly for an assignment by a Super Admin / System Administrator without prior request.
     */
    public function directGenerate(Assignment $assignment, User $superAdmin, ?string $notes = null, ?string $ip = null): ContractRequest
    {
        if (!$superAdmin->isSuperAdmin()) {
            throw new \Illuminate\Auth\Access\AuthorizationException("Seul un Super Admin ou Administrateur Système peut générer directement un contrat sans demande.");
        }

        return DB::transaction(function () use ($assignment, $superAdmin, $notes, $ip) {
            // Find existing contract request or create a new one
            $request = ContractRequest::where('assignment_id', $assignment->id)->first();

            if (!$request) {
                $request = ContractRequest::create([
                    'assignment_id' => $assignment->id,
                    'client_id' => $assignment->client_id,
                    'profile_id' => $assignment->profile_id,
                    'requested_by' => $superAdmin->id,
                    'status' => ContractRequest::STATUS_APPROVED,
                    'approved_by' => $superAdmin->id,
                    'approved_at' => now(),
                    'notes' => $notes,
                ]);
            } else {
                $request->update([
                    'status' => ContractRequest::STATUS_APPROVED,
                    'approved_by' => $superAdmin->id,
                    'approved_at' => now(),
                    'notes' => $notes ?: $request->notes,
                    'error_message' => null,
                ]);
            }

            $this->logAudit(
                $request,
                'direct_generation',
                $superAdmin,
                "Contrat généré directement sans demande préalable par le Super Admin {$superAdmin->name}" . ($notes ? " (Note: {$notes})" : ""),
                $ip
            );

            // Broadcast real-time event
            event(new ContractRequestUpdated($request, 'direct_generation_started', "Génération directe du contrat #{$request->id} lancée"));

            // Synchronously generate the PDF contract
            GenerateContractJob::dispatchSync($request);

            return $request->fresh(['assignment.client', 'assignment.profile', 'requester', 'approver']);
        });
    }

    /**
     * Create a new contract request submitted by a Member or Admin.
     */
    public function createRequest(Assignment $assignment, User $user, ?string $notes = null, ?string $ip = null): ContractRequest
    {
        // Prevent duplicate requests in pending, approved, or generating status
        $existing = ContractRequest::where('assignment_id', $assignment->id)
            ->whereIn('status', [
                ContractRequest::STATUS_PENDING,
                ContractRequest::STATUS_APPROVED,
                ContractRequest::STATUS_GENERATING,
            ])
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'assignment_id' => ["Une demande de contrat est déjà en cours ({$existing->status}) pour cette affectation (Demande #{$existing->id})."],
            ]);
        }

        return DB::transaction(function () use ($assignment, $user, $notes, $ip) {
            $request = ContractRequest::create([
                'assignment_id' => $assignment->id,
                'client_id' => $assignment->client_id,
                'profile_id' => $assignment->profile_id,
                'requested_by' => $user->id,
                'status' => ContractRequest::STATUS_PENDING,
                'notes' => $notes,
            ]);

            $this->logAudit(
                $request,
                'created',
                $user,
                "Demande de contrat soumise par {$user->name}" . ($notes ? " (Note: {$notes})" : ""),
                $ip
            );

            // Broadcast real-time event to Super Admins & Requester
            event(new ContractRequestUpdated($request, 'request_created', "Nouvelle demande de contrat #{$request->id} créée"));

            // Notify all Super Admins in real time & database
            $superAdmins = User::all()->filter(fn(User $u) => $u->isSuperAdmin());
            foreach ($superAdmins as $superAdmin) {
                $superAdmin->notify(new ContractRequestSubmittedNotification($request));
            }

            return $request;
        });
    }

    /**
     * Approve a contract request and dispatch asynchronous background generation.
     */
    public function approveRequest(ContractRequest $request, User $superAdmin, ?string $ip = null): ContractRequest
    {
        if (!$superAdmin->isSuperAdmin()) {
            throw new \Illuminate\Auth\Access\AuthorizationException("Seul un Super Admin peut approuver une demande de contrat.");
        }

        if (!in_array($request->status, [ContractRequest::STATUS_PENDING, ContractRequest::STATUS_FAILED])) {
            throw ValidationException::withMessages([
                'status' => ["Cette demande de contrat ne peut pas être approuvée car son statut actuel est '{$request->status}'."],
            ]);
        }

        return DB::transaction(function () use ($request, $superAdmin, $ip) {
            $request->update([
                'status' => ContractRequest::STATUS_APPROVED,
                'approved_by' => $superAdmin->id,
                'approved_at' => now(),
                'error_message' => null,
            ]);

            $this->logAudit(
                $request,
                'approved',
                $superAdmin,
                "Demande approuvée par {$superAdmin->name}. Lancement de la génération en arrière-plan.",
                $ip
            );

            // Broadcast approval event
            event(new ContractRequestUpdated($request, 'request_approved', "Demande #{$request->id} approuvée"));

            // Notify requester
            if ($request->requester) {
                $request->requester->notify(new ContractRequestApprovedNotification($request));
            }

            // Generate contract PDF immediately and synchronously
            GenerateContractJob::dispatchSync($request);

            return $request;

        });
    }

    /**
     * Reject a contract request with an optional rejection reason.
     */
    public function rejectRequest(ContractRequest $request, User $superAdmin, ?string $reason = null, ?string $ip = null): ContractRequest
    {
        if (!$superAdmin->isSuperAdmin()) {
            throw new \Illuminate\Auth\Access\AuthorizationException("Seul un Super Admin peut refuser une demande de contrat.");
        }

        if ($request->status !== ContractRequest::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => ["Cette demande de contrat ne peut plus être refusée (statut: {$request->status})."],
            ]);
        }

        return DB::transaction(function () use ($request, $superAdmin, $reason, $ip) {
            $request->update([
                'status' => ContractRequest::STATUS_REJECTED,
                'approved_by' => $superAdmin->id,
                'rejection_reason' => $reason,
            ]);

            $this->logAudit(
                $request,
                'rejected',
                $superAdmin,
                "Demande refusée par {$superAdmin->name}." . ($reason ? " Motif: {$reason}" : ""),
                $ip
            );

            // Broadcast rejection event
            event(new ContractRequestUpdated($request, 'request_rejected', "Demande #{$request->id} refusée"));

            // Notify requester
            if ($request->requester) {
                $request->requester->notify(new ContractRequestRejectedNotification($request));
            }

            return $request;
        });
    }

    /**
     * Cancel a pending contract request by the requester.
     */
    public function cancelRequest(ContractRequest $request, User $user, ?string $ip = null): ContractRequest
    {
        if ($request->status !== ContractRequest::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => ["Seules les demandes en attente (Pending) peuvent être annulées."],
            ]);
        }

        if ((int) $request->requested_by !== (int) $user->id && !$user->isSuperAdmin()) {
            throw new \Illuminate\Auth\Access\AuthorizationException("Vous n'êtes pas autorisé à annuler cette demande.");
        }

        return DB::transaction(function () use ($request, $user, $ip) {
            $request->update([
                'status' => ContractRequest::STATUS_CANCELLED,
            ]);

            $this->logAudit(
                $request,
                'cancelled',
                $user,
                "Demande annulée par {$user->name}.",
                $ip
            );

            event(new ContractRequestUpdated($request, 'request_cancelled', "Demande #{$request->id} annulée"));

            return $request;
        });
    }

    /**
     * Retry a failed contract generation.
     */
    public function retryGeneration(ContractRequest $request, User $superAdmin, ?string $ip = null): ContractRequest
    {
        if (!$superAdmin->isSuperAdmin()) {
            throw new \Illuminate\Auth\Access\AuthorizationException("Seul un Super Admin peut relancer une génération échouée.");
        }

        if ($request->status !== ContractRequest::STATUS_FAILED) {
            throw ValidationException::withMessages([
                'status' => ["Seules les demandes en échec (Failed) peuvent être relancées."],
            ]);
        }

        return DB::transaction(function () use ($request, $superAdmin, $ip) {
            $request->update([
                'status' => ContractRequest::STATUS_APPROVED,
                'approved_by' => $superAdmin->id,
                'error_message' => null,
            ]);

            $this->logAudit(
                $request,
                'retried',
                $superAdmin,
                "Nouvelle tentative de génération lancée par {$superAdmin->name}.",
                $ip
            );

            event(new ContractRequestUpdated($request, 'generation_retried', "Tentative de génération relancée pour la demande #{$request->id}"));

            GenerateContractJob::dispatchSync($request);

            return $request;

        });
    }

    /**
     * Log an audit trail entry for a contract request.
     */
    public function logAudit(
        ContractRequest $request,
        string $action,
        ?User $user = null,
        ?string $details = null,
        ?string $ip = null
    ): ContractRequestAudit {
        return ContractRequestAudit::create([
            'contract_request_id' => $request->id,
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Système',
            'user_role' => $user?->role ?? 'System',
            'action' => $action,
            'details' => $details,
            'ip_address' => $ip ?? request()?->ip() ?? '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
