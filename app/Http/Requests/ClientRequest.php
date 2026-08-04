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
            'c_ville_a' => 'ville_a',
            'c_fonction' => 'fonction',
            'c_logement' => 'logement',
            'c_mode' => 'mode',
            'c_observation' => 'observation',
            'c_presence_animaux' => 'presence_animaux',
            'c_nombre_animaux' => 'nombre_animaux',
            'c_animaux_details' => 'animaux_details',
            'c_prix_max' => 'prix_max',
            'c_prix_min' => 'prix_min',
        ];

        $updates = [];
        foreach ($map as $legacy => $modern) {
            if ($this->has($legacy) && !$this->has($modern)) {
                $updates[$modern] = $this->input($legacy);
            }
        }

        $criteres = [];
        if ($this->has('mobility')) $criteres['mobility'] = $this->mobility;
        if ($this->has('allergies')) $criteres['allergies'] = $this->allergies;
        if ($this->has('treatment')) $criteres['treatment'] = $this->treatment;
        if ($this->has('attending_physician')) $criteres['attending_physician'] = $this->attending_physician;

        if (count($criteres) > 0) {
            $updates['criteres'] = json_encode($criteres);
        }

        if (!empty($updates)) {
            $this->merge($updates);
        }
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
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
            'adresse_cin' => 'nullable|string|max:255',
            'ville_o' => 'nullable|string|max:255',
            'adresse_act' => 'nullable|string|max:255',
            'ville_a' => 'nullable|string|max:255',
            'logement' => 'nullable|string|max:255',
            'gsm1' => 'nullable|string|max:255',
            'gsm2' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'csource' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'fonction' => 'nullable|string|max:255',
            'fonction_source' => 'nullable|string|max:255',
            'criteres' => 'nullable|string',
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
            'presence_animaux' => 'nullable|string|max:20',
            'nombre_animaux' => 'nullable|integer|min:0',
            'animaux_details' => 'nullable|string',
        ];
    }
}
