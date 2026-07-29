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
        $criteres = [];
        if ($this->has('mobility')) $criteres['mobility'] = $this->mobility;
        if ($this->has('allergies')) $criteres['allergies'] = $this->allergies;
        if ($this->has('treatment')) $criteres['treatment'] = $this->treatment;
        if ($this->has('attending_physician')) $criteres['attending_physician'] = $this->attending_physician;

        if (count($criteres) > 0) {
            $this->merge([
                'c_criteres' => json_encode($criteres),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'm_mat' => 'nullable|integer',
            'c_affectation' => 'nullable|integer',
            'c_reclamation' => 'nullable|integer',
            'c_nom' => 'required|string|max:255',
            'c_mat' => 'nullable|integer',
            'c_file_img' => 'nullable|string|max:255',
            'c_statut' => 'nullable|string|max:255',
            'c_cin' => 'nullable|string|max:255',
            'c_cin_v' => 'nullable|date',
            'c_date_naissance' => 'nullable|date',
            'c_nationalite' => 'nullable|string|max:255',
            'c_situation_fam' => 'nullable|string|max:255',
            'c_n_enfant' => 'nullable|integer|min:0',
            'c_enfants_details' => 'nullable|string',
            'c_adresse_cin' => 'nullable|string|max:255',
            'c_ville_o' => 'nullable|string|max:255',
            'c_adresse_act' => 'nullable|string|max:255',
            'c_ville_a' => 'nullable|string|max:255',
            'c_logement' => 'nullable|string|max:255',
            'c_gsm1' => 'nullable|string|max:255',
            'c_gsm2' => 'nullable|string|max:255',
            'c_source' => 'nullable|string|max:255',
            'c_csource' => 'nullable|string|max:255',
            'c_responsable' => 'nullable|string|max:255',
            'c_fonction' => 'nullable|string|max:255',
            'c_fonction_source' => 'nullable|string|max:255',
            'c_criteres' => 'nullable|string',
            'c_p_nationalite' => 'nullable|string|max:255',
            'c_p_religion' => 'nullable|string|max:255',
            'c_prix_min' => 'nullable|numeric|min:0',
            'c_prix_max' => 'nullable|numeric|min:0',
            'c_prix_ech' => 'nullable|string|max:255',
            'c_repos' => 'nullable|string|max:255',
            'c_experience' => 'nullable|string|max:255',
            'c_mode' => 'nullable|string|max:255',
            'c_honoraire' => 'nullable|string|max:255',
            'c_observation' => 'nullable|string',
            'c_inscription_date' => 'nullable|date',
            'c_presence_animaux' => 'nullable|string|max:20',
            'c_nombre_animaux' => 'nullable|integer|min:0',
            'c_animaux_details' => 'nullable|string',
        ];
    }
}
