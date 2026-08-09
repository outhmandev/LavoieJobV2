<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private chat channel between two users
Broadcast::channel('chat.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public presence channel
Broadcast::channel('chat.public', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Admin channel for all contract request notifications and updates
Broadcast::channel('contract-requests.admin', function ($user) {
    return $user->isSuperAdmin();
});

// Channel for specific contract request live updates
Broadcast::channel('contract-requests.{id}', function ($user, $id) {
    if ($user->isSuperAdmin()) {
        return true;
    }
    $contractRequest = \App\Models\ContractRequest::find($id);
    return $contractRequest && (int) $contractRequest->requested_by === (int) $user->id;
});

