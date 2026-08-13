<?php

namespace Tests\Unit;

use App\Rules\Base64Image;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class Base64ImageRuleTest extends TestCase
{
    private function pngDataUrl(): string
    {
        $image = imagecreatetruecolor(5, 5);
        imagefilledrectangle($image, 0, 0, 5, 5, imagecolorallocate($image, 0, 0, 0));
        ob_start();
        imagepng($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,' . base64_encode($binary);
    }

    public function test_passes_for_valid_base64_image(): void
    {
        $validator = Validator::make(['photo' => $this->pngDataUrl()], ['photo' => [new Base64Image()]]);

        $this->assertTrue($validator->passes());
    }

    public function test_passes_through_non_data_url_values(): void
    {
        $validator = Validator::make(['photo' => '/storage/existing/path.webp'], ['photo' => [new Base64Image()]]);
        $this->assertTrue($validator->passes());

        $validator = Validator::make(['photo' => 'plain text field value'], ['photo' => [new Base64Image()]]);
        $this->assertTrue($validator->passes());

        $validator = Validator::make(['photo' => null], ['photo' => ['nullable', new Base64Image()]]);
        $this->assertTrue($validator->passes());
    }

    public function test_fails_for_corrupt_base64_payload(): void
    {
        $validator = Validator::make(
            ['photo' => 'data:image/png;base64,dGhpcyBpcyBub3QgYSByZWFsIGltYWdl'],
            ['photo' => [new Base64Image()]],
        );

        $this->assertTrue($validator->fails());
    }

    public function test_fails_for_disallowed_extension(): void
    {
        $validator = Validator::make(
            ['photo' => 'data:image/tiff;base64,' . base64_encode('fake')],
            ['photo' => [new Base64Image()]],
        );

        $this->assertTrue($validator->fails());
    }

    public function test_fails_when_exceeding_max_size(): void
    {
        $validator = Validator::make(
            ['photo' => $this->pngDataUrl()],
            ['photo' => [new Base64Image(maxKb: 0)]],
        );

        $this->assertTrue($validator->fails());
    }

    public function test_allow_remove_sentinel(): void
    {
        $validator = Validator::make(['logo' => 'remove'], ['logo' => [new Base64Image(allowRemove: true)]]);
        $this->assertTrue($validator->passes());

        $validator = Validator::make(['logo' => 'remove'], ['logo' => [new Base64Image(allowRemove: false)]]);
        $this->assertTrue($validator->passes()); // "remove" isn't a data: URL, so it's passed through either way
    }

    public function test_fails_for_svg_with_script_tag(): void
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
        $validator = Validator::make(
            ['photo' => 'data:image/svg+xml;base64,' . base64_encode($svg)],
            ['photo' => [new Base64Image()]],
        );

        $this->assertTrue($validator->fails());
    }
}
