<?php

namespace App\Jobs;

use App\Events\ContractRequestUpdated;
use App\Models\ContractRequest;
use App\Models\ContractRequestAudit;
use App\Models\User;
use App\Notifications\ContractGenerationFailedNotification;
use App\Notifications\ContractReadyNotification;
use App\Services\ContractGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateContractJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    protected ContractRequest $contractRequest;

    public function __construct(ContractRequest $contractRequest)
    {
        $this->contractRequest = $contractRequest;
    }

    public function handle(ContractGenerator $contractGenerator): void
    {
        $request = $this->contractRequest->fresh(['assignment.client', 'assignment.profile', 'requester', 'approver']);

        if (!$request || in_array($request->status, [ContractRequest::STATUS_REJECTED, ContractRequest::STATUS_CANCELLED])) {
            return;
        }

        try {
            // Update to generating
            $request->update([
                'status' => ContractRequest::STATUS_GENERATING,
            ]);

            // Audit log
            ContractRequestAudit::create([
                'contract_request_id' => $request->id,
                'user_id' => $request->approved_by ?? $request->requested_by,
                'user_name' => 'Système / Queue Job',
                'user_role' => 'Queue Worker',
                'action' => 'generation_started',
                'details' => 'Démarrage de la génération asynchrone du contrat PDF.',
                'ip_address' => '127.0.0.1',
            ]);

            // Broadcast live generating status
            event(new ContractRequestUpdated($request, 'generation_started', 'Génération du contrat en cours...'));

            $assignment = $request->assignment;
            if (!$assignment) {
                throw new \RuntimeException("Affectation introuvable pour la demande #{$request->id}");
            }

            // Generate the PDF content
            $pdfContent = $contractGenerator->generate($assignment);

            // Save PDF to storage
            $fileName = 'Protocole_LavoieJob_LPS_' . $assignment->id . '_' . $request->id . '.pdf';
            $storagePath = 'contracts/' . $fileName;
            Storage::disk('local')->put($storagePath, $pdfContent);

            // Mark as completed
            $request->update([
                'status' => ContractRequest::STATUS_COMPLETED,
                'file_path' => $storagePath,
                'file_name' => $fileName,
                'generated_contract_id' => 'LPS-' . str_pad((string)$assignment->id, 5, '0', STR_PAD_LEFT),
                'completed_at' => now(),
                'error_message' => null,
            ]);

            // Audit log completion
            ContractRequestAudit::create([
                'contract_request_id' => $request->id,
                'user_id' => $request->approved_by,
                'user_name' => 'Système / Queue Job',
                'user_role' => 'Queue Worker',
                'action' => 'generation_completed',
                'details' => "Contrat généré avec succès : {$fileName}",
                'ip_address' => '127.0.0.1',
            ]);

            // Broadcast completion
            event(new ContractRequestUpdated($request, 'generation_completed', 'Contrat généré avec succès !'));

            // Notify Requester
            if ($request->requester) {
                $request->requester->notify(new ContractReadyNotification($request));
            }

        } catch (Throwable $e) {
            Log::error("Erreur lors de la génération du contrat #{$request->id}: " . $e->getMessage(), [
                'exception' => $e,
                'request_id' => $request->id,
            ]);

            $request->update([
                'status' => ContractRequest::STATUS_FAILED,
                'error_message' => $e->getMessage(),
            ]);

            ContractRequestAudit::create([
                'contract_request_id' => $request->id,
                'user_id' => null,
                'user_name' => 'Système / Queue Job',
                'user_role' => 'Queue Worker',
                'action' => 'generation_failed',
                'details' => "Erreur : " . $e->getMessage(),
                'ip_address' => '127.0.0.1',
            ]);

            // Broadcast failure
            event(new ContractRequestUpdated($request, 'generation_failed', 'Échec de la génération : ' . $e->getMessage()));

            // Notify requester & super admins
            if ($request->requester) {
                $request->requester->notify(new ContractGenerationFailedNotification($request, $e->getMessage()));
            }

            $superAdmins = User::whereIn('role', ['System Administrator', 'Super Admin', 'super Admin'])->get();
            foreach ($superAdmins as $admin) {
                $admin->notify(new ContractGenerationFailedNotification($request, $e->getMessage()));
            }

            throw $e;
        }
    }
}
