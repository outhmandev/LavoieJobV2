<?php

namespace App\Notifications;

use App\Models\ContractRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractRequestRejectedNotification extends Notification
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
        $reason = $this->contractRequest->rejection_reason;
        $reasonText = $reason ? " Motif : \"{$reason}\"" : "";

        return [
            'contract_request_id' => $this->contractRequest->id,
            'title' => 'Demande de Contrat Refusée #' . $this->contractRequest->id,
            'message' => "Votre demande de contrat pour le client '{$clientName}' a été refusée.{$reasonText}",
            'type' => 'warning',
            'action_url' => route('contract-requests.index'),
            'client_name' => $clientName,
            'rejection_reason' => $reason,
        ];
    }
}
