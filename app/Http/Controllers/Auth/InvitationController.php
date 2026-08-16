<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MemberWelcomeConfirmationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    /**
     * Show the invitation acceptance form.
     */
    public function create(string $token): Response|RedirectResponse
    {
        $user = User::where('invitation_token', $token)
            ->where(function ($q) {
                $q->whereNull('invitation_expires_at')
                  ->orWhere('invitation_expires_at', '>', now());
            })
            ->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Ce lien d\'invitation est invalide ou a expiré. Veuillez contacter votre administrateur.');
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'email' => $user->email,
            'name' => $user->name,
        ]);
    }

    /**
     * Complete invitation setup, set password, activate account and auto-login.
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $user = User::where('invitation_token', $token)
            ->where(function ($q) {
                $q->whereNull('invitation_expires_at')
                  ->orWhere('invitation_expires_at', '>', now());
            })
            ->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Ce lien d\'invitation est invalide ou a expiré.');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone_1' => ['nullable', 'string', 'max:20'],
            'phone_2' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'in:Marketing,RH,Gestion'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ], [
            'password.required' => 'Veuillez saisir votre nouveau mot de passe.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'avatar.image' => 'Le fichier doit être une image.',
            'avatar.max' => 'L\'image ne doit pas dépasser 2Mo.',
        ]);

        $avatarPath = $user->avatar;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update([
            'password' => Hash::make($validated['password']),
            'phone_1' => $validated['phone_1'] ?? $user->phone_1,
            'phone_2' => $validated['phone_2'] ?? $user->phone_2,
            'city' => $validated['city'] ?? $user->city,
            'avatar' => $avatarPath,
            'status' => 'active',
            'email_verified_at' => $user->email_verified_at ?? now(),
            'invitation_token' => null,
            'invitation_expires_at' => null,
        ]);

        // Sync Spatie roles with the chosen department
        $rolesToSync = [];
        if (!empty($user->role)) {
            $rolesToSync[] = $user->role;
            Role::firstOrCreate(['name' => $user->role, 'guard_name' => 'web']);
        }
        
        if (!empty($validated['department'])) {
            $rolesToSync[] = $validated['department'];
            Role::firstOrCreate(['name' => $validated['department'], 'guard_name' => 'web']);
        }
        
        if (!empty($rolesToSync)) {
            $user->syncRoles($rolesToSync);
        }

        // Automatically log in the user
        Auth::login($user);
        $request->session()->regenerate();

        // Send welcome confirmation email
        try {
            $user->notify(new MemberWelcomeConfirmationNotification($user));
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect()->route('dashboard')->with('success', 'Bienvenue ' . $user->name . ' ! Votre compte a été activé avec succès.');
    }
}
