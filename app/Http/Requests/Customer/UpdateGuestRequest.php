<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => 'sometimes|required|string|max:255',
            'email'          => 'nullable|email|max:255',
            'phone_number'   => 'nullable|string|max:20',
            'gender'         => 'nullable|in:male,female',
            'category'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:500',
            'rsvp_status'    => 'sometimes|in:pending,attending,not_attending,maybe',
            'rsvp_headcount' => 'nullable|integer|min:0|max:100',
            'checked_in_at'  => 'nullable|date',
        ];
    }
}
