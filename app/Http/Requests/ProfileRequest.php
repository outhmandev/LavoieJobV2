<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('has_diseases') && is_string($this->has_diseases)) {
            $this->merge([
                'has_diseases' => strtolower($this->has_diseases) === 'oui' ? true : false,
            ]);
        }
        if ($this->has('pet_allergies') && is_string($this->pet_allergies)) {
            $this->merge([
                'pet_allergies' => strtolower($this->pet_allergies) === 'oui' ? true : false,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'matricule' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'avatar' => 'nullable|string|max:255',
            'p_statut' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:255',
            'cin_validity' => 'nullable|date',
            'birth_date' => 'nullable|date',
            'birth_city' => 'nullable|string|max:255',
            'rate' => 'nullable|numeric|min:0|max:5',
            'nationality' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'children_count' => 'nullable|integer|min:0',
            'children_details' => 'nullable|string',
            'cin_address' => 'nullable|string|max:255',
            'origin_city' => 'nullable|string|max:255',
            'current_address' => 'nullable|string|max:255',
            'current_city' => 'nullable|string|max:255',
            'education_specialty' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'gsm_1' => 'nullable|string|max:255',
            'gsm_2' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'job' => 'nullable|string|max:255',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|string|max:255',
            'experience_details' => 'nullable|string',
            'has_diseases' => 'nullable|boolean',
            'disease_details' => 'nullable|string',
            'mobility' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
            'pet_allergies' => 'nullable|boolean',
            'allergy_details' => 'nullable|string',
            'criteria' => 'nullable|array',
            'attending_physician' => 'nullable|string|max:255',
            'languages' => 'nullable|string|max:255',
            'mode_emploi' => 'nullable|string|max:255',
            'type_contrat' => 'nullable|string|max:255',
            'repos' => 'nullable|string|max:255',
            'missions' => 'nullable|array',
            'missions.*' => 'string',
        ];
    }
}
