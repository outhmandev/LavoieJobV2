<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reclamation extends Model
{
    use HasFactory;

    protected $fillable = [
        'legacy_id',
        'client_id',
        'profile_id',
        'profil_litigieux',
        'description',
        'resolu',
        'date_reclamation',
    ];

    protected $casts = [
        'resolu' => 'boolean',
        'date_reclamation' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }
}

