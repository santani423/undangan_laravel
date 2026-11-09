<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * URLs of the standalone React frontend (FRONTEND_URL).
 *
 * Laravel no longer renders the UI, so every URL a browser is sent to —
 * payment gateway return URLs, OAuth/e-mail redirects, invitation preview
 * links, post-login redirects — must point at the frontend, not at the API.
 *
 * The SPA keeps the exact URL structure the Inertia app had, and every API
 * route keeps the name and URI it had as a web route, only prefixed with
 * /api/v1. So a frontend path is the API route's path without that prefix:
 * route('customer.invitations.edit', 'abc') → /api/v1/customer/invitations/abc/edit
 *                                          → /customer/invitations/abc/edit
 */
final class FrontendUrl
{
    public const API_PREFIX = '/api/v1';

    public static function base(): string
    {
        return rtrim((string) config('app.frontend_url'), '/');
    }

    /** Absolute frontend URL, e.g. to('/login') → https://undesia.com/login. */
    public static function to(string $path = '/', array $query = []): string
    {
        $path = '/' . ltrim($path, '/');
        $url = self::base() . ($path === '/' ? '/' : $path);

        if ($query !== []) {
            $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($query);
        }

        return $url;
    }

    /** Frontend path (relative, with query string) of a named API route. */
    public static function route(string $name, mixed $parameters = []): string
    {
        return self::fromApiUrl(route($name, $parameters, false));
    }

    /** Absolute frontend URL of a named API route. */
    public static function routeUrl(string $name, mixed $parameters = []): string
    {
        return self::to(self::route($name, $parameters));
    }

    /**
     * Map a URL generated for an API route to the matching frontend path:
     * "https://api.example.com/api/v1/customer?x=1" → "/customer?x=1".
     * Absolute URLs of anything else (gateways, the backend's own web routes
     * such as the signed e-mail verification link) are returned untouched so
     * the browser can still be sent there.
     */
    public static function fromApiUrl(string $url): string
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $relative = $url;

        if ($appUrl !== '' && str_starts_with($url, $appUrl)) {
            $relative = Str::after($url, $appUrl);
        } elseif (preg_match('#^https?://#i', $url)) {
            // Absolute URL of a host other than APP_URL (request host, gateway…).
            $parts = parse_url($url);
            $path = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');

            if (! str_starts_with($parts['path'] ?? '', self::API_PREFIX)) {
                return $url;
            }

            $relative = $path;
        }

        if ($relative === self::API_PREFIX || str_starts_with($relative, self::API_PREFIX . '/') || str_starts_with($relative, self::API_PREFIX . '?')) {
            $relative = substr($relative, strlen(self::API_PREFIX));
        } elseif ($relative !== $url && ! str_starts_with($relative, self::API_PREFIX)) {
            // A backend web route (e.g. /verify-email/1/hash?signature=…): keep it absolute.
            return $url;
        }

        $relative = $relative === '' ? '/' : $relative;

        return str_starts_with($relative, '/') ? $relative : '/' . $relative;
    }

    /**
     * Whether $path is a safe, same-site relative path (used for "intended"
     * redirects supplied by the SPA): must start with a single "/".
     */
    public static function isSafeRelativePath(?string $path): bool
    {
        return is_string($path)
            && $path !== ''
            && str_starts_with($path, '/')
            && ! str_starts_with($path, '//')
            && ! str_contains($path, '\\')
            && ! preg_match('/[\x00-\x1F]/', $path);
    }
}
