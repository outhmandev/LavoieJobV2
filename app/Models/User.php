<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use OwenIt\Auditing\Contracts\Auditable;

class User extends Authenticatable implements Auditable
{
    use HasFactory, Notifiable, HasRoles;
    use \OwenIt\Auditing\Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'invitation_token',
        'invitation_expires_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'last_seen_at',
    ];


    protected $appends = [
        'is_online',
        'two_factor_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen_at' => 'datetime',
            'invitation_expires_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    public function hasTwoFactorEnabled(): bool
    {
        return !is_null($this->two_factor_confirmed_at) && !is_null($this->two_factor_secret);
    }

    public function getTwoFactorEnabledAttribute(): bool
    {
        return $this->hasTwoFactorEnabled();
    }

    public function hasPendingInvitation(): bool
    {
        return !is_null($this->invitation_token) && ($this->status === 'pending');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function isOnline()
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subMinutes(5));
    }

    public function getIsOnlineAttribute()
    {
        return $this->isOnline();
    }

    public function contractRequests()
    {
        return $this->hasMany(ContractRequest::class, 'requested_by');
    }

    public function approvedContractRequests()
    {
        return $this->hasMany(ContractRequest::class, 'approved_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(['System Administrator', 'Super Admin', 'super Admin'])
            || in_array(strtolower($this->role ?? ''), ['system administrator', 'super admin', 'superadmin']);
    }

    public function isAdmin(): bool
    {
        return $this->isSuperAdmin()
            || $this->hasRole(['Admin', 'admin'])
            || in_array(strtolower($this->role ?? ''), ['admin']);
    }

    public function isMember(): bool
    {
        return $this->hasRole(['Membre', 'Member', 'membre', 'member'])
            || in_array(strtolower($this->role ?? ''), ['membre', 'member']);
    }
}

