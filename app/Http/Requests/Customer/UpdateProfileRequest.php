<?php

namespace App\Http\Requests\Customer;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:255'],
            'email'               => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone_number'        => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'bio'                 => ['nullable', 'string', 'max:500'],
            'language'            => ['required', Rule::in(['id', 'en'])],
            'timezone'            => ['required', Rule::in(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'])],
            'notify_email'        => ['boolean'],
            'notify_whatsapp'     => ['boolean'],
            'photo'               => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo'        => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone_number.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung.',
            'photo.image'        => 'File harus berupa gambar.',
            'photo.mimes'        => 'Foto harus berformat JPG, PNG, atau WebP.',
            'photo.max'          => 'Ukuran foto maksimal 2 MB.',
        ];
    }
}
