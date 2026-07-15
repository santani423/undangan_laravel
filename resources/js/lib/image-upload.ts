// Shared client-side helpers for image upload fields across the app.
// Final format conversion to WebP always happens server-side (see App\Services\UploadService);
// this module only validates the picked file and pre-compresses it before it's sent as base64.

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

export const ACCEPTED_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp';

export const MAX_IMAGE_MB = 8;

/**
 * Returns a user-facing error message if the file fails type/size checks, or null if it's valid.
 */
export function validateImageFile(file: File, maxMb: number = MAX_IMAGE_MB): string | null {
    if (!file.type.startsWith('image/')) {
        return 'Format file tidak didukung. Harap upload gambar (JPG, PNG, WEBP, GIF, atau BMP).';
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return 'Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau BMP.';
    }

    if (file.size <= 0) {
        return 'File gambar tidak valid atau kosong.';
    }

    if (file.size > maxMb * 1024 * 1024) {
        return `Ukuran gambar maksimal ${maxMb} MB.`;
    }

    return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file.'));
        reader.readAsDataURL(file);
    });
}
