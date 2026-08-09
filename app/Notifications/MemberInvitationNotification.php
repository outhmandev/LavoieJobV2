<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberInvitationNotification extends Notification
{
    use Queueable;

    protected User $user;
    protected string $token;

    public function __construct(User $user, string $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invitationUrl = url('/invitations/' . $this->token);
        $projectsList = $this->user->projects->pluck('name')->join(', ') ?: 'Général / Non assigné';

        return (new MailMessage)
            ->subject('Invitation à rejoindre la plateforme LavoieJob')
            ->greeting('Bonjour ' . $this->user->name . ',')
            ->line('Vous avez été invité(e) par un administrateur à rejoindre l\'espace collaboratif de LavoieJob en tant que membre de l\'équipe.')
            ->line('**Détails de votre affectation :**')
            ->line('• **Rôle :** Membre opérationnel')
            ->line('• **Projet(s) assigné(s) :** ' . $projectsList)
            ->line('• **Adresse e-mail :** ' . $this->user->email)
            ->action('Activer mon compte & définir mon mot de passe', $invitationUrl)
            ->line('Ce lien d\'invitation sécurisé à usage unique expirera dans 48 heures.')
            ->line('Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.')
            ->salutation('Cordialement, L\'équipe LavoieJob');
    }
}
