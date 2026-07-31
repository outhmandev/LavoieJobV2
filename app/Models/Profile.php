<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Profile extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    public $timestamps = false;
    protected $guarded = ['id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class);
    }
    
    protected $casts = [
        'criteria' => 'array',
        'has_diseases' => 'boolean',
        'pet_allergies' => 'boolean',
        'birth_date' => 'date',
        'cin_validity' => 'date',
    ];
}
