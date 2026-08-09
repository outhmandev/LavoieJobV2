<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assignment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contractRequests()
    {
        return $this->hasMany(ContractRequest::class)->orderBy('created_at', 'desc');
    }

    public function latestContractRequest()
    {
        return $this->hasOne(ContractRequest::class)->latestOfMany();
    }

    public function activeContractRequest()
    {
        return $this->hasOne(ContractRequest::class)
            ->whereIn('status', [ContractRequest::STATUS_PENDING, ContractRequest::STATUS_APPROVED, ContractRequest::STATUS_GENERATING])
            ->latestOfMany();
    }

    public function completedContractRequest()
    {
        return $this->hasOne(ContractRequest::class)
            ->where('status', ContractRequest::STATUS_COMPLETED)
            ->latestOfMany();
    }
}

