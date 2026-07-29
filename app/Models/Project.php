<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Project extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = ['name', 'status'];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function jobs()
    {
        return $this->hasMany(ProjectJob::class);
    }

    public function missions()
    {
        return $this->hasMany(ProjectMission::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function profiles()
    {
        return $this->hasMany(Profile::class);
    }

    protected $appends = ['grouped_missions'];

    public function getGroupedMissionsAttribute()
    {
        return $this->missions->groupBy('group')->map(function ($missions) {
            return $missions->pluck('name');
        });
    }
}
