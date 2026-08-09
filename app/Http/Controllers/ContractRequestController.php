<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectContractRequest;
use App\Http\Requests\StoreContractRequest;
use App\Models\Assignment;
use App\Models\ContractRequest;
use App\Services\ContractApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ContractRequestController extends Controller
{
    protected ContractApprovalService $approvalService;

    public function __construct(ContractApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    /**
     * Display a listing of contract requests with stats and filters.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user->isSuperAdmin();

        $query = ContractRequest::with([
            'client',
            'profile',
            'assignment',
            'requester:id,name,role',
            'approver:id,name,role',
            'audits',
        ]);

        // If not super admin, show only their own requests
        if (!$isSuperAdmin) {
            $query->where('requested_by', $user->id);
        }

        // Search and filters
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('generated_contract_id', 'like', "%{$search}%")
                    ->orWhereHas('client', fn($cq) => $cq->where('nom', 'like', "%{$search}%")->orWhere('c_nom', 'like', "%{$search}%"))
                    ->orWhereHas('profile', fn($pq) => $pq->where('full_name', 'like', "%{$search}%")->orWhere('nom', 'like', "%{$search}%"))
                    ->orWhereHas('requester', fn($rq) => $rq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($clientId = $request->input('client_id')) {
            $query->where('client_id', $clientId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Stats calculation query
        $statsBaseQuery = ContractRequest::query();
        if (!$isSuperAdmin) {
            $statsBaseQuery->where('requested_by', $user->id);
        }

        $stats = [
            'total' => (clone $statsBaseQuery)->count(),
            'pending' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_PENDING)->count(),
            'approved' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_APPROVED)->count(),
            'generating' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_GENERATING)->count(),
            'completed' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_COMPLETED)->count(),
            'rejected' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_REJECTED)->count(),
            'failed' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_FAILED)->count(),
            'cancelled' => (clone $statsBaseQuery)->where('status', ContractRequest::STATUS_CANCELLED)->count(),
        ];

        $requests = $query->latest('created_at')->paginate(15)->withQueryString();

        return Inertia::render('ContractRequests/Index', [
            'contractRequests' => $requests,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'client_id', 'date_from', 'date_to']),
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /**
     * Store a newly created contract request.
     * If user is a Super Admin or requested direct generation, generates the contract immediately.
     */
    public function store(StoreContractRequest $request): RedirectResponse
    {
        $this->authorize('create', ContractRequest::class);

        $assignment = Assignment::findOrFail($request->validated('assignment_id'));
        $user = $request->user();

        // If user is Super Admin / System Administrator, generate directly without pending request
        if ($user->isSuperAdmin() || $request->boolean('direct_generate')) {
            $contractRequest = $this->approvalService->directGenerate(
                $assignment,
                $user,
                $request->input('notes'),
                $request->ip()
            );

            return redirect()->back()->with('success', "Contrat généré avec succès ! Le document PDF est prêt au téléchargement.");
        }

        $contractRequest = $this->approvalService->createRequest(
            $assignment,
            $user,
            $request->input('notes'),
            $request->ip()
        );

        return redirect()->back()->with('success', "Demande de contrat #{$contractRequest->id} soumise avec succès. En attente d'approbation Super Admin.");
    }

    /**
     * Direct contract generation for an assignment (Super Admin / System Administrator only).
     */
    public function directGenerate(Request $request, Assignment $assignment): RedirectResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            abort(403, "Seul un Super Admin ou Administrateur Système peut générer directement un contrat sans demande.");
        }

        $contractRequest = $this->approvalService->directGenerate(
            $assignment,
            $request->user(),
            $request->input('notes'),
            $request->ip()
        );

        return redirect()->back()->with('success', "Contrat généré avec succès ! Le document PDF est disponible au téléchargement.");
    }

    /**
     * Display the specified contract request with full audit trail.
     */
    public function show(ContractRequest $contractRequest)
    {
        $this->authorize('view', $contractRequest);

        $contractRequest->load([
            'client',
            'profile',
            'assignment',
            'requester',
            'approver',
            'audits.user',
        ]);

        if (request()->wantsJson()) {
            return response()->json($contractRequest);
        }

        return Inertia::render('ContractRequests/Show', [
            'contractRequest' => $contractRequest,
            'isSuperAdmin' => request()->user()->isSuperAdmin(),
        ]);
    }

    /**
     * Approve a contract request (Super Admin only).
     */
    public function approve(Request $request, ContractRequest $contractRequest): RedirectResponse
    {
        $this->authorize('approve', $contractRequest);

        $this->approvalService->approveRequest($contractRequest, $request->user(), $request->ip());

        return redirect()->back()->with('success', "Demande #{$contractRequest->id} approuvée ! La génération du contrat est en cours.");
    }

    /**
     * Reject a contract request (Super Admin only).
     */
    public function reject(RejectContractRequest $request, ContractRequest $contractRequest): RedirectResponse
    {
        $this->authorize('reject', $contractRequest);

        $this->approvalService->rejectRequest(
            $contractRequest,
            $request->user(),
            $request->input('reason'),
            $request->ip()
        );

        return redirect()->back()->with('warning', "Demande #{$contractRequest->id} refusée.");
    }

    /**
     * Cancel a pending contract request.
     */
    public function cancel(Request $request, ContractRequest $contractRequest): RedirectResponse
    {
        $this->authorize('cancel', $contractRequest);

        $this->approvalService->cancelRequest($contractRequest, $request->user(), $request->ip());

        return redirect()->back()->with('info', "Demande #{$contractRequest->id} annulée.");
    }

    /**
     * Retry a failed contract generation (Super Admin only).
     */
    public function retry(Request $request, ContractRequest $contractRequest): RedirectResponse
    {
        $this->authorize('retry', $contractRequest);

        $this->approvalService->retryGeneration($contractRequest, $request->user(), $request->ip());

        return redirect()->back()->with('success', "Nouvelle tentative de génération lancée pour la demande #{$contractRequest->id}.");
    }

    /**
     * Securely download a generated contract PDF.
     */
    public function download(Request $request, ContractRequest $contractRequest): BinaryFileResponse|RedirectResponse
    {
        $this->authorize('download', $contractRequest);

        if (!$contractRequest->file_path || !Storage::disk('local')->exists($contractRequest->file_path)) {
            return redirect()->back()->with('error', "Le fichier du contrat est introuvable sur le serveur.");
        }

        // Log audit trail
        $this->approvalService->logAudit(
            $contractRequest,
            'downloaded',
            $request->user(),
            "Téléchargement du contrat PDF par " . $request->user()->name,
            $request->ip()
        );

        $fullPath = Storage::disk('local')->path($contractRequest->file_path);
        $fileName = $contractRequest->file_name ?? "Contrat_LavoieJob_{$contractRequest->id}.pdf";

        return response()->download($fullPath, $fileName, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
