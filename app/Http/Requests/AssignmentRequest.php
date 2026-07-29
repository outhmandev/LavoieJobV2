<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'profile_id' => 'required|exists:profiles,id',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'agreed_price' => 'nullable|numeric|min:0',
            'payment_schedule' => 'nullable|string|max:255',
            'rest_days' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
