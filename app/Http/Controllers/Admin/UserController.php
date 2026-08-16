<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

use Illuminate\Support\Str;
use App\Notifications\MemberInvitationNotification;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::with(['roles', 'projects'])->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->where('role', $roleFilter);
        }

        $users = $query->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
            ],
            'roles' => Role::all(),
            'projects' => Project::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::all(),
            'projects' => Project::all(),
            'availablePrimaryRoles' => [
                ['value' => 'Membre', 'label' => 'Membre (Opérationnel)', 'description' => 'Accès restreint aux candidats, clients et projets qui lui sont assignés.'],
                ['value' => 'Admin', 'label' => 'Admin', 'description' => 'Gestion globale opérationnelle, création de contrats, gestion clients/candidats.'],
                ['value' => 'Super Admin', 'label' => 'Super Admin', 'description' => 'Contrôle complet, approbation de contrats, configuration et gestion des membres.'],
                ['value' => 'System Administrator', 'label' => 'System Administrator', 'description' => 'Accès technique total et configuration de la plateforme.'],
                ['value' => 'Developer', 'label' => 'Développeur', 'description' => 'Accès développeur complet à toutes les fonctionnalités et paramètres du système sans restriction.'],
            ],
            'permissions' => Permission::all(),
            'roles' => Role::whereIn('name', ['Marketing', 'RH', 'Gestion'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'nullable|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'projects' => 'required|array|min:1',
            'projects.*' => 'exists:projects,id',
        ], [
            'name.required' => 'Le nom complet du membre est obligatoire.',
            'email.required' => 'L\'adresse e-mail professionnelle est obligatoire.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'projects.required' => 'Veuillez assigner au moins un projet au membre.',
            'projects.min' => 'Veuillez sélectionner au moins un projet.',
        ]);

        $assignedRole = $validated['role'] ?? 'Membre';
        $token = Str::random(64);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(32)), // Random hash until activated by the user
            'role' => $assignedRole,
            'status' => 'pending',
            'invitation_token' => $token,
            'invitation_expires_at' => now()->addHours(48),
        ]);

        // Sync Spatie roles (Only allow valid secondary roles + the new primary role)
        $permittedSecondaryRoles = ['Marketing', 'RH', 'Gestion'];
        $rolesToSync = array_intersect($validated['roles'] ?? [], $permittedSecondaryRoles);
        
        if (!in_array($assignedRole, $rolesToSync)) {
            $rolesToSync[] = $assignedRole;
        }

        foreach ($rolesToSync as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }
        $user->syncRoles($rolesToSync);

        // Sync Direct Permissions
        $permissionsToSync = $validated['permissions'] ?? [];
        if (!empty($permissionsToSync)) {
            $user->syncPermissions($permissionsToSync);
        }

        // Sync Assigned Projects
        if (!empty($validated['projects'])) {
            $user->projects()->sync($validated['projects']);
        }

        // Send Invitation Email
        try {
            $user->notify(new MemberInvitationNotification($user, $token));
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect()->route('admin.users.index')->with('success', 'Invitation envoyée avec succès à ' . $user->name . '. Un lien d\'activation sécurisé lui a été transmis.');
    }

    public function resendInvitation(User $user)
    {
        if ($user->status !== 'pending') {
            return redirect()->back()->with('error', 'Ce compte est déjà actif.');
        }

        $token = Str::random(64);
        $user->update([
            'invitation_token' => $token,
            'invitation_expires_at' => now()->addHours(48),
        ]);

        try {
            $user->notify(new MemberInvitationNotification($user, $token));
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect()->back()->with('success', 'Une nouvelle invitation sécurisée a été envoyée à ' . $user->email . '.');
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        $permissions = Permission::all();
        $projects = Project::all();
        $user->load('roles', 'permissions', 'projects');

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load(['projects', 'roles', 'permissions']),
            'roles' => Role::whereIn('name', ['Marketing', 'RH', 'Gestion'])->get(),
            'permissions' => Permission::all(),
            'projects' => Project::all(),
            'availablePrimaryRoles' => [
                ['value' => 'Membre', 'label' => 'Membre (Opérationnel)'],
                ['value' => 'Admin', 'label' => 'Admin'],
                ['value' => 'Super Admin', 'label' => 'Super Admin'],
                ['value' => 'System Administrator', 'label' => 'System Administrator'],
                ['value' => 'Client', 'label' => 'Client'],
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => 'required|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'projects' => 'nullable|array',
            'projects.*' => 'exists:projects,id',
        ], [
            'name.required' => 'Le nom complet est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'role.required' => 'Veuillez sélectionner un rôle principal.',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Sync Spatie roles (Only allow valid secondary roles + the new primary role)
        $permittedSecondaryRoles = ['Marketing', 'RH', 'Gestion'];
        $rolesToSync = array_intersect($validated['roles'] ?? [], $permittedSecondaryRoles);
        
        if (!empty($validated['role']) && !in_array($validated['role'], $rolesToSync)) {
            $rolesToSync[] = $validated['role'];
        }

        if (!empty($rolesToSync)) {
            foreach ($rolesToSync as $roleName) {
                Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            }
            $user->syncRoles($rolesToSync);
        } else {
            $user->syncRoles([]);
        }

        // Sync Direct Permissions
        $permissionsToSync = $validated['permissions'] ?? [];
        if (!empty($permissionsToSync)) {
            $user->syncPermissions($permissionsToSync);
        } else {
            $user->syncPermissions([]);
        }

        // Sync projects
        if (isset($validated['projects'])) {
            $user->projects()->sync($validated['projects']);
        }

        return redirect()->route('admin.users.index')->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(Request $request, User $user)
    {
        if ((int) $request->user()->id === (int) $user->id) {
            return redirect()->route('admin.users.index')->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Utilisateur supprimé avec succès.');
    }
}
