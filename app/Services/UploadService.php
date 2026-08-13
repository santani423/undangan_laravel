<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use RuntimeException;
use Throwable;

class UploadService
{
    /**
     * Extensions stored as-is (no raster re-encode): vector/icon formats that
     * GD cannot decode (or that would lose their purpose if flattened to WebP).
     */
    private const PASSTHROUGH_EXTENSIONS = ['svg', 'svg+xml', 'ico'];

    private const WEBP_QUALITY = 82;

    /** Safety-net cap; individual form requests may enforce a tighter limit. */
    private const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

    /**
     * Upload an image from a base64 data URL, compress it, resize it, and convert to WebP.
     */
    public static function uploadBase64Image(string $dataUrl, string $directory, ?string $oldPath = null, int $maxWidth = 1200): string
    {
        if (! preg_match('/^data:image\/([\w+]+);base64,/', $dataUrl, $type)) {
            throw new RuntimeException('Format data gambar tidak valid.');
        }

        $extension = strtolower($type[1]);
        $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decodedData = base64_decode($data, true);

        if ($decodedData === false || $decodedData === '') {
            throw new RuntimeException('Data gambar rusak atau tidak dapat dibaca.');
        }

        if (strlen($decodedData) > self::MAX_IMAGE_BYTES) {
            throw new RuntimeException('Ukuran gambar melebihi batas maksimal yang diizinkan.');
        }

        if (in_array($extension, self::PASSTHROUGH_EXTENSIONS, true)) {
            $normalizedExt = str_contains($extension, 'svg') ? 'svg' : $extension;
            $path = self::storePassthrough($decodedData, $directory, $normalizedExt);
            self::cleanupOld($oldPath);
            return $path;
        }

        $path = self::convertAndStore($decodedData, $directory, $maxWidth);
        self::cleanupOld($oldPath);

        return $path;
    }

    /**
     * Upload an image from a real UploadedFile, compress it, resize it, and convert to WebP.
     */
    public static function uploadImage(UploadedFile $file, string $directory, ?string $oldPath = null, int $maxWidth = 1200): string
    {
        if (! $file->isValid()) {
            throw new RuntimeException('File yang diunggah tidak valid.');
        }

        if ($file->getSize() > self::MAX_IMAGE_BYTES) {
            throw new RuntimeException('Ukuran file melebihi batas maksimal yang diizinkan.');
        }

        $mime = (string) $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());

        $isSvg = $extension === 'svg' || $mime === 'image/svg+xml';
        $isIco = $extension === 'ico' || str_contains($mime, 'icon');

        if ($isSvg || $isIco) {
            $binary = file_get_contents($file->getRealPath());
            if ($binary === false) {
                throw new RuntimeException('Gagal membaca file yang diunggah.');
            }
            $path = self::storePassthrough($binary, $directory, $isIco ? 'ico' : 'svg');
            self::cleanupOld($oldPath);
            return $path;
        }

        $path = self::convertAndStore($file->get(), $directory, $maxWidth);
        self::cleanupOld($oldPath);

        return $path;
    }

    /**
     * Upload a non-image document securely (no conversion).
     */
    public static function uploadDocument(UploadedFile $file, string $directory, ?string $oldPath = null): string
    {
        if (! $file->isValid()) {
            throw new RuntimeException('File yang diunggah tidak valid.');
        }

        $filename = uniqid('doc_') . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');

        self::cleanupOld($oldPath);

        return $path;
    }

    /**
     * Helper to safely delete a file.
     */
    public static function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Resolve the correct MIME type for a path previously stored through this
     * service, based on its (already-normalized) extension.
     */
    public static function mimeTypeForPath(string $path): string
    {
        return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            default => 'application/octet-stream',
        };
    }

    /**
     * Decode, resize (proportionally, only if oversized), and re-encode as WebP.
     * Transparency (PNG/GIF alpha) and orientation are preserved by Intervention's
     * decoder/encoder — EXIF orientation is normalized and metadata stripped.
     */
    private static function convertAndStore(string $binary, string $directory, int $maxWidth): string
    {
        try {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($binary);

            if ($image->width() > $maxWidth || $image->height() > $maxWidth) {
                $image->scaleDown($maxWidth, $maxWidth);
            }

            $encoded = $image->toWebp(self::WEBP_QUALITY);
        } catch (Throwable $e) {
            throw new RuntimeException('Gagal memproses gambar. Pastikan file adalah gambar yang valid.', 0, $e);
        }

        $filename = uniqid('img_') . '_' . time() . '.webp';
        $path = $directory . '/' . $filename;

        Storage::disk('public')->put($path, $encoded->toString());

        return $path;
    }

    private static function storePassthrough(string $binary, string $directory, string $extension): string
    {
        $filename = uniqid('img_') . '_' . time() . '.' . $extension;
        $path = $directory . '/' . $filename;

        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    private static function cleanupOld(?string $oldPath): void
    {
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
    }
}
