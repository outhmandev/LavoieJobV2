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

    public const STATUSES = [
        'Prospect',
        'En cours de traitement',
        'Validé',
        'En Attente',
        'Suggéré',
        'Reclamation',
        'Rejet',
        'Black liste',
    ];

    public static function generateNextMatricule(): int
    {
        $max = self::whereNotNull('mat')
            ->where('mat', '>', 0)
            ->selectRaw('MAX(CAST(mat AS UNSIGNED)) as max_mat')
            ->value('max_mat');

        return $max ? ((int)$max + 1) : 1000;
    }


    protected $fillable = [
        'project_id',
        'user_id',
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
        // Aliased fillables
        'c_nom',
        'c_mat',
        'c_statut',
        'c_ville_a',
        'c_ville_o',
        'c_fonction',
        'c_logement',
        'c_mode',
        'c_observation',
        'c_presence_animaux',
        'c_nombre_animaux',
        'c_animaux_details',
        'c_prix_max',
        'c_prix_min',
        'c_fonction_source',
        'c_gsm1',
        'c_gsm2',
        'c_source',
        'c_csource',
        'c_responsable',
        'c_adresse_cin',
        'c_adresse_act',
        'c_date_naissance',
        'c_cin',
        'c_nationalite',
        'c_cin_v',
        'c_situation_fam',
        'c_n_enfant',
        'c_enfants_details',
        'c_prix_ech',
        'c_repos',
        'c_experience',
        'c_honoraire',
        'c_religion',
        'c_inscription_date',
        'c_edit_date',
        'missions',
        'criteria',
        'languages',
        'mobility',
    ];

    protected $casts = [
        'cin_v' => 'date:Y-m-d',
        'date_naissance' => 'date:Y-m-d',
        'inscription_date' => 'date:Y-m-d',
        'edit_date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'c_nom',
        'c_mat',
        'c_statut',
        'c_ville_a',
        'c_ville_o',
        'c_fonction',
        'c_logement',
        'c_mode',
        'c_observation',
        'c_presence_animaux',
        'c_nombre_animaux',
        'c_animaux_details',
        'c_prix_max',
        'c_prix_min',
        'c_fonction_source',
        'c_gsm1',
        'c_gsm2',
        'c_source',
        'c_csource',
        'c_responsable',
        'c_adresse_cin',
        'c_adresse_act',
        'c_date_naissance',
        'c_cin',
        'c_nationalite',
        'c_cin_v',
        'c_situation_fam',
        'c_n_enfant',
        'c_enfants_details',
        'c_prix_ech',
        'c_repos',
        'c_experience',
        'c_honoraire',
        'c_religion',
        'c_inscription_date',
        'c_edit_date',
        'missions',
        'criteria',
        'languages',
        'mobility',
        'allergies',
        'treatment',
        'attending_physician',
    ];

    public function getCNomAttribute() { return $this->attributes['nom'] ?? null; }
    public function getCMatAttribute() { return $this->attributes['mat'] ?? null; }
    public function getCStatutAttribute() { return $this->attributes['statut'] ?? null; }
    public function getCVilleAAttribute() { return $this->attributes['ville_a'] ?? null; }
    public function getCVilleOAttribute() { return $this->attributes['ville_o'] ?? null; }
    public function getCFonctionAttribute() { return $this->attributes['fonction'] ?? null; }
    public function getCLogementAttribute() { return $this->attributes['logement'] ?? null; }
    public function getCModeAttribute() { return $this->attributes['mode'] ?? null; }
    public function getCObservationAttribute() { return $this->attributes['observation'] ?? null; }
    public function getCPresenceAnimauxAttribute() { return $this->attributes['presence_animaux'] ?? null; }
    public function getCNombreAnimauxAttribute() { return $this->attributes['nombre_animaux'] ?? null; }
    public function getCAnimauxDetailsAttribute() { return $this->attributes['animaux_details'] ?? null; }
    public function getCPrixMaxAttribute() { return $this->attributes['prix_max'] ?? null; }
    public function getCPrixMinAttribute() { return $this->attributes['prix_min'] ?? null; }
    public function getCFonctionSourceAttribute() { return $this->attributes['fonction_source'] ?? null; }
    public function getCGsm1Attribute() { return $this->attributes['gsm1'] ?? null; }
    public function getCGsm2Attribute() { return $this->attributes['gsm2'] ?? null; }
    public function getCSourceAttribute($value = null)
    {
        return $value ?? ($this->attributes['source'] ?? null);
    }
    public function getCCsourceAttribute() { return $this->attributes['csource'] ?? null; }
    public function getCResponsableAttribute() { return $this->attributes['responsable'] ?? null; }
    public function getCAdresseCinAttribute() { return $this->attributes['adresse_cin'] ?? null; }
    public function getCAdresseActAttribute() { return $this->attributes['adresse_act'] ?? null; }
    public function getCDateNaissanceAttribute() {
        $val = $this->attributes['date_naissance'] ?? null;
        return $val ? substr($val, 0, 10) : null;
    }
    public function getCCinAttribute() { return $this->attributes['cin'] ?? null; }
    public function getCNationaliteAttribute() { return $this->attributes['nationalite'] ?? null; }
    public function getCCinVAttribute() {
        $val = $this->attributes['cin_v'] ?? null;
        return $val ? substr($val, 0, 10) : null;
    }
    public function getCSituationFamAttribute() { return $this->attributes['situation_fam'] ?? null; }
    public function getCNEnfantAttribute() { return $this->attributes['n_enfant'] ?? null; }
    public function getCEnfantsDetailsAttribute() { return $this->attributes['enfants_details'] ?? null; }
    public function getCPrixEchAttribute() { return $this->attributes['prix_ech'] ?? null; }
    public function getCReposAttribute() { return $this->attributes['repos'] ?? null; }
    public function getCExperienceAttribute() { return $this->attributes['experience'] ?? null; }
    public function getCHonoraireAttribute() { return $this->attributes['honoraire'] ?? null; }
    public function getCReligionAttribute() { return $this->attributes['religion'] ?? null; }
    public function getCInscriptionDateAttribute() {
        $val = $this->attributes['inscription_date'] ?? null;
        return $val ? substr($val, 0, 10) : null;
    }
    public function getCEditDateAttribute() {
        $val = $this->attributes['edit_date'] ?? null;
        return $val ? substr($val, 0, 10) : null;
    }

    public function getMissionsAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['missions'] ?? []) : [];
    }
    public function getCriteriaAttribute() {
        return $this->getMissionsAttribute();
    }
    public function getLanguagesAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['languages'] ?? '') : '';
    }
    public function getMobilityAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['mobility'] ?? 'Oui') : 'Oui';
    }
    public function getAllergiesAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['allergies'] ?? '') : '';
    }
    public function getTreatmentAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['treatment'] ?? '') : '';
    }
    public function getAttendingPhysicianAttribute() {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        return is_array($c) ? ($c['attending_physician'] ?? '') : '';
    }

    public function setLanguagesAttribute($value) {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        if (!is_array($c)) $c = [];
        $c['languages'] = $value;
        $this->attributes['criteres'] = json_encode($c, JSON_UNESCAPED_UNICODE);
    }
    public function setMissionsAttribute($value) {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        if (!is_array($c)) $c = [];
        $c['missions'] = is_array($value) ? $value : [];
        $this->attributes['criteres'] = json_encode($c, JSON_UNESCAPED_UNICODE);
    }
    public function setCriteriaAttribute($value) {
        $this->setMissionsAttribute($value);
    }
    public function setMobilityAttribute($value) {
        $c = json_decode($this->attributes['criteres'] ?? '{}', true);
        if (!is_array($c)) $c = [];
        $c['mobility'] = $value;
        $this->attributes['criteres'] = json_encode($c, JSON_UNESCAPED_UNICODE);
    }

    public function setCEnfantsDetailsAttribute($value) { $this->attributes['enfants_details'] = $value; }

    public function setCNomAttribute($value) { $this->attributes['nom'] = $value; }
    public function setCMatAttribute($value) { $this->attributes['mat'] = $value; }
    public function setCStatutAttribute($value) { $this->attributes['statut'] = $value; }
    public function setCVilleAAttribute($value) { $this->attributes['ville_a'] = $value; }
    public function setCVilleOAttribute($value) { $this->attributes['ville_o'] = $value; }
    public function setCFonctionAttribute($value) { $this->attributes['fonction'] = $value; }
    public function setCLogementAttribute($value) { $this->attributes['logement'] = $value; }
    public function setCModeAttribute($value) { $this->attributes['mode'] = $value; }
    public function setCObservationAttribute($value) { $this->attributes['observation'] = $value; }
    public function setCPresenceAnimauxAttribute($value) { $this->attributes['presence_animaux'] = $value; }
    public function setCNombreAnimauxAttribute($value) { $this->attributes['nombre_animaux'] = $value; }
    public function setCAnimauxDetailsAttribute($value) { $this->attributes['animaux_details'] = $value; }
    public function setCPrixMaxAttribute($value) { $this->attributes['prix_max'] = $value; }
    public function setCPrixMinAttribute($value) { $this->attributes['prix_min'] = $value; }
    public function setCFonctionSourceAttribute($value) { $this->attributes['fonction_source'] = $value; }
    public function setCGsm1Attribute($value) { $this->attributes['gsm1'] = $value; }
    public function setCGsm2Attribute($value) { $this->attributes['gsm2'] = $value; }
    public function setCResponsableAttribute($value) { $this->attributes['responsable'] = $value; }
    public function setCAdresseCinAttribute($value) { $this->attributes['adresse_cin'] = $value; }
    public function setCAdresseActAttribute($value) { $this->attributes['adresse_act'] = $value; }
    public function setCDateNaissanceAttribute($value) {
        $this->attributes['date_naissance'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }
    public function setDateNaissanceAttribute($value) {
        $this->attributes['date_naissance'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }
    public function setCCinAttribute($value) { $this->attributes['cin'] = $value; }
    public function setCNationaliteAttribute($value) { $this->attributes['nationalite'] = $value; }
    public function setCCinVAttribute($value) {
        $this->attributes['cin_v'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }
    public function setCinVAttribute($value) {
        $this->attributes['cin_v'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }
    public function setCSituationFamAttribute($value) { $this->attributes['situation_fam'] = $value; }
    public function setCNEnfantAttribute($value) { $this->attributes['n_enfant'] = $value; }
    public function setCPrixEchAttribute($value) { $this->attributes['prix_ech'] = $value; }
    public function setCReposAttribute($value) { $this->attributes['repos'] = $value; }
    public function setCExperienceAttribute($value) { $this->attributes['experience'] = $value; }
    public function setCHonoraireAttribute($value) { $this->attributes['honoraire'] = $value; }
    public function setCReligionAttribute($value) { $this->attributes['religion'] = $value; }
    public function setCInscriptionDateAttribute($value) {
        $this->attributes['inscription_date'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }
    public function setCEditDateAttribute($value) {
        $this->attributes['edit_date'] = (!empty($value)) ? substr($value, 0, 10) : null;
    }

    protected static function booted()
    {
        static::creating(function ($client) {
            if (empty($client->mat) || (int)$client->mat === 0) {
                $client->mat = self::generateNextMatricule();
            }
            if (empty($client->m_mat) || (int)$client->m_mat === 0) {
                $client->m_mat = $client->mat;
            }
        });

        static::saving(function ($client) {
            if (!empty($client->fonction_source) && empty($client->project_id)) {
                $cleanSource = strtoupper(trim(str_replace(['_', "\r", "\n"], [' ', '', ' '], $client->fonction_source)));
                $cleanSource = preg_replace('/\s+/', ' ', $cleanSource);

                $project = Project::all()->first(function ($p) use ($cleanSource) {
                    $cleanName = strtoupper(trim($p->name));
                    return $cleanSource === $cleanName || str_contains($cleanSource, $cleanName) || str_contains($cleanName, $cleanSource);
                });

                if ($project) {
                    $client->project_id = $project->id;
                }
            } elseif (!empty($client->project_id) && empty($client->fonction_source)) {
                $project = Project::find($client->project_id);
                if ($project) {
                    $client->fonction_source = str_replace(' ', '_', strtoupper($project->name));
                }
            }
        });
    }

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
