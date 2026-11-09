<?php

namespace App\Http\Responses;

use App\Support\FrontendUrl;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The single JSON envelope every /api/v1 endpoint answers with.
 *
 *   {
 *     "success": true,
 *     "message": "Undangan berhasil dibuat!",   // optional, shown as a flash toast
 *     "message_type": "info",                   // optional, only when not success/error
 *     "data": { ... },                          // optional payload / screen data
 *     "redirect": "/customer/invitations",      // optional frontend path to go to next
 *     "location": "https://checkout.xendit.co/…" // optional external URL (full page load)
 *   }
 *
 * Errors use the same shape with "success": false, the right HTTP status and,
 * for validation failures (422), Laravel's "errors": { field: [messages] }.
 * See docs/API_DOCUMENTATION.md.
 */
final class ApiResponse
{
    /** 2xx with a payload (screen data, a resource, a list…). */
    public static function ok(mixed $data = null, ?string $message = null, int $status = 200, array $extra = []): JsonResponse
    {
        return self::make(true, $status, ['message' => $message, 'data' => self::normalize($data)] + $extra);
    }

    /** 201 Created. */
    public static function created(mixed $data = null, ?string $message = null, array $extra = []): JsonResponse
    {
        return self::ok($data, $message, 201, $extra);
    }

    /** 2xx carrying only a flash message (the old `back()->with('success', …)`). */
    public static function message(string $message, string $type = 'success', int $status = 200, array $extra = []): JsonResponse
    {
        return self::make(true, $status, ['message' => $message, 'message_type' => $type === 'success' ? null : $type] + $extra);
    }

    /** 2xx telling the SPA which frontend path to show next (the old `redirect()->route(…)`). */
    public static function redirect(string $path, ?string $message = null, string $type = 'success', array $extra = []): JsonResponse
    {
        return self::make(true, 200, [
            'message'      => $message,
            'message_type' => $type === 'success' ? null : $type,
            'redirect'     => $path,
        ] + $extra);
    }

    /** Same as redirect() but resolved from a named API route. */
    public static function toRoute(string $name, mixed $parameters = [], ?string $message = null, string $type = 'success', array $extra = []): JsonResponse
    {
        return self::redirect(FrontendUrl::route($name, $parameters), $message, $type, $extra);
    }

    /** Send the browser to an external URL with a full page load (the old `Inertia::location()`). */
    public static function location(string $url, ?string $message = null): JsonResponse
    {
        return self::make(true, 200, ['message' => $message, 'location' => $url]);
    }

    /** 4xx/5xx with a message (the old `back()->with('error', …)`), optionally field errors and a redirect. */
    public static function error(string $message, int $status = 422, array $errors = [], ?string $redirect = null, array $extra = []): JsonResponse
    {
        return self::make(false, $status, [
            'message'  => $message,
            'errors'   => $errors === [] ? null : $errors,
            'redirect' => $redirect,
        ] + $extra);
    }

    private static function make(bool $success, int $status, array $payload): JsonResponse
    {
        $body = ['success' => $success];

        foreach ($payload as $key => $value) {
            // "data" is kept even when null on payload responses (ok/created) so clients can rely on it.
            if ($value !== null || $key === 'data') {
                $body[$key] = $value;
            }
        }

        return new JsonResponse($body, $status);
    }

    private static function normalize(mixed $data): mixed
    {
        if ($data instanceof JsonResource) {
            return $data->resolve();
        }

        if ($data instanceof Arrayable) {
            return $data->toArray();
        }

        return $data;
    }
}
