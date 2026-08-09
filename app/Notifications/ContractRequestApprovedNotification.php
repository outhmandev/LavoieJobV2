<?php

namespace App\Notifications;

use App\Models\ContractRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractRequestApprovedNotification extends Notification
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
        $approverName = $this->contractRequest->approver->name ?? 'Super Admin';

        return [
            'contract_request_id' => $this->contractRequest->id,
            'title' => 'Demande de Contrat Approuvée #' . $this->contractRequest->id,
            'message' => "Votre demande de contrat pour le client '{$clientName}' a été approuvée par {$approverName}. La génération est lancée.",
            'type' => 'success',
            'action_url' => route('contract-requests.index'),
            'client_name' => $clientName,
            'approver_name' => $approverName,
        ];
    }
}
