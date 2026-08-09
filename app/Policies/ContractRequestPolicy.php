<?php

namespace App\Policies;

use App\Models\ContractRequest;
use App\Models\User;

class ContractRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ContractRequest $contractRequest): bool
    {
        return $user->isSuperAdmin() || (int) $contractRequest->requested_by === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isMember() || $user->isAdmin() || $user->isSuperAdmin();
    }

    public function approve(User $user, ContractRequest $contractRequest): bool
    {
        return $user->isSuperAdmin() && in_array($contractRequest->status, [ContractRequest::STATUS_PENDING, ContractRequest::STATUS_FAILED]);
    }

    public function reject(User $user, ContractRequest $contractRequest): bool
    {
        return $user->isSuperAdmin() && $contractRequest->status === ContractRequest::STATUS_PENDING;
    }

    public function cancel(User $user, ContractRequest $contractRequest): bool
    {
        return ((int) $contractRequest->requested_by === (int) $user->id || $user->isSuperAdmin())
            && $contractRequest->status === ContractRequest::STATUS_PENDING;
    }

    public function download(User $user, ContractRequest $contractRequest): bool
    {
        return ($user->isSuperAdmin() || (int) $contractRequest->requested_by === (int) $user->id)
            && $contractRequest->status === ContractRequest::STATUS_COMPLETED;
    }

    public function retry(User $user, ContractRequest $contractRequest): bool
    {
        return $user->isSuperAdmin() && $contractRequest->status === ContractRequest::STATUS_FAILED;
    }
}
