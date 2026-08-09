<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use App\Http\Requests\ClientRequest;
use Inertia\Inertia;

use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Client::with('project')->orderByDesc('id');
        
        // Scope to projects the user is assigned to if they are not admin
        if (!$user->hasRole(['System Administrator', 'Super Admin', 'Admin'])) {
            $projectIds = $user->projects()->pluck('projects.id');
            $query->whereIn('project_id', $projectIds);
        }

        // Apply filters
        $query->when($request->filled('project_id'), function($q) use ($request) {
            $q->where('project_id', $request->project_id);
        })
        ->when($request->filled('cin'), function($q) use ($request) {
            $q->where('cin', 'like', '%' . trim($request->cin) . '%');
        })
        ->when($request->filled('reference'), function($q) use ($request) {
            $val = trim($request->reference);
            $q->where('mat', $val);
        })
        ->when($request->filled('nom'), function($q) use ($request) {
            $q->where('nom', 'like', '%' . $request->nom . '%');
        })
        ->when($request->filled('ville'), function($q) use ($request) {
            $q->where('ville_a', 'like', '%' . $request->ville . '%');
        })
        ->when($request->filled('statut'), function($q) use ($request) {
            $q->where('statut', $request->statut);
        })
        ->when($request->filled('membre'), function($q) use ($request) {
            $q->where('user_id', $request->membre);
        });

        $clients = $query->paginate(10)->withQueryString();

        // Get filter options
        $projects = $user->hasRole(['System Administrator', 'Super Admin', 'Admin']) 
            ? \App\Models\Project::orderBy('name')->get(['id', 'name'])
            : $user->projects()->orderBy('name')->get(['projects.id', 'name']);
            
        $membres = \App\Models\User::orderBy('name')->get(['id', 'name']);
        
        $dbStatuses = Client::select('statut')
            ->whereNotNull('statut')
            ->where('statut', '!=', '')
            ->distinct()
            ->pluck('statut')
            ->toArray();

        $statuses = array_values(array_unique(array_merge(Client::STATUSES, $dbStatuses)));

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['project_id', 'cin', 'reference', 'nom', 'ville', 'statut', 'membre']),
            'options' => [
                'projects' => $projects,
                'membres' => $membres,
                'statuses' => $statuses
            ]
        ]);
    }

    public function create()
    {
        $projects = auth()->user()->hasRole(['System Administrator', 'Super Admin', 'Admin']) 
            ? \App\Models\Project::with(['jobs', 'missions'])->get() 
            : auth()->user()->projects()->with(['jobs', 'missions'])->get();

        return Inertia::render('Clients/Create', [
            'projects' => $projects,
            'statuses' => Client::STATUSES,
            'nextMatricule' => Client::generateNextMatricule(),
        ]);
    }

    public function store(ClientRequest $request)
    {
        $data = $request->validated();
        
        // Ensure Membre cannot assign to a project they don't own
        if (!auth()->user()->hasRole(['System Administrator', 'Super Admin', 'Admin'])) {
            $allowedProjectIds = auth()->user()->projects()->pluck('projects.id')->toArray();
            if (!in_array($data['project_id'], $allowedProjectIds)) {
                abort(403, 'Unauthorized project selection.');
            }
        }

        $data['user_id'] = $data['user_id'] ?? auth()->id();
        if (empty($data['mat']) || (int)$data['mat'] === 0) {
            $data['mat'] = Client::generateNextMatricule();
        }
        if (empty($data['m_mat']) || (int)$data['m_mat'] === 0) {
            $data['m_mat'] = $data['mat'];
        }
        if (empty($data['inscription_date'])) {
            $data['inscription_date'] = now();
        }

        Client::create($data);
        return redirect()->route('clients.index')->with('success', 'Client créé avec succès.');
    }

    public function show(Client $client)
    {
        return Inertia::render('Clients/Show', [
            'client' => $client
        ]);
    }

    public function edit(Client $client)
    {
        $client->load(['assignments.profile', 'assignments.user', 'suggestions.profile', 'suggestions.user']);
        $user = auth()->user();
        $projects = $user->hasRole(['System Administrator', 'Super Admin', 'Admin']) 
            ? \App\Models\Project::with(['jobs', 'missions'])->get() 
            : $user->projects()->with(['jobs', 'missions'])->get();

        // Profiles currently in an active contract/assignment
        $assignedProfileIds = Assignment::whereIn('status', ['active', 'Nouvelle', 'Nouvel', 'Changement'])
            ->pluck('profile_id')
            ->unique()
            ->toArray();

        // Optimized: only select available candidate profiles not currently in contract
        $profiles = Profile::select([
            'id', 'full_name', 'avatar', 'education_specialty', 'rate',
            'birth_date', 'current_city', 'experience_years', 'mobility',
            'max_price', 'status'
        ])
        ->where(function($q) {
            $q->where('status', 'Disponible')
              ->orWhere('status', 'dISPONIBE')
              ->orWhereNull('status');
        })
        ->whereNotIn('id', $assignedProfileIds)
        ->orderByDesc('id')
        ->limit(30)
        ->get();

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'projects' => $projects,
            'profiles' => $profiles,
            'assignedProfileIds' => $assignedProfileIds,
            'statuses' => Client::STATUSES,
        ]);
    }

    public function update(ClientRequest $request, Client $client)
    {
        $data = $request->validated();
        
        // Ensure Membre cannot assign to a project they don't own
        if (!auth()->user()->hasRole(['System Administrator', 'Super Admin', 'Admin'])) {
            $allowedProjectIds = auth()->user()->projects()->pluck('projects.id')->toArray();
            if (!in_array($data['project_id'], $allowedProjectIds)) {
                abort(403, 'Sélection de projet non autorisée.');
            }
        }

        if (empty($data['mat']) || (int)$data['mat'] === 0) {
            $data['mat'] = $client->mat ?: Client::generateNextMatricule();
        }
        if (empty($data['m_mat']) || (int)$data['m_mat'] === 0) {
            $data['m_mat'] = $client->m_mat ?: $data['mat'];
        }

        $data['edit_date'] = now();

        $client->update($data);
        return redirect()->route('clients.index')->with('success', 'Client mis à jour avec succès.');
    }

    public function destroy(Client $client)
    {
        $user = auth()->user();
        if (!$user->hasRole(['System Administrator', 'Super Admin', 'Admin'])) {
            $allowedProjectIds = $user->projects()->pluck('projects.id')->toArray();
            if ($client->project_id && !in_array($client->project_id, $allowedProjectIds)) {
                abort(403, 'Action non autorisée.');
            }
        }

        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client supprimé avec succès.');
    }
}
