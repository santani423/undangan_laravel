<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreDigitalWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider'       => 'required|string|max:50',
            'provider_label' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name'   => 'required|string|max:150',
            'logo'           => 'nullable|string', // base64 or existing path
            'is_active'      => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'provider.required'       => 'Pilih penyedia dompet digital.',
            'account_number.required' => 'Nomor akun wajib diisi.',
            'account_name.required'   => 'Nama pemilik akun wajib diisi.',
        ];
    }
}
