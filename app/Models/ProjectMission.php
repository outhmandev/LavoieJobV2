<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMission extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'group_name', 'name'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
