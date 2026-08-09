<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_enable_and_confirm_two_factor_authentication(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $this->actingAs($user);

        // Step 1: Enable
        $response = $this->postJson(route('two-factor.enable'));
        $response->assertStatus(200)
            ->assertJsonStructure(['secret', 'qr_code_url', 'recovery_codes']);

        $secret = $response->json('secret');
        $this->assertNotEmpty($secret);

        // Step 2: Confirm with valid TOTP code
        $totpService = app(TwoFactorAuthenticationService::class);
        $validCode = $totpService->generateCurrentCode($secret);

        $confirmResponse = $this->postJson(route('two-factor.confirm'), [
            'code' => $validCode,
        ]);

        $confirmResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'recovery_codes']);

        $user->refresh();
        $this->assertTrue($user->hasTwoFactorEnabled());
        $this->assertEquals($secret, $user->two_factor_secret);
        $this->assertNotNull($user->two_factor_confirmed_at);
        $this->assertNotEmpty($user->two_factor_recovery_codes);
    }

    public function test_two_factor_challenge_blocks_unauthorized_login(): void
    {
        $totpService = app(TwoFactorAuthenticationService::class);
        $secret = $totpService->generateSecretKey();

        $user = User::factory()->create([
            'email' => 'secuser@lavoiejob.com',
            'password' => bcrypt('StrongPassword!123'),
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => ['REC-11111-22222', 'REC-33333-44444'],
            'status' => 'active',
        ]);

        // Login with credentials -> redirected to two-factor-challenge
        $response = $this->post('/login', [
            'email' => 'secuser@lavoiejob.com',
            'password' => 'StrongPassword!123',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();

        // Solve challenge with valid TOTP code
        $validCode = $totpService->generateCurrentCode($secret);

        $challengeResponse = $this->withSession(['login.id' => $user->id])
            ->post(route('two-factor.challenge'), [
                'code' => $validCode,
            ]);

        $challengeResponse->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
    }

    public function test_two_factor_challenge_can_be_solved_with_recovery_code(): void
    {
        $totpService = app(TwoFactorAuthenticationService::class);
        $secret = $totpService->generateSecretKey();

        $user = User::factory()->create([
            'email' => 'recuser@lavoiejob.com',
            'password' => bcrypt('StrongPassword!123'),
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => ['RECOVERY-CODE-ONE', 'RECOVERY-CODE-TWO'],
            'status' => 'active',
        ]);

        $challengeResponse = $this->withSession(['login.id' => $user->id])
            ->post(route('two-factor.challenge'), [
                'recovery_code' => 'RECOVERY-CODE-ONE',
            ]);

        $challengeResponse->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertNotContains('RECOVERY-CODE-ONE', $user->two_factor_recovery_codes);
        $this->assertContains('RECOVERY-CODE-TWO', $user->two_factor_recovery_codes);
    }
}
