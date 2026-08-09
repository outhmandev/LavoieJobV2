<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.max' => 'Le motif de refus ne doit pas dépasser 1000 caractères.',
        ];
    }
}
