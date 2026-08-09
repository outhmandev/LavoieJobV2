<?php

namespace Tests\Feature\Auth;

use App\Models\Project;
use App\Models\User;
use App\Notifications\MemberInvitationNotification;
use App\Notifications\MemberWelcomeConfirmationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_invite_member_and_trigger_notification(): void
    {
        Notification::fake();

        Role::firstOrCreate(['name' => 'System Administrator']);
        Role::firstOrCreate(['name' => 'Membre']);

        $admin = User::factory()->create([
            'role' => 'System Administrator',
            'status' => 'active',
        ]);
        $admin->assignRole('System Administrator');

        $project = Project::create([
            'name' => 'Project Alpha',
            'color' => '#4F46E5',
        ]);

        $this->actingAs($admin);

        $response = $this->post(route('admin.users.store'), [
            'name' => 'Jean Dupont',
            'email' => 'jean.dupont@lavoiejob.com',
            'projects' => [$project->id],
            'role' => 'Membre',
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Jean Dupont',
            'email' => 'jean.dupont@lavoiejob.com',
            'status' => 'pending',
        ]);

        $invitedUser = User::where('email', 'jean.dupont@lavoiejob.com')->first();
        $this->assertNotNull($invitedUser->invitation_token);
        $this->assertTrue($invitedUser->hasPendingInvitation());

        Notification::assertSentTo(
            $invitedUser,
            MemberInvitationNotification::class
        );
    }

    public function test_invited_member_can_accept_invitation_and_set_password(): void
    {
        Notification::fake();

        $token = Str::random(64);
        $user = User::factory()->create([
            'name' => 'Sophie Martin',
            'email' => 'sophie.martin@lavoiejob.com',
            'invitation_token' => $token,
            'invitation_expires_at' => now()->addDays(7),
            'status' => 'pending',
        ]);

        // Visit accept page
        $acceptPageResponse = $this->get(route('invitations.accept', ['token' => $token]));
        $acceptPageResponse->assertStatus(200);

        // Submit new password
        $submitResponse = $this->post(route('invitations.store', ['token' => $token]), [
            'password' => 'SecurePass#2026',
            'password_confirmation' => 'SecurePass#2026',
        ]);

        $submitResponse->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertEquals('active', $user->status);
        $this->assertNull($user->invitation_token);
        $this->assertNotNull($user->email_verified_at);

        Notification::assertSentTo(
            $user,
            MemberWelcomeConfirmationNotification::class
        );
    }
}
