<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberWelcomeConfirmationNotification extends Notification
{
    use Queueable;

    protected User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = route('login');
        $projectsList = $this->user->projects->pluck('name')->join(', ') ?: 'Général / Non assigné';

        return (new MailMessage)
            ->subject('Confirmation d\'activation de votre compte LavoieJob')
            ->greeting('Félicitations ' . $this->user->name . ' !')
            ->line('Votre compte a été activé avec succès. Vous pouvez dès à présent accéder à votre espace de travail.')
            ->line('**Récapitulatif de votre compte :**')
            ->line('• **Nom :** ' . $this->user->name)
            ->line('• **Identifiant (E-mail) :** ' . $this->user->email)
            ->line('• **Rôle :** ' . ($this->user->role ?? 'Membre'))
            ->line('• **Projet(s) rattaché(s) :** ' . $projectsList)
            ->action('Accéder à la plateforme', $loginUrl)
            ->line('*(Pour des raisons strictes de sécurité, votre mot de passe n\'est jamais mentionné dans nos communications).*')
            ->line('Si vous avez des questions ou besoin d\'assistance, n\'hésitez pas à contacter votre administrateur système.')
            ->salutation('Bienvenue dans l\'équipe, L\'équipe LavoieJob');
    }
}
