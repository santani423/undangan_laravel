<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'gender'       => 'nullable|in:male,female',
            'category'     => 'nullable|string|max:100',
            'notes'        => 'nullable|string|max:500',
        ];
    }
}
