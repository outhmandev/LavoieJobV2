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

    public const STATUSES = [
        'Disponible',
        'En Attente',
        'Affecté(e)',
        'Injoignable',
        'Indisponible',
        'Suggéré',
        'Dossier incomplet',
        'Black liste',
        'Reclamation',
        'SUPPRIMER',
    ];

    public static function generateNextMatricule(): string
    {
        $max = self::whereNotNull('matricule')
            ->selectRaw('MAX(CAST(matricule AS UNSIGNED)) as max_mat')
            ->value('max_mat');

        $next = $max ? ((int)$max + 1) : 1000;
        return (string)$next;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($profile) {
            if (empty($profile->matricule)) {
                $profile->matricule = self::generateNextMatricule();
            }
        });
    }

    protected $fillable = [
        'project_id',
        'user_id',
        'matricule',
        'full_name',
        'avatar',
        'status',
        'cin',
        'cin_validity',
        'birth_date',
        'birth_city',
        'rate',
        'nationality',
        'religion',
        'education_level',
        'marital_status',
        'children_count',
        'children_details',
        'cin_address',
        'origin_city',
        'current_address',
        'current_city',
        'education_specialty',
        'email',
        'phone_1',
        'phone_2',
        'source',
        'job',
        'min_price',
        'max_price',
        'experience_years',
        'experience_details',
        'has_diseases',
        'disease_details',
        'mobility',
        'observation',
        'pet_allergies',
        'allergy_details',
        'criteria',
        'attending_physician',
        'languages',
        // Aliased fillables
        'nom',
        'mat',
        'statut',
        'file_img',
        'date_naissance',
        'ville_o',
        'nationalite',
        'niveau',
        'situation_familiale',
        'nombre_enfant',
        'adresse_cin',
        'ville_origin',
        'current_adresse',
        'gsm1',
        'gsm2',
        'fonction',
    ];

    protected $appends = [
        'nom',
        'mat',
        'statut',
        'file_img',
        'date_naissance',
        'ville_o',
        'nationalite',
        'niveau',
        'situation_familiale',
        'nombre_enfant',
        'adresse_cin',
        'ville_origin',
        'current_adresse',
        'gsm1',
        'gsm2',
        'fonction',
    ];

    // Accessors
    public function getNomAttribute() { return $this->attributes['full_name'] ?? $this->attributes['nom'] ?? null; }
    public function getMatAttribute() { return $this->attributes['matricule'] ?? $this->attributes['mat'] ?? null; }
    public function getStatutAttribute() { return $this->attributes['status'] ?? $this->attributes['statut'] ?? null; }
    public function getFileImgAttribute() { return $this->attributes['avatar'] ?? $this->attributes['file_img'] ?? null; }
    public function getDateNaissanceAttribute() { return $this->attributes['birth_date'] ?? $this->attributes['date_naissance'] ?? null; }
    public function getVilleOAttribute() { return $this->attributes['birth_city'] ?? $this->attributes['ville_o'] ?? null; }
    public function getNationaliteAttribute() { return $this->attributes['nationality'] ?? $this->attributes['nationalite'] ?? null; }
    public function getNiveauAttribute() { return $this->attributes['education_level'] ?? $this->attributes['niveau'] ?? null; }
    public function getSituationFamilialeAttribute() { return $this->attributes['marital_status'] ?? $this->attributes['situation_familiale'] ?? null; }
    public function getNombreEnfantAttribute() { return $this->attributes['children_count'] ?? $this->attributes['nombre_enfant'] ?? null; }
    public function getAdresseCinAttribute() { return $this->attributes['cin_address'] ?? $this->attributes['adresse_cin'] ?? null; }
    public function getVilleOriginAttribute() { return $this->attributes['origin_city'] ?? $this->attributes['ville_origin'] ?? null; }
    public function getCurrentAdresseAttribute() { return $this->attributes['current_address'] ?? $this->attributes['current_adresse'] ?? null; }
    public function getGsm1Attribute() { return $this->attributes['phone_1'] ?? $this->attributes['gsm1'] ?? null; }
    public function getGsm2Attribute() { return $this->attributes['phone_2'] ?? $this->attributes['gsm2'] ?? null; }
    public function getFonctionAttribute() { return $this->attributes['job'] ?? $this->attributes['fonction'] ?? null; }

    // Mutators
    public function setNomAttribute($value) { $this->attributes['full_name'] = $value; }
    public function setMatAttribute($value) { $this->attributes['matricule'] = $value; }
    public function setStatutAttribute($value) { $this->attributes['status'] = $value; }
    public function setFileImgAttribute($value) { $this->attributes['avatar'] = $value; }
    public function setDateNaissanceAttribute($value) { $this->attributes['birth_date'] = $value; }
    public function setVilleOAttribute($value) { $this->attributes['birth_city'] = $value; }
    public function setNationaliteAttribute($value) { $this->attributes['nationality'] = $value; }
    public function setNiveauAttribute($value) { $this->attributes['education_level'] = $value; }
    public function setSituationFamilialeAttribute($value) { $this->attributes['marital_status'] = $value; }
    public function setNombreEnfantAttribute($value) { $this->attributes['children_count'] = $value; }
    public function setAdresseCinAttribute($value) { $this->attributes['cin_address'] = $value; }
    public function setVilleOriginAttribute($value) { $this->attributes['origin_city'] = $value; }
    public function setCurrentAdresseAttribute($value) { $this->attributes['current_address'] = $value; }
    public function setGsm1Attribute($value) { $this->attributes['phone_1'] = $value; }
    public function setGsm2Attribute($value) { $this->attributes['phone_2'] = $value; }
    public function setFonctionAttribute($value) { $this->attributes['job'] = $value; }
    public function setHasDiseasesAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['has_diseases'] = strtolower($value) === 'oui' ? 1 : 0;
        } else {
            $this->attributes['has_diseases'] = !empty($value) ? 1 : 0;
        }
    }
    public function setPetAllergiesAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['pet_allergies'] = strtolower($value) === 'oui' ? 1 : 0;
        } else {
            $this->attributes['pet_allergies'] = !empty($value) ? 1 : 0;
        }
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

    protected $casts = [
        'criteria' => 'array',
        'has_diseases' => 'boolean',
        'pet_allergies' => 'boolean',
        'birth_date' => 'date',
        'cin_validity' => 'date',
    ];
}
