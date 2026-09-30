<?php

use App\Models\EventType;
use App\Models\Invitation;
use App\Models\InvitationContent;
use App\Models\Package;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/** A birthday invitation; $photoPath (public disk) becomes its celebrant photo. */
function shareInvitation(?string $photoPath = null): Invitation
{
    $eventType = EventType::firstOrCreate(['name' => 'birthday'], ['label' => 'Ulang Tahun', 'is_active' => true]);
    $package = Package::firstOrCreate(
        ['name' => 'ulang_tahun_exclusive'],
        ['label' => 'Eksklusif', 'invitation_type' => 'birthday', 'price' => 99000],
    );
    $theme = Theme::firstOrCreate(
        ['slug' => 'birthday-theme-01'],
        ['name' => 'birthday-theme-01', 'event_type' => 'birthday', 'is_active' => true],
    );

    $invitation = Invitation::create([
        'user_id'       => User::factory()->create()->id,
        'event_type_id' => $eventType->id,
        'package_id'    => $package->id,
        'theme_id'      => $theme->id,
        'slug'          => 'undangan-share-' . uniqid(),
        'title'         => 'Undangan Ulang Tahun',
        'status'        => 'active',
    ]);

    if ($photoPath !== null) {
        InvitationContent::create([
            'invitation_id' => $invitation->id,
            'content_key'   => 'child_photo',
            'content_value' => $photoPath,
            'content_type'  => 'path',
        ]);
    }

    return $invitation;
}

/** Stores a WebP photo the way UploadService does and returns its public-disk path. */
function shareWebpPhoto(int $width, int $height): string
{
    $path = 'invitations/1/content/img_' . uniqid() . '.webp';

    Storage::disk('public')->put(
        $path,
        (new ImageManager(new Driver()))->create($width, $height)->fill('f43f5e')->toWebp(82)->toString(),
    );

    return $path;
}

beforeEach(fn () => Storage::fake('public'));

it('shares a WebP photo as a JPEG preview and a PNG favicon', function () {
    $invitation = shareInvitation(shareWebpPhoto(1600, 1200));

    $response = $this->get('/' . $invitation->slug)->assertOk();
    $props = $response->viewData('page')['props']['invitation'];

    expect($props['ogImage'])->toStartWith(asset('storage/share/'))->toEndWith('-og.jpg')
        ->and($props['favicon'])->toStartWith(asset('storage/share/'))->toEndWith('-icon.png')
        ->and($props['ogImageType'])->toBe('image/jpeg')
        ->and([$props['ogImageWidth'], $props['ogImageHeight']])->toBe([1200, 900]);

    $disk = Storage::disk('public');
    $ogFile = $disk->path(Str::after($props['ogImage'], asset('storage') . '/'));
    $iconFile = $disk->path(Str::after($props['favicon'], asset('storage') . '/'));

    expect(getimagesize($ogFile)['mime'])->toBe('image/jpeg')
        ->and(filesize($ogFile))->toBeLessThanOrEqual(300 * 1024)
        ->and(array_slice(getimagesize($iconFile), 0, 2))->toBe([192, 192])
        ->and(getimagesize($iconFile)['mime'])->toBe('image/png');

    $response
        ->assertSee('<meta property="og:image" content="' . $props['ogImage'] . '">', false)
        ->assertSee('<meta property="og:image:type" content="image/jpeg">', false)
        ->assertSee('<meta property="og:image:width" content="1200">', false)
        ->assertSee('<meta name="twitter:image" content="' . $props['ogImage'] . '">', false)
        ->assertSee('<link rel="icon" href="' . $props['favicon'] . '" type="image/png" sizes="192x192">', false)
        ->assertDontSee('.webp"', false);
});

it('reuses the generated files on later visits', function () {
    $invitation = shareInvitation(shareWebpPhoto(400, 400));

    $first = $this->get('/' . $invitation->slug)->viewData('page')['props']['invitation'];
    $files = Storage::disk('public')->files('share');
    $second = $this->get('/' . $invitation->slug)->viewData('page')['props']['invitation'];

    expect($files)->toHaveCount(2)
        ->and(Storage::disk('public')->files('share'))->toBe($files)
        ->and($second['ogImage'])->toBe($first['ogImage']);
});

it('falls back to the brand image and app favicon without a photo', function () {
    $invitation = shareInvitation();

    $response = $this->get('/' . $invitation->slug)->assertOk();
    $props = $response->viewData('page')['props']['invitation'];

    expect($props['ogImage'])->toBe(asset(config('seo.og_image.path')))
        ->and($props['favicon'])->toBeNull();

    $response
        ->assertSee('<meta property="og:image" content="' . $props['ogImage'] . '">', false)
        ->assertSee('favicon.ico?v=', false)
        ->assertSee('favicon-192x192.png?v=', false);
});

it('ships the brand share image and favicons', function (string $file) {
    expect(public_path($file))->toBeFile();
})->with([
    'images/brand/og-image.png',
    'favicon.ico',
    'favicon-48x48.png',
    'favicon-192x192.png',
    'apple-touch-icon.png',
]);
