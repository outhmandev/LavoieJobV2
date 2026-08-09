<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractRequestAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'contract_request_id',
        'user_id',
        'user_name',
        'user_role',
        'action',
        'details',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function contractRequest(): BelongsTo
    {
        return $this->belongsTo(ContractRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
