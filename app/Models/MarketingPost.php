<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'platform',
        'status',
        'external_post_id',
        'likes',
        'comments',
        'shares',
        'views',
        'reach',
        'scheduled_at',
        'published_at',
        'created_by',
        'approved_by',
        'published_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
