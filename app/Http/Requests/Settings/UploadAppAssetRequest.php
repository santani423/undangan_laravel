<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UploadAppAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'admin']) ?? false;
    }

    // Batas ukuran per tipe (KB)
    public const MAX_LOGO_KB    = 5120; // 5 MB
    public const MAX_FAVICON_KB = 2048; // 2 MB

    public function rules(): array
    {
        $type = $this->route('type'); // 'logo' or 'favicon'

        if ($type === 'favicon') {
            return [
                'file' => ['required', 'file', 'mimes:ico,png,jpg,jpeg,webp', 'max:' . self::MAX_FAVICON_KB],
            ];
        }

        return [
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:' . self::MAX_LOGO_KB],
        ];
    }

    public function messages(): array
    {
        $type     = $this->route('type');
        $maxKb    = $type === 'favicon' ? self::MAX_FAVICON_KB : self::MAX_LOGO_KB;
        $maxLabel = $maxKb >= 1024 ? ($maxKb / 1024) . ' MB' : $maxKb . ' KB';

        return [
            'file.required' => 'File wajib dipilih.',
            'file.file'     => 'Upload harus berupa file.',
            'file.mimes'    => 'Format file tidak didukung. Gunakan: ' . ($type === 'favicon' ? 'ICO, PNG, JPG, WEBP' : 'PNG, JPG, WEBP, SVG') . '.',
            'file.max'      => "Ukuran file melebihi batas yang diizinkan. Maksimal {$maxLabel}.",
        ];
    }
}
