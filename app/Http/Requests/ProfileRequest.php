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
            'enfants_details' => 'children_details',
            'c_enfants_details' => 'children_details',
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

        // Serialize array children_details if array passed
        if ($this->has('children_details') && is_array($this->input('children_details'))) {
            $updates['children_details'] = json_encode($this->input('children_details'), JSON_UNESCAPED_UNICODE);
        } elseif ($this->has('enfants_details') && is_array($this->input('enfants_details'))) {
            $updates['children_details'] = json_encode($this->input('enfants_details'), JSON_UNESCAPED_UNICODE);
        }

        // Convert string representations to boolean
        if ($this->has('has_diseases')) {
            $val = $this->input('has_diseases');
            $updates['has_diseases'] = is_string($val) ? (strtolower(trim($val)) === 'oui' || $val === '1') : (bool)$val;
        } else {
            $updates['has_diseases'] = false;
        }

        if ($this->has('pet_allergies')) {
            $val = $this->input('pet_allergies');
            $updates['pet_allergies'] = is_string($val) ? (strtolower(trim($val)) === 'oui' || $val === '1') : (bool)$val;
        } else {
            $updates['pet_allergies'] = false;
        }

        // Clean empty string dates to null and extract YYYY-MM-DD
        foreach (['cin_validity', 'birth_date', 'date_naissance', 'cin_v'] as $dateField) {
            $val = $updates[$dateField] ?? $this->input($dateField);
            if ($val === '' || $val === null) {
                $updates[$dateField] = null;
            } elseif (is_string($val)) {
                $val = trim($val);
                if (strlen($val) > 10) {
                    $cleanDate = substr($val, 0, 10);
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $cleanDate)) {
                        $updates[$dateField] = $cleanDate;
                    }
                }
            }
        }

        // Clean empty string numbers to null or 0 for NOT NULL columns
        foreach (['min_price', 'max_price', 'experience_years'] as $numField) {
            if ($this->has($numField) && $this->input($numField) === '') {
                $updates[$numField] = null;
            }
        }

        // NOT NULL integer/decimal columns default to 0
        foreach (['children_count', 'nombre_enfant', 'rate'] as $intField) {
            $val = $updates[$intField] ?? $this->input($intField);
            if ($val === '' || $val === null) {
                $updates[$intField] = 0;
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

