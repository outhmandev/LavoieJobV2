<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    protected TwoFactorAuthenticationService $tfaService;

    public function __construct(TwoFactorAuthenticationService $tfaService)
    {
        $this->tfaService = $tfaService;
    }

    /**
     * Display the 2FA challenge view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (!$request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Verify the 2FA code or recovery code.
     */
    public function store(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login.id');
        $remember = $request->session()->get('login.remember', false);

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $authenticated = false;

        // Try TOTP code first
        if ($request->filled('code')) {
            if ($this->tfaService->verifyCode($user->two_factor_secret, $request->code)) {
                $authenticated = true;
            }
        }

        // Otherwise try recovery code
        if (!$authenticated && $request->filled('recovery_code')) {
            if ($this->tfaService->verifyAndConsumeRecoveryCode($user, $request->recovery_code)) {
                $authenticated = true;
            }
        }

        if (!$authenticated) {
            throw ValidationException::withMessages([
                'code' => ['Le code d\'authentification à deux facteurs fourni est invalide.'],
            ]);
        }

        Auth::login($user, $remember);
        $request->session()->forget(['login.id', 'login.remember']);
        $request->session()->regenerate();

        if (strtolower($user->role ?? '') === 'client') {
            return redirect()->intended(route('portal.dashboard'));
        }

        return redirect()->intended(route('dashboard'));
    }
}
