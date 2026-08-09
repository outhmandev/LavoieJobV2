<?php

namespace App\Notifications;

use App\Models\ContractRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractReadyNotification extends Notification
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

        return [
            'contract_request_id' => $this->contractRequest->id,
            'title' => 'Contrat Prêt et Téléchargeable #' . $this->contractRequest->id,
            'message' => "Le contrat PDF pour le client '{$clientName}' a été généré avec succès. Vous pouvez maintenant le télécharger.",
            'type' => 'success',
            'action_url' => route('contract-requests.download', $this->contractRequest->id),
            'client_name' => $clientName,
            'file_name' => $this->contractRequest->file_name,
        ];
    }
}
