<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UploadService
{
    /**
     * Upload an image from a base64 string, compress it, resize it, and convert to WebP.
     */
    public static function uploadBase64Image(string $dataUrl, string $directory, ?string $oldPath = null, int $maxWidth = 1200): string
    {
        preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $type);
        $extension = strtolower($type[1] ?? 'png');
        
        $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decodedData = base64_decode($data);
        
        if (in_array($extension, ['svg+xml', 'svg'])) {
            $filename = uniqid('img_') . '_' . time() . '.svg';
            $path     = $directory . '/' . $filename;
            Storage::disk('public')->put($path, $decodedData);
        } else {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($decodedData);
            
            // Resize proportionally if exceeds maxWidth
            if ($image->width() > $maxWidth || $image->height() > $maxWidth) {
                $image->scaleDown($maxWidth, $maxWidth);
            }
            
            // Encode as WebP with 80% quality (strips EXIF automatically)
            $encoded = $image->toWebp(80);
            
            $filename = uniqid('img_') . '_' . time() . '.webp';
            $path     = $directory . '/' . $filename;
            
            Storage::disk('public')->put($path, $encoded->toString());
        }
        
        // Delete old file if provided
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        
        return $path;
    }

    /**
     * Upload an image from an UploadedFile, compress it, resize it, and convert to WebP.
     */
    public static function uploadImage(UploadedFile $file, string $directory, ?string $oldPath = null, int $maxWidth = 1200): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (in_array($extension, ['svg'])) {
            $filename = uniqid('img_') . '_' . time() . '.svg';
            $path = $file->storeAs($directory, $filename, 'public');
            
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
            return $path;
        }

        $manager = new ImageManager(new Driver());
        $image = $manager->read($file->get());
        
        // Resize proportionally if exceeds maxWidth
        if ($image->width() > $maxWidth || $image->height() > $maxWidth) {
            $image->scaleDown($maxWidth, $maxWidth);
        }
        
        // Encode as WebP with 80% quality
        $encoded = $image->toWebp(80);
        
        $filename = uniqid('img_') . '_' . time() . '.webp';
        $path     = $directory . '/' . $filename;
        
        Storage::disk('public')->put($path, $encoded->toString());
        
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        
        return $path;
    }

    /**
     * Upload a non-image document securely.
     */
    public static function uploadDocument(UploadedFile $file, string $directory, ?string $oldPath = null): string
    {
        $filename = uniqid('doc_') . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');
        
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        
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
}
