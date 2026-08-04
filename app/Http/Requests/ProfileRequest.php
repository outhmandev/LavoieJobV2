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
        $map = [
            'nom' => 'full_name',
            'mat' => 'matricule',
            'statut' => 'status',
            'file_img' => 'avatar',
            'date_naissance' => 'birth_date',
            'ville_o' => 'birth_city',
            'nationalite' => 'nationality',
            'niveau' => 'education_level',
            'situation_familiale' => 'marital_status',
            'nombre_enfant' => 'children_count',
            'adresse_cin' => 'cin_address',
            'ville_origin' => 'origin_city',
            'current_adresse' => 'current_address',
            'gsm1' => 'phone_1',
            'gsm2' => 'phone_2',
            'gsm_1' => 'phone_1',
            'gsm_2' => 'phone_2',
            'fonction' => 'job',
        ];

        $updates = [];
        foreach ($map as $legacy => $modern) {
            if ($this->has($legacy) && !$this->filled($modern) && $this->filled($legacy)) {
                $updates[$modern] = $this->input($legacy);
            } elseif ($this->has($modern) && !$this->filled($legacy) && $this->filled($modern)) {
                $updates[$legacy] = $this->input($modern);
            }
        }

        // Convert string representations to boolean / null
        if ($this->has('has_diseases')) {
            $val = $this->input('has_diseases');
            if (is_string($val)) {
                $updates['has_diseases'] = strtolower($val) === 'oui';
            }
        }
        if ($this->has('pet_allergies')) {
            $val = $this->input('pet_allergies');
            if (is_string($val)) {
                $updates['pet_allergies'] = strtolower($val) === 'oui';
            }
        }

        // Clean empty string dates to null
        foreach (['cin_validity', 'birth_date', 'date_naissance'] as $dateField) {
            if ($this->has($dateField) && $this->input($dateField) === '') {
                $updates[$dateField] = null;
            }
        }

        // Clean empty string numbers to null
        foreach (['children_count', 'nombre_enfant', 'rate', 'min_price', 'max_price', 'experience_years'] as $numField) {
            if ($this->has($numField) && $this->input($numField) === '') {
                $updates[$numField] = null;
            }
        }

        if (!empty($updates)) {
            $this->merge($updates);
        }
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required_without:nom|nullable|string|max:255',
            'nom' => 'required_without:full_name|nullable|string|max:255',
            'matricule' => 'nullable|string|max:255',
            'mat' => 'nullable|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'avatar' => 'nullable|string|max:255',
            'file_img' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'statut' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:255',
            'cin_validity' => 'nullable|date',
            'birth_date' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'birth_city' => 'nullable|string|max:255',
            'ville_o' => 'nullable|string|max:255',
            'rate' => 'nullable|numeric|min:0|max:5',
            'nationality' => 'nullable|string|max:255',
            'nationalite' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'niveau' => 'nullable|string|max:255',
            'education_specialty' => 'nullable|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'situation_familiale' => 'nullable|string|max:255',
            'children_count' => 'nullable|integer|min:0',
            'nombre_enfant' => 'nullable|integer|min:0',
            'children_details' => 'nullable|string',
            'cin_address' => 'nullable|string|max:255',
            'adresse_cin' => 'nullable|string|max:255',
            'origin_city' => 'nullable|string|max:255',
            'ville_origin' => 'nullable|string|max:255',
            'current_address' => 'nullable|string|max:255',
            'current_adresse' => 'nullable|string|max:255',
            'current_city' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_1' => 'nullable|string|max:255',
            'gsm1' => 'nullable|string|max:255',
            'gsm_1' => 'nullable|string|max:255',
            'phone_2' => 'nullable|string|max:255',
            'gsm2' => 'nullable|string|max:255',
            'gsm_2' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'job' => 'nullable|string|max:255',
            'fonction' => 'nullable|string|max:255',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'salary_period' => 'nullable|string|max:255',
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

