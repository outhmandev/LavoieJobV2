<?php

namespace App\Notifications;

use App\Models\ContractRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractGenerationFailedNotification extends Notification
{
    use Queueable;

    protected ContractRequest $contractRequest;
    protected string $errorMessage;

    public function __construct(ContractRequest $contractRequest, string $errorMessage = '')
    {
        $this->contractRequest = $contractRequest;
        $this->errorMessage = $errorMessage;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $clientName = $this->contractRequest->client->nom ?? 'Client';

        return [
            'contract_request_id' => $this->contractRequest->id,
            'title' => 'Échec de la Génération du Contrat #' . $this->contractRequest->id,
            'message' => "La génération du contrat pour le client '{$clientName}' a échoué. " . ($this->errorMessage ? "Erreur : {$this->errorMessage}" : ""),
            'type' => 'warning',
            'action_url' => route('contract-requests.index'),
            'client_name' => $clientName,
            'error_message' => $this->errorMessage,
        ];
    }
}
