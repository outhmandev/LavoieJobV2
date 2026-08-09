<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MemberWelcomeConfirmationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
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
        ], [
            'password.required' => 'Veuillez saisir votre nouveau mot de passe.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'email_verified_at' => $user->email_verified_at ?? now(),
            'invitation_token' => null,
            'invitation_expires_at' => null,
        ]);

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
