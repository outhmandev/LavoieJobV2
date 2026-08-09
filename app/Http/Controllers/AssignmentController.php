<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use App\Models\Suggestion;
use App\Http\Requests\AssignmentRequest;
use Inertia\Inertia;

use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index()
    {
        $assignments = Assignment::with(['client', 'profile', 'user', 'latestContractRequest.requester', 'latestContractRequest.approver'])
            ->latest()
            ->paginate(10);
            
        return Inertia::render('Assignments/Index', [
            'assignments' => $assignments
        ]);
    }


    public function create(Request $request)
    {
        $clientId = $request->query('client_id');
        $profileId = $request->query('profile_id');

        $selectedClient = $clientId ? Client::find($clientId) : null;
        $selectedProfile = $profileId ? Profile::find($profileId) : null;

        // Active profiles already under contract (assignment status not completed/cancelled)
        $assignedProfileIds = Assignment::whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
            ->pluck('profile_id')
            ->unique()
            ->toArray();

        // All active suggestions (pending = suggéré, accepted), EXCLUDING profiles already under active contract
        $suggestions = Suggestion::with(['client', 'profile'])
            ->whereIn('status', ['pending', 'accepted', 'suggere'])
            ->whereNotIn('profile_id', $assignedProfileIds)
            ->get();

        // Check if selected client already has previous assignments/contracts
        $clientHasPreviousContracts = false;
        if ($selectedClient) {
            $clientHasPreviousContracts = Assignment::where('client_id', $selectedClient->id)->exists();
        }

        $defaultStatus = $clientHasPreviousContracts ? 'Changement' : 'Nouvelle';

        // If client is chosen, profiles must be the ones suggested/accepted for this client (excluding already assigned)
        if ($selectedClient) {
            $clientSuggestions = $suggestions->where('client_id', $selectedClient->id);
            $profiles = $clientSuggestions->pluck('profile')->filter()->unique('id')->values();
            $clients = collect([$selectedClient]);
        } elseif ($selectedProfile) {
            $profileSuggestions = $suggestions->where('profile_id', $selectedProfile->id);
            $clients = $profileSuggestions->pluck('client')->filter()->unique('id')->values();
            $profiles = collect([$selectedProfile]);
        } else {
            // Grouped from all suggestions
            $clients = $suggestions->pluck('client')->filter()->unique('id')->values();
            $profiles = $suggestions->pluck('profile')->filter()->unique('id')->values();
        }

        return Inertia::render('Assignments/Create', [
            'selectedClient' => $selectedClient,
            'selectedProfile' => $selectedProfile,
            'clients' => $clients,
            'profiles' => $profiles,
            'suggestions' => $suggestions,
            'defaultStatus' => $defaultStatus,
            'clientHasPreviousContracts' => $clientHasPreviousContracts,
        ]);
    }

    public function store(AssignmentRequest $request)
    {
        $data = $request->validated();
        
        // Auto-assign user
        if (empty($data['user_id'])) {
            $data['user_id'] = auth()->id();
        }

        // Auto-detect status if not provided or default
        if (empty($data['status'])) {
            $hasPrevious = Assignment::where('client_id', $data['client_id'])->exists();
            $data['status'] = $hasPrevious ? 'Changement' : 'Nouvelle';
        }

        $assignment = Assignment::create($data);

        // Update profile status to Affecté(e)
        Profile::where('id', $assignment->profile_id)->update(['status' => 'Affecté(e)']);

        // Automatically mark the suggestion as accepted if it was pending
        Suggestion::where('client_id', $assignment->client_id)
            ->where('profile_id', $assignment->profile_id)
            ->update(['status' => 'accepted']);

        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat créé avec succès.');
    }

    public function show(Assignment $assignment)
    {
        $assignment->load(['client', 'profile']);
        return Inertia::render('Assignments/Show', [
            'assignment' => $assignment
        ]);
    }

    public function edit(Assignment $assignment)
    {
        $assignment->load(['client', 'profile', 'contractRequests.requester', 'contractRequests.approver', 'latestContractRequest.requester']);


        // Suggestions for this client excluding profiles assigned to other active contracts
        $assignedProfileIds = Assignment::whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
            ->where('id', '!=', $assignment->id)
            ->pluck('profile_id')
            ->unique()
            ->toArray();

        $suggestions = Suggestion::with(['profile'])
            ->where('client_id', $assignment->client_id)
            ->whereIn('status', ['pending', 'accepted', 'suggere'])
            ->whereNotIn('profile_id', $assignedProfileIds)
            ->get();

        $availableProfiles = $suggestions->pluck('profile')->filter()->unique('id')->values();
        
        // Ensure current profile is included in available profiles
        if ($assignment->profile && !$availableProfiles->contains('id', $assignment->profile->id)) {
            $availableProfiles->prepend($assignment->profile);
        }

        return Inertia::render('Assignments/Edit', [
            'assignment' => $assignment,
            'client' => $assignment->client,
            'profile' => $assignment->profile,
            'availableProfiles' => $availableProfiles,
        ]);
    }

    public function update(AssignmentRequest $request, Assignment $assignment)
    {
        $data = $request->validated();
        $oldProfileId = $assignment->profile_id;
        $newProfileId = $data['profile_id'] ?? $oldProfileId;

        // If profile was changed, status automatically becomes 'Changement'
        if ($oldProfileId != $newProfileId) {
            $data['status'] = 'Changement';

            // Free up old profile if no other active assignment
            $oldHasOtherActive = Assignment::where('profile_id', $oldProfileId)
                ->where('id', '!=', $assignment->id)
                ->whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
                ->exists();
            if (!$oldHasOtherActive) {
                Profile::where('id', $oldProfileId)->update(['status' => 'Disponible']);
            }

            // Set new profile to Affecté(e)
            Profile::where('id', $newProfileId)->update(['status' => 'Affecté(e)']);

            // Accept suggestion for new profile
            Suggestion::where('client_id', $assignment->client_id)
                ->where('profile_id', $newProfileId)
                ->update(['status' => 'accepted']);
        } elseif (isset($data['status']) && in_array($data['status'], ['completed', 'cancelled', 'Terminé', 'Annulé'])) {
            // If contract is closed, free up profile if no other active assignments
            $hasOtherActive = Assignment::where('profile_id', $assignment->profile_id)
                ->where('id', '!=', $assignment->id)
                ->whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
                ->exists();
            if (!$hasOtherActive) {
                Profile::where('id', $assignment->profile_id)->update(['status' => 'Disponible']);
            }
        }

        $assignment->update($data);
        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat mis à jour avec succès.');
    }

    public function generateContract(Assignment $assignment, \App\Services\ContractGenerator $generator)
    {
        $pdfOutput = $generator->generate($assignment);

        return response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Protocole_LavoieJob_LPS_' . $assignment->id . '.pdf"'
        ]);
    }

    public function destroy(Assignment $assignment)
    {
        $profileId = $assignment->profile_id;
        $assignment->delete();

        // Free up profile if no other active assignment
        $hasOtherActive = Assignment::where('profile_id', $profileId)
            ->whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
            ->exists();
        if (!$hasOtherActive) {
            Profile::where('id', $profileId)->update(['status' => 'Disponible']);
        }

        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat supprimé avec succès.');
    }
}
