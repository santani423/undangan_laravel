<?php

namespace Tests\Unit;

use App\Services\UploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function pngDataUrl(int $width = 20, int $height = 20, bool $transparent = true): string
    {
        $image = imagecreatetruecolor($width, $height);
        if ($transparent) {
            imagealphablending($image, false);
            imagesavealpha($image, true);
            $color = imagecolorallocatealpha($image, 255, 0, 0, 64);
        } else {
            $color = imagecolorallocate($image, 255, 0, 0);
        }
        imagefilledrectangle($image, 0, 0, $width, $height, $color);

        ob_start();
        imagepng($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,' . base64_encode($binary);
    }

    public function test_base64_image_is_converted_to_webp(): void
    {
        $path = UploadService::uploadBase64Image($this->pngDataUrl(), 'test-dir');

        $this->assertStringEndsWith('.webp', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_transparency_is_preserved_when_converting_png(): void
    {
        $path = UploadService::uploadBase64Image($this->pngDataUrl(2000, 2000, true), 'test-dir');

        $binary = Storage::disk('public')->get($path);
        $image = imagecreatefromstring($binary);

        $this->assertNotFalse($image);
        $this->assertTrue(imageistruecolor($image) || imagecolorstotal($image) === 0);

        // Sample a corner pixel — it should carry an alpha channel value (not fully opaque solid fill).
        $rgba = imagecolorat($image, 0, 0);
        $alpha = ($rgba & 0x7F000000) >> 24;
        $this->assertGreaterThan(0, $alpha);
    }

    public function test_oversized_image_is_downscaled(): void
    {
        $path = UploadService::uploadBase64Image($this->pngDataUrl(2000, 1000, false), 'test-dir', null, 1200);

        $binary = Storage::disk('public')->get($path);
        [$width, $height] = getimagesizefromstring($binary);

        $this->assertLessThanOrEqual(1200, $width);
        $this->assertLessThanOrEqual(1200, $height);
        // Aspect ratio preserved (2:1)
        $this->assertEqualsWithDelta(2.0, $width / $height, 0.05);
    }

    public function test_old_file_is_deleted_after_successful_replace(): void
    {
        $first = UploadService::uploadBase64Image($this->pngDataUrl(), 'test-dir');
        Storage::disk('public')->assertExists($first);

        $second = UploadService::uploadBase64Image($this->pngDataUrl(), 'test-dir', $first);

        Storage::disk('public')->assertExists($second);
        Storage::disk('public')->assertMissing($first);
    }

    public function test_invalid_base64_payload_throws(): void
    {
        $this->expectException(\RuntimeException::class);

        UploadService::uploadBase64Image('data:image/png;base64,not-a-real-image', 'test-dir');
    }

    public function test_malformed_data_url_throws(): void
    {
        $this->expectException(\RuntimeException::class);

        UploadService::uploadBase64Image('not-a-data-url-at-all', 'test-dir');
    }

    public function test_svg_is_stored_without_raster_conversion(): void
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
        $dataUrl = 'data:image/svg+xml;base64,' . base64_encode($svg);

        $path = UploadService::uploadBase64Image($dataUrl, 'test-dir');

        $this->assertStringEndsWith('.svg', $path);
        $this->assertSame($svg, Storage::disk('public')->get($path));
    }

    public function test_mime_type_for_path_resolves_webp(): void
    {
        $this->assertSame('image/webp', UploadService::mimeTypeForPath('foo/bar.webp'));
        $this->assertSame('image/svg+xml', UploadService::mimeTypeForPath('foo/bar.svg'));
    }
}
