<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TwoFactorAuthenticationController extends Controller
{
    protected TwoFactorAuthenticationService $tfaService;

    public function __construct(TwoFactorAuthenticationService $tfaService)
    {
        $this->tfaService = $tfaService;
    }

    /**
     * Start enabling 2FA: generate secret and recovery codes without confirming yet.
     */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $secret = $this->tfaService->generateSecretKey();
        $recoveryCodes = $this->tfaService->generateRecoveryCodes();
        $qrCodeUrl = $this->tfaService->getQrCodeUrl('LavoieJob', $user->email, $secret);

        // Store temporarily in session until confirmed
        $request->session()->put('two_factor_temp_secret', $secret);
        $request->session()->put('two_factor_temp_recovery_codes', $recoveryCodes);

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Confirm 2FA with 6-digit code and activate it.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ], [
            'code.required' => 'Le code à 6 chiffres est obligatoire.',
            'code.size' => 'Le code doit comporter exactement 6 chiffres.',
        ]);

        $secret = $request->session()->get('two_factor_temp_secret');
        $recoveryCodes = $request->session()->get('two_factor_temp_recovery_codes');

        if (!$secret) {
            throw ValidationException::withMessages([
                'code' => ['La session de configuration 2FA a expiré. Veuillez recommencer.'],
            ]);
        }

        if (!$this->tfaService->verifyCode($secret, $request->code)) {
            throw ValidationException::withMessages([
                'code' => ['Code de vérification invalide. Veuillez vérifier l\'heure de votre appareil et réessayer.'],
            ]);
        }

        $user = $request->user();
        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => now(),
        ]);

        $request->session()->forget(['two_factor_temp_secret', 'two_factor_temp_recovery_codes']);

        return response()->json([
            'success' => true,
            'message' => 'Authentification à deux facteurs activée avec succès.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Disable 2FA with password confirmation.
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'Votre mot de passe est requis pour désactiver le 2FA.',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe saisi est incorrect.'],
            ]);
        }

        $user = $request->user();
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'L\'authentification à deux facteurs a été désactivée.',
        ]);
    }

    /**
     * Get remaining recovery codes.
     */
    public function getRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasTwoFactorEnabled()) {
            return response()->json(['recovery_codes' => []]);
        }

        $codes = is_array($user->two_factor_recovery_codes)
            ? $user->two_factor_recovery_codes
            : (json_decode($user->two_factor_recovery_codes ?? '[]', true) ?: []);

        return response()->json([
            'recovery_codes' => $codes,
        ]);
    }

    /**
     * Regenerate new recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe saisi est incorrect.'],
            ]);
        }

        $user = $request->user();
        $newCodes = $this->tfaService->generateRecoveryCodes();
        
        $user->update([
            'two_factor_recovery_codes' => $newCodes,
        ]);

        return response()->json([
            'success' => true,
            'recovery_codes' => $newCodes,
            'message' => 'Nouveaux codes de récupération générés.',
        ]);
    }
}
