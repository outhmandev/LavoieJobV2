<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'assignment_id' => ['required', 'exists:assignments,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'assignment_id.required' => 'Une affectation est requise pour demander un contrat.',
            'assignment_id.exists' => "L'affectation sélectionnée n'existe pas.",
            'notes.max' => 'Les notes ne doivent pas dépasser 1000 caractères.',
        ];
    }
}
