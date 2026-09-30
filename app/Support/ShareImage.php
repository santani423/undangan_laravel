<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Throwable;

/**
 * Link-preview image and tab icon for a public invitation.
 *
 * Uploaded photos are stored as WebP (UploadService), which WhatsApp's link
 * preview does not render and which browsers won't reliably take as a favicon
 * at full photo size. So each photo gets two derived files on the public disk,
 * built once and then served statically:
 *
 *   share/{key}-og.jpg    JPEG, at most 1200px, kept under WhatsApp's size limit
 *   share/{key}-icon.png  192x192 PNG, center-cropped
 *
 * {key} follows the source file, so replacing the photo yields new URLs and
 * crawlers/browsers never keep showing a stale cached image.
 */
class ShareImage
{
    private const DIRECTORY = 'share';

    private const OG_MAX_SIDE = 1200;

    /** WhatsApp skips preview images that are too heavy; stay well below that. */
    private const OG_MAX_BYTES = 300 * 1024;

    private const OG_QUALITIES = [82, 70, 58];

    private const ICON_SIZE = 192;

    /**
     * @param  string|null  $photoUrl  the invitation's main photo, as sent to the viewer
     * @return array{og: array{url: string, type: ?string, width: ?int, height: ?int}, icon: ?string}
     *         icon is null when the page should keep the app's own favicon.
     */
    public static function for(?string $photoUrl): array
    {
        if (empty($photoUrl)) {
            return ['og' => self::brandImage(), 'icon' => null];
        }

        // An external URL (or a file that is gone) can't be converted; pass it through.
        $asIs = ['og' => ['url' => $photoUrl, 'type' => null, 'width' => null, 'height' => null], 'icon' => null];

        $source = self::publicDiskPath($photoUrl);
        $disk = Storage::disk('public');

        if ($source === null || ! $disk->exists($source)) {
            return $asIs;
        }

        $key = substr(md5($source . '|' . $disk->lastModified($source) . '|' . $disk->size($source)), 0, 16);
        $ogPath = self::DIRECTORY . "/{$key}-og.jpg";
        $iconPath = self::DIRECTORY . "/{$key}-icon.png";

        try {
            if (! $disk->exists($ogPath) || ! $disk->exists($iconPath)) {
                self::generate($disk->get($source), $ogPath, $iconPath);
            }

            [$width, $height] = getimagesize($disk->path($ogPath));
        } catch (Throwable $e) {
            report($e);

            return $asIs;
        }

        return [
            'og' => [
                'url'    => asset('storage/' . $ogPath),
                'type'   => 'image/jpeg',
                'width'  => $width,
                'height' => $height,
            ],
            'icon' => asset('storage/' . $iconPath),
        ];
    }

    /** The site-wide share image, for invitations that have no photo yet. */
    private static function brandImage(): array
    {
        return [
            'url'    => asset(config('seo.og_image.path')),
            'type'   => 'image/png',
            'width'  => config('seo.og_image.width'),
            'height' => config('seo.og_image.height'),
        ];
    }

    /** Path on the public disk behind an asset('storage/...') URL, or null for any other URL. */
    private static function publicDiskPath(string $url): ?string
    {
        $prefix = asset('storage') . '/';

        if (! str_starts_with($url, $prefix)) {
            return null;
        }

        $path = rawurldecode(Str::before(Str::after($url, $prefix), '?'));

        return $path === '' || str_contains($path, '..') ? null : $path;
    }

    private static function generate(string $binary, string $ogPath, string $iconPath): void
    {
        $manager = new ImageManager(new Driver());
        $disk = Storage::disk('public');

        $photo = $manager->read($binary)->scaleDown(self::OG_MAX_SIDE, self::OG_MAX_SIDE);
        // JPEG has no alpha channel: flatten onto white so transparent areas don't turn black.
        $og = $manager->create($photo->width(), $photo->height())->fill('ffffff')->place($photo);

        foreach (self::OG_QUALITIES as $quality) {
            $encoded = $og->toJpeg($quality)->toString();

            if (strlen($encoded) <= self::OG_MAX_BYTES) {
                break;
            }
        }

        $disk->put($ogPath, $encoded);

        $disk->put(
            $iconPath,
            $manager->read($binary)->cover(self::ICON_SIZE, self::ICON_SIZE)->toPng()->toString(),
        );
    }
}
