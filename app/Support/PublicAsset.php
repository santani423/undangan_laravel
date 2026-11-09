<?php

namespace App\Support;

/**
 * Absolute URL for a file served from this backend's public/ directory.
 *
 * Some columns store root-relative paths (themes.thumbnail_url =
 * "/images/theme-covers/x.svg", written by ThemeCoverService). Under Inertia
 * the page and the file shared one origin; now the frontend runs on its own
 * origin, so API responses must hand out absolute URLs or the browser would
 * look for the file on the frontend host. The stored value is left as-is.
 */
final class PublicAsset
{
    public static function url(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        // Root-relative path ("/images/…", "/storage/…") — not protocol-relative "//host/…".
        if (str_starts_with($value, '/') && ! str_starts_with($value, '//')) {
            return url($value);
        }

        return $value;
    }
}
