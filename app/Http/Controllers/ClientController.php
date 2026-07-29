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
        $query = Client::with('project')->latest();
        
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
            $q->where(function($subQ) use ($request) {
                $subQ->where('id', $request->reference)
                     ->orWhere('c_mat', 'like', '%' . $request->reference . '%');
            });
        })
        ->when($request->filled('nom'), function($q) use ($request) {
            $q->where('c_nom', 'like', '%' . $request->nom . '%');
        })
        ->when($request->filled('ville'), function($q) use ($request) {
            $q->where('c_ville_a', 'like', '%' . $request->ville . '%');
        })
        ->when($request->filled('statut'), function($q) use ($request) {
            $q->where('c_statut', $request->statut);
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
        
        $statuses = Client::select('c_statut')
            ->whereNotNull('c_statut')
            ->where('c_statut', '!=', '')
            ->distinct()
            ->pluck('c_statut');

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
            'projects' => $projects
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
        $client->load(['assignments.profile', 'suggestions.profile', 'suggestions.user']);
        $projects = auth()->user()->hasRole('System Administrator') 
            ? \App\Models\Project::with(['jobs', 'missions'])->get() 
            : auth()->user()->projects()->with(['jobs', 'missions'])->get();

        $profiles = Profile::orderBy('full_name')->get();

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'projects' => $projects,
            'profiles' => $profiles
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
