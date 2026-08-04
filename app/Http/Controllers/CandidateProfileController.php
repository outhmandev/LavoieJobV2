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
        $query = Profile::with('project')->orderByDesc('id');
        
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
            
        $dbStatuses = Profile::select('status')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->pluck('status')
            ->toArray();

        $statuses = array_values(array_unique(array_merge(Profile::STATUSES, $dbStatuses)));

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
            'projects' => $projects,
            'statuses' => Profile::STATUSES,
            'nextMatricule' => Profile::generateNextMatricule(),
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

        // Canonical mapping to real DB columns
        $canonicalMap = [
            'full_name' => $data['full_name'] ?? $data['nom'] ?? null,
            'matricule' => $data['matricule'] ?? $data['mat'] ?? null,
            'status' => $data['status'] ?? $data['statut'] ?? 'Disponible',
            'avatar' => $data['avatar'] ?? $data['file_img'] ?? null,
            'birth_date' => $data['birth_date'] ?? $data['date_naissance'] ?? null,
            'birth_city' => $data['birth_city'] ?? $data['ville_o'] ?? null,
            'nationality' => $data['nationality'] ?? $data['nationalite'] ?? 'Maroc',
            'education_level' => $data['education_level'] ?? $data['niveau'] ?? null,
            'marital_status' => $data['marital_status'] ?? $data['situation_familiale'] ?? null,
            'children_count' => $data['children_count'] ?? $data['nombre_enfant'] ?? 0,
            'cin_address' => $data['cin_address'] ?? $data['adresse_cin'] ?? null,
            'origin_city' => $data['origin_city'] ?? $data['ville_origin'] ?? null,
            'current_address' => $data['current_address'] ?? $data['current_adresse'] ?? null,
            'phone_1' => $data['phone_1'] ?? $data['gsm1'] ?? $data['gsm_1'] ?? null,
            'phone_2' => $data['phone_2'] ?? $data['gsm2'] ?? $data['gsm_2'] ?? null,
            'job' => $data['job'] ?? $data['fonction'] ?? null,
        ];

        foreach ($canonicalMap as $key => $val) {
            if ($val !== null) {
                $data[$key] = $val;
            }
        }

        if (empty($data['matricule'])) {
            $data['matricule'] = Profile::generateNextMatricule();
        }

        $data['user_id'] = $data['user_id'] ?? auth()->id();

        $data['criteria'] = [
            'mode_emploi' => $data['mode_emploi'] ?? null,
            'type_contrat' => $data['type_contrat'] ?? null,
            'repos' => $data['repos'] ?? null,
            'missions' => $data['missions'] ?? [],
            'salary_period' => $data['salary_period'] ?? 'Mensuel',
        ];
        unset($data['mode_emploi'], $data['type_contrat'], $data['repos'], $data['missions'], $data['salary_period']);
        unset($data['nom'], $data['mat'], $data['statut'], $data['file_img'], $data['date_naissance'], $data['ville_o'], $data['nationalite'], $data['niveau'], $data['situation_familiale'], $data['nombre_enfant'], $data['adresse_cin'], $data['ville_origin'], $data['current_adresse'], $data['gsm1'], $data['gsm2'], $data['gsm_1'], $data['gsm_2'], $data['fonction']);

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
            'projects' => $projects,
            'statuses' => Profile::STATUSES,
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

        // Canonical mapping to real DB columns
        $canonicalMap = [
            'full_name' => $data['full_name'] ?? $data['nom'] ?? null,
            'matricule' => $data['matricule'] ?? $data['mat'] ?? null,
            'status' => $data['status'] ?? $data['statut'] ?? 'Disponible',
            'avatar' => $data['avatar'] ?? $data['file_img'] ?? null,
            'birth_date' => $data['birth_date'] ?? $data['date_naissance'] ?? null,
            'birth_city' => $data['birth_city'] ?? $data['ville_o'] ?? null,
            'nationality' => $data['nationality'] ?? $data['nationalite'] ?? 'Maroc',
            'education_level' => $data['education_level'] ?? $data['niveau'] ?? null,
            'marital_status' => $data['marital_status'] ?? $data['situation_familiale'] ?? null,
            'children_count' => $data['children_count'] ?? $data['nombre_enfant'] ?? 0,
            'cin_address' => $data['cin_address'] ?? $data['adresse_cin'] ?? null,
            'origin_city' => $data['origin_city'] ?? $data['ville_origin'] ?? null,
            'current_address' => $data['current_address'] ?? $data['current_adresse'] ?? null,
            'phone_1' => $data['phone_1'] ?? $data['gsm1'] ?? $data['gsm_1'] ?? null,
            'phone_2' => $data['phone_2'] ?? $data['gsm2'] ?? $data['gsm_2'] ?? null,
            'job' => $data['job'] ?? $data['fonction'] ?? null,
        ];

        foreach ($canonicalMap as $key => $val) {
            if ($val !== null) {
                $data[$key] = $val;
            }
        }

        $existingCriteria = $profile->criteria ?? [];
        $data['criteria'] = array_merge($existingCriteria, [
            'mode_emploi' => $data['mode_emploi'] ?? ($existingCriteria['mode_emploi'] ?? null),
            'type_contrat' => $data['type_contrat'] ?? ($existingCriteria['type_contrat'] ?? null),
            'repos' => $data['repos'] ?? ($existingCriteria['repos'] ?? null),
            'missions' => $data['missions'] ?? ($existingCriteria['missions'] ?? []),
            'salary_period' => $data['salary_period'] ?? ($existingCriteria['salary_period'] ?? 'Mensuel'),
        ]);
        unset($data['mode_emploi'], $data['type_contrat'], $data['repos'], $data['missions'], $data['salary_period']);
        unset($data['nom'], $data['mat'], $data['statut'], $data['file_img'], $data['date_naissance'], $data['ville_o'], $data['nationalite'], $data['niveau'], $data['situation_familiale'], $data['nombre_enfant'], $data['adresse_cin'], $data['ville_origin'], $data['current_adresse'], $data['gsm1'], $data['gsm2'], $data['gsm_1'], $data['gsm_2'], $data['fonction']);

        $profile->update($data);
        return redirect()->route('profiles.index')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Profile $profile)
    {
        $profile->delete();
        return redirect()->route('profiles.index')->with('success', 'Profile deleted successfully.');
    }
}
