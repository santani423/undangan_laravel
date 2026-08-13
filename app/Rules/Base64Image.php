<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates a "data:image/...;base64,..." payload used across the app for
 * client-side image uploads (invitation photos, gallery, wallet logos, etc.).
 *
 * Values that are not a base64 data URL (empty, an existing /storage/ path,
 * or the literal "remove" sentinel) are left untouched — those are handled
 * by the controllers themselves. This rule only guards the base64 branch.
 */
class Base64Image implements ValidationRule
{
    private const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'svg+xml', 'svg'];

    public function __construct(
        private readonly int $maxKb = 10240, // 10 MB
        private readonly bool $allowRemove = false,
    ) {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        if ($this->allowRemove && $value === 'remove') {
            return;
        }

        if (! str_starts_with($value, 'data:')) {
            // Not a base64 payload (existing storage path, plain text field, etc.) — not our concern.
            return;
        }

        if (! preg_match('/^data:image\/([\w+]+);base64,/', $value, $matches)) {
            $fail('Format gambar tidak valid.');
            return;
        }

        $extension = strtolower($matches[1]);
        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            $fail('Format gambar tidak didukung. Gunakan JPG, PNG, GIF, BMP, atau WEBP.');
            return;
        }

        $encoded = substr($value, strpos($value, ',') + 1);
        $decoded = base64_decode($encoded, true);

        if ($decoded === false || $decoded === '') {
            $fail('Data gambar rusak atau tidak dapat dibaca.');
            return;
        }

        $sizeKb = strlen($decoded) / 1024;
        if ($sizeKb > $this->maxKb) {
            $maxLabel = $this->maxKb >= 1024 ? rtrim(rtrim(number_format($this->maxKb / 1024, 1), '0'), '.') . ' MB' : $this->maxKb . ' KB';
            $fail("Ukuran gambar melebihi batas maksimal {$maxLabel}.");
            return;
        }

        if (str_contains($extension, 'svg')) {
            if (preg_match('/<script|on\w+\s*=|javascript:/i', $decoded)) {
                $fail('File SVG mengandung konten yang tidak diizinkan.');
            }
            return;
        }

        if (@getimagesizefromstring($decoded) === false) {
            $fail('Data gambar tidak valid atau rusak.');
        }
    }
}
