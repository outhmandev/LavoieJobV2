<?php

namespace App\Notifications;

use App\Models\ContractRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractRequestSubmittedNotification extends Notification
{
    use Queueable;

    protected ContractRequest $contractRequest;

    public function __construct(ContractRequest $contractRequest)
    {
        $this->contractRequest = $contractRequest;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $clientName = $this->contractRequest->client->nom ?? 'Client';
        $profileName = $this->contractRequest->profile->full_name ?? 'Candidat';
        $requesterName = $this->contractRequest->requester->name ?? 'Un membre';

        return [
            'contract_request_id' => $this->contractRequest->id,
            'title' => 'Nouvelle Demande de Contrat #' . $this->contractRequest->id,
            'message' => "{$requesterName} a soumis une demande de contrat pour le client '{$clientName}' et le candidat '{$profileName}'.",
            'type' => 'info',
            'action_url' => route('contract-requests.index'),
            'client_name' => $clientName,
            'profile_name' => $profileName,
            'requester_name' => $requesterName,
        ];
    }
}
