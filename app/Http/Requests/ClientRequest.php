<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $map = [
            'c_nom' => 'nom',
            'c_mat' => 'mat',
            'c_statut' => 'statut',
            'status' => 'statut',
            'c_cin' => 'cin',
            'c_cin_v' => 'cin_v',
            'c_date_naissance' => 'date_naissance',
            'c_nationalite' => 'nationalite',
            'c_situation_fam' => 'situation_fam',
            'c_n_enfant' => 'n_enfant',
            'c_enfants_details' => 'enfants_details',
            'c_adresse_cin' => 'adresse_cin',
            'c_ville_o' => 'ville_o',
            'c_adresse_act' => 'adresse_act',
            'c_ville_a' => 'ville_a',
            'c_logement' => 'logement',
            'c_gsm1' => 'gsm1',
            'c_gsm2' => 'gsm2',
            'c_source' => 'source',
            'c_csource' => 'csource',
            'c_responsable' => 'responsable',
            'c_fonction' => 'fonction',
            'c_fonction_source' => 'fonction_source',
            'c_religion' => 'religion',
            'c_prix_min' => 'prix_min',
            'c_prix_max' => 'prix_max',
            'c_prix_ech' => 'prix_ech',
            'c_repos' => 'repos',
            'c_experience' => 'experience',
            'c_mode' => 'mode',
            'c_honoraire' => 'honoraire',
            'c_observation' => 'observation',
            'c_inscription_date' => 'inscription_date',
            'c_edit_date' => 'edit_date',
            'c_presence_animaux' => 'presence_animaux',
            'c_nombre_animaux' => 'nombre_animaux',
            'c_animaux_details' => 'animaux_details',
        ];

        $updates = [];
        foreach ($map as $legacy => $modern) {
            if ($this->filled($legacy) && !$this->filled($modern)) {
                $updates[$modern] = $this->input($legacy);
            } elseif ($this->filled($modern) && !$this->filled($legacy)) {
                $updates[$legacy] = $this->input($modern);
            } elseif ($this->has($legacy) && !$this->has($modern)) {
                $updates[$modern] = $this->input($legacy);
            }
        }

        // Serialize array enfants_details if array passed
        if ($this->has('enfants_details') && is_array($this->input('enfants_details'))) {
            $updates['enfants_details'] = json_encode($this->input('enfants_details'), JSON_UNESCAPED_UNICODE);
        } elseif ($this->has('c_enfants_details') && is_array($this->input('c_enfants_details'))) {
            $updates['enfants_details'] = json_encode($this->input('c_enfants_details'), JSON_UNESCAPED_UNICODE);
        }

        // Normalize and clean date fields (extract YYYY-MM-DD and set empty to null)
        $dateFields = ['cin_v', 'date_naissance', 'inscription_date', 'edit_date'];
        foreach ($dateFields as $df) {
            $val = $updates[$df] ?? $this->input($df);
            if ($val === '' || $val === null) {
                $updates[$df] = null;
            } elseif (is_string($val)) {
                $val = trim($val);
                if (strlen($val) > 10) {
                    $cleanDate = substr($val, 0, 10);
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $cleanDate)) {
                        $updates[$df] = $cleanDate;
                    }
                }
            }
        }

        // Normalize empty numeric strings to 0 for non-null DB columns
        $intFields = ['n_enfant', 'nombre_animaux', 'prix_min', 'prix_max', 'affectation', 'reclamation'];
        foreach ($intFields as $intf) {
            $val = $updates[$intf] ?? $this->input($intf);
            if ($val === '' || $val === null) {
                $updates[$intf] = 0;
            }
        }

        // Criteria packaging
        $criteres = [];
        if ($this->has('criteres')) {
            $existing = $this->input('criteres');
            if (is_array($existing)) {
                $criteres = $existing;
            } elseif (is_string($existing)) {
                $decoded = json_decode($existing, true);
                if (is_array($decoded)) {
                    $criteres = $decoded;
                }
            }
        }
        if ($this->has('missions')) {
            $criteres['missions'] = is_array($this->input('missions')) ? $this->input('missions') : [];
        }
        if ($this->has('criteria')) {
            $criteres['missions'] = is_array($this->input('criteria')) ? $this->input('criteria') : (is_string($this->input('criteria')) ? json_decode($this->input('criteria'), true) : []);
        }
        if ($this->has('languages') && $this->input('languages') !== null) $criteres['languages'] = $this->input('languages');
        if ($this->has('mobility') && $this->input('mobility') !== null) $criteres['mobility'] = $this->input('mobility');
        if ($this->has('allergies') && $this->input('allergies') !== null) $criteres['allergies'] = $this->input('allergies');
        if ($this->has('treatment') && $this->input('treatment') !== null) $criteres['treatment'] = $this->input('treatment');
        if ($this->has('attending_physician') && $this->input('attending_physician') !== null) $criteres['attending_physician'] = $this->input('attending_physician');

        if ($this->has('domicare_data') && is_array($this->input('domicare_data'))) {
            $criteres['domicare_data'] = $this->input('domicare_data');
        }

        if (count($criteres) > 0) {
            $updates['criteres'] = json_encode($criteres, JSON_UNESCAPED_UNICODE);
        }

        if (!empty($updates)) {
            $this->merge($updates);
        }
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'user_id' => 'nullable|exists:users,id',
            'm_mat' => 'nullable|integer',
            'affectation' => 'nullable|integer',
            'reclamation' => 'nullable|integer',
            'nom' => 'required|string|max:255',
            'mat' => 'nullable|integer',
            'file_img' => 'nullable|string|max:255',
            'statut' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:255',
            'cin_v' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'nationalite' => 'nullable|string|max:255',
            'situation_fam' => 'nullable|string|max:255',
            'n_enfant' => 'nullable|integer|min:0',
            'enfants_details' => 'nullable|string',
            'animaux_details' => 'nullable|string',
            'tranche_age' => 'nullable|string|max:255',
            'enfants_gardes' => 'nullable|string|max:255',
            // Aliased validation fields (mapping handled before validation)
            'c_nom' => 'nullable|string|max:255',
            'adresse_act' => 'nullable|string|max:255',
            'ville_a' => 'nullable|string|max:255',
            'logement' => 'nullable|string|max:255',
            'gsm1' => 'nullable|string|max:255',
            'gsm2' => 'nullable|string|max:255',
            'adresse_cin' => 'nullable|string|max:255',
            'ville_o' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'csource' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'fonction' => 'nullable|string|max:255',
            'fonction_source' => 'nullable|string|max:255',
            'criteres' => 'nullable|string',
            'missions' => 'nullable|array',
            'criteria' => 'nullable',
            'languages' => 'nullable|string|max:255',
            'mobility' => 'nullable|string|max:50',
            'allergies' => 'nullable|string|max:255',
            'treatment' => 'nullable|string',
            'attending_physician' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'prix_min' => 'nullable|numeric|min:0',
            'prix_max' => 'nullable|numeric|min:0',
            'prix_ech' => 'nullable|string|max:255',
            'repos' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'mode' => 'nullable|string|max:255',
            'honoraire' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
            'inscription_date' => 'nullable|date',
            'edit_date' => 'nullable|date',
            'presence_animaux' => 'nullable|string|max:20',
            'nombre_animaux' => 'nullable|integer|min:0',
            'animaux_details' => 'nullable|string',
            'blacklist_motif' => 'nullable|string',
            'domicare_data' => 'nullable|array',
        ];
    }
}
