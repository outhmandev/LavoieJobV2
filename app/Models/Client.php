<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Client extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    protected $guarded = ['id'];


    protected $fillable = [
        'm_mat',
        'affectation',
        'reclamation',
        'nom',
        'mat',
        'file_img',
        'statut',
        'cin',
        'cin_v',
        'date_naissance',
        'nationalite',
        'situation_fam',
        'n_enfant',
        'enfants_details',
        'adresse_cin',
        'ville_o',
        'adresse_act',
        'ville_a',
        'logement',
        'gsm1',
        'gsm2',
        'source',
        'csource',
        'responsable',
        'fonction',
        'fonction_source',
        'criteres',
        'nationalite',
        'religion',
        'prix_min',
        'prix_max',
        'prix_ech',
        'repos',
        'experience',
        'mode',
        'honoraire',
        'observation',
        'inscription_date',
        'edit_date',
        'presence_animaux',
        'nombre_animaux',
        'animaux_details',
    ];  

    public function user()
    {
        return $this->belongsTo(User::class);
    }

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
}
