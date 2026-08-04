<?php

namespace App\Http\Controllers;

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
        ->when($request->filled('reference'), function($q) use ($request) {
            $subQ = $request->reference;
            $q->where(function($sq) use ($subQ) {
                $sq->where('id', $subQ)
                   ->orWhere('mat', 'like', '%' . $subQ . '%');
            });
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
            'filters' => $request->only(['project_id', 'reference', 'nom', 'ville', 'statut', 'membre']),
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

        Client::create($data);
        return redirect()->route('clients.index')->with('success', 'Client created successfully.');
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

        // Optimized: only select lightweight candidate profiles for suggestions
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
        ->orderByDesc('id')
        ->limit(30)
        ->get();

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'projects' => $projects,
            'profiles' => $profiles,
            'statuses' => Client::STATUSES,
        ]);
    }

    public function update(ClientRequest $request, Client $client)
    {
        $data = $request->validated();
        
        // Ensure Membre cannot assign to a project they don't own
        if (!auth()->user()->hasRole('System Administrator')) {
            $allowedProjectIds = auth()->user()->projects()->pluck('projects.id')->toArray();
            if (!in_array($data['project_id'], $allowedProjectIds)) {
                abort(403, 'Unauthorized project selection.');
            }
        }

        $client->update($data);
        return redirect()->route('clients.index')->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client deleted successfully.');
    }
}
