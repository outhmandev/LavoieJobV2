<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContractRequest extends Model
{
    use HasFactory;


    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_GENERATING = 'generating';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_GENERATING,
        self::STATUS_COMPLETED,
        self::STATUS_REJECTED,
        self::STATUS_FAILED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'assignment_id',
        'client_id',
        'profile_id',
        'requested_by',
        'approved_by',
        'status',
        'notes',
        'rejection_reason',
        'error_message',
        'generated_contract_id',
        'file_path',
        'file_name',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(ContractRequestAudit::class)->orderBy('created_at', 'desc');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isGenerating(): bool
    {
        return $this->status === self::STATUS_GENERATING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function canBeCancelledBy(User $user): bool
    {
        return $this->isPending() && (int) $this->requested_by === (int) $user->id;
    }
}
