<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Http\Requests\ProfileRequest;
use Inertia\Inertia;

use Illuminate\Http\Request;

class CandidateProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Profile::with('project')->latest();
        
        // Scope to projects the user is assigned to if they are not super admin
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
                     ->orWhere('matricule', 'like', '%' . $request->reference . '%')
                     ->orWhere('cin', 'like', '%' . $request->reference . '%');
            });
        })
        ->when($request->filled('nom'), function($q) use ($request) {
            $q->where('full_name', 'like', '%' . $request->nom . '%');
        })
        ->when($request->filled('ville'), function($q) use ($request) {
            $q->where('current_city', 'like', '%' . $request->ville . '%')
              ->orWhere('origin_city', 'like', '%' . $request->ville . '%');
        })
        ->when($request->filled('statut'), function($q) use ($request) {
            $q->where('status', $request->statut);
        });

        $profiles = $query->paginate(10)->withQueryString();

        // Get filter options
        $projects = $user->hasRole(['System Administrator', 'Super Admin', 'Admin']) 
            ? \App\Models\Project::orderBy('name')->get(['id', 'name'])
            : $user->projects()->orderBy('name')->get(['projects.id', 'name']);
            
        $statuses = Profile::select('status')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->pluck('status');

        return Inertia::render('Profiles/Index', [
            'profiles' => $profiles,
            'filters' => $request->only(['project_id', 'reference', 'nom', 'ville', 'statut']),
            'options' => [
                'projects' => $projects,
                'statuses' => $statuses
            ]
        ]);
    }

    public function create()
    {
        $projects = auth()->user()->hasRole('System Administrator') 
            ? \App\Models\Project::with(['jobs', 'missions'])->get() 
            : auth()->user()->projects()->with(['jobs', 'missions'])->get();

        return Inertia::render('Profiles/Create', [
            'projects' => $projects
        ]);
    }

    public function store(ProfileRequest $request)
    {
        $data = $request->validated();
        
        // Ensure Membre cannot assign to a project they don't own
        if (!auth()->user()->hasRole('System Administrator')) {
            $allowedProjectIds = auth()->user()->projects()->pluck('projects.id')->toArray();
            if (!in_array($data['project_id'], $allowedProjectIds)) {
                abort(403, 'Unauthorized project selection.');
            }
        }

        $data['criteria'] = [
            'mode_emploi' => $data['mode_emploi'] ?? null,
            'type_contrat' => $data['type_contrat'] ?? null,
            'repos' => $data['repos'] ?? null,
            'missions' => $data['missions'] ?? [],
        ];
        unset($data['mode_emploi'], $data['type_contrat'], $data['repos'], $data['missions']);

        Profile::create($data);
        return redirect()->route('profiles.index')->with('success', 'Profile created successfully.');
    }

    public function show(Profile $profile)
    {
        return Inertia::render('Profiles/Show', [
            'profile' => $profile
        ]);
    }

    public function edit(Profile $profile)
    {
        $profile->load(['assignments.client', 'suggestions.client', 'suggestions.user']);
        $projects = auth()->user()->hasRole('System Administrator') 
            ? \App\Models\Project::with(['jobs', 'missions'])->get() 
            : auth()->user()->projects()->with(['jobs', 'missions'])->get();

        return Inertia::render('Profiles/Edit', [
            'profile' => $profile,
            'projects' => $projects
        ]);
    }

    public function update(ProfileRequest $request, Profile $profile)
    {
        $data = $request->validated();
        
        // Ensure Membre cannot assign to a project they don't own
        if (!auth()->user()->hasRole('System Administrator')) {
            $allowedProjectIds = auth()->user()->projects()->pluck('projects.id')->toArray();
            if (!in_array($data['project_id'], $allowedProjectIds)) {
                abort(403, 'Unauthorized project selection.');
            }
        }

        $data['criteria'] = [
            'mode_emploi' => $data['mode_emploi'] ?? null,
            'type_contrat' => $data['type_contrat'] ?? null,
            'repos' => $data['repos'] ?? null,
            'missions' => $data['missions'] ?? [],
        ];
        unset($data['mode_emploi'], $data['type_contrat'], $data['repos'], $data['missions']);

        $profile->update($data);
        return redirect()->route('profiles.index')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Profile $profile)
    {
        $profile->delete();
        return redirect()->route('profiles.index')->with('success', 'Profile deleted successfully.');
    }
}
