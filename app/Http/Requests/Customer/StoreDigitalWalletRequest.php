<?php

namespace App\Http\Requests\Customer;

use App\Rules\Base64Image;
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
            'logo'           => ['nullable', 'string', new Base64Image(maxKb: 2048, allowRemove: true)],
            'qris_qr'        => ['nullable', 'string', new Base64Image(maxKb: 2048)], // base64 image
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
