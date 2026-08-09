<?php

namespace App\Events;

use App\Models\ContractRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContractRequestUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $requestData;
    public string $action;
    public string $message;

    public function __construct(ContractRequest $request, string $action, string $message = '')
    {
        $request->loadMissing(['client', 'profile', 'assignment', 'requester', 'approver']);

        $this->action = $action;
        $this->message = $message;
        $this->requestData = [
            'id' => $request->id,
            'assignment_id' => $request->assignment_id,
            'client_id' => $request->client_id,
            'profile_id' => $request->profile_id,
            'requested_by' => $request->requested_by,
            'approved_by' => $request->approved_by,
            'status' => $request->status,
            'rejection_reason' => $request->rejection_reason,
            'error_message' => $request->error_message,
            'file_name' => $request->file_name,
            'approved_at' => $request->approved_at ? $request->approved_at->toIso8601String() : null,
            'completed_at' => $request->completed_at ? $request->completed_at->toIso8601String() : null,
            'created_at' => $request->created_at ? $request->created_at->toIso8601String() : null,
            'client' => $request->client ? [
                'id' => $request->client->id,
                'nom' => $request->client->nom ?? $request->client->c_nom ?? 'N/A',
                'c_nom' => $request->client->c_nom ?? $request->client->nom ?? 'N/A',
                'phone' => $request->client->phone ?? $request->client->c_gsm1 ?? '',
            ] : null,
            'profile' => $request->profile ? [
                'id' => $request->profile->id,
                'full_name' => $request->profile->full_name ?? $request->profile->nom ?? 'N/A',
                'matricule' => $request->profile->matricule ?? $request->profile->mat ?? '',
            ] : null,
            'requester' => $request->requester ? [
                'id' => $request->requester->id,
                'name' => $request->requester->name,
                'role' => $request->requester->role,
            ] : null,
            'approver' => $request->approver ? [
                'id' => $request->approver->id,
                'name' => $request->approver->name,
            ] : null,
        ];
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('contract-requests.admin'),
            new Channel('contract-requests.' . $this->requestData['id']),
        ];

        if (!empty($this->requestData['requested_by'])) {
            $channels[] = new PrivateChannel('App.Models.User.' . $this->requestData['requested_by']);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'ContractRequestUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'request' => $this->requestData,
            'action' => $this->action,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
