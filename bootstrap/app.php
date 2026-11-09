<?php

use App\Http\Middleware\EnsureGuest;
use App\Http\Middleware\EnsureUserArea;
use App\Support\FrontendUrl;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/** Requests answered as JSON: the whole API plus any client that asks for JSON. */
$wantsJson = fn (Request $request): bool => $request->is('api/*') || $request->expectsJson();

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum SPA authentication: API requests coming from the frontend
        // origin (SANCTUM_STATEFUL_DOMAINS) get the session cookie and CSRF
        // (XSRF-TOKEN) protection; anything else (webhooks, server-to-server)
        // stays stateless.
        $middleware->statefulApi();

        // Endpoints called without an XSRF header: payment gateway webhooks and
        // the public invitation interactions (RSVP / wishes) that every theme
        // posts with a plain fetch(). Both were stateless API routes before.
        $middleware->validateCsrfTokens(except: [
            'api/webhooks/*',
            'api/inv/*',
            'api/v1/invitations/*/rsvp',
            'api/v1/invitations/*/wishes',
        ]);

        $middleware->alias([
            'area'      => EnsureUserArea::class,
            'guest.api' => EnsureGuest::class,
        ]);

        // A guest opening a backend web route that needs a session (the signed
        // e-mail verification link) is sent to the SPA login page; a logged-in
        // user opening a guest-only web route (Google OAuth) to the dashboard.
        $middleware->redirectGuestsTo(fn () => FrontendUrl::to('/login'));
        $middleware->redirectUsersTo(fn () => FrontendUrl::to('/dashboard'));
    })
    ->withExceptions(function (Exceptions $exceptions) use ($wantsJson) {
        $exceptions->dontFlash([
            'current_password',
            'password',
            'password_confirmation',
            'field_values',
            'gallery_items',
            'love_story',
            'acara_events',
        ]);

        $exceptions->shouldRenderJsonWhen($wantsJson);

        // Normalise every JSON error into the API envelope (see App\Http\Responses\ApiResponse):
        // { success: false, message, errors?, debug? }.
        $exceptions->respond(function (Response $response, \Throwable $e, Request $request) use ($wantsJson) {
            if (! $response instanceof JsonResponse || ! $wantsJson($request)) {
                return $response;
            }

            $status = $response->getStatusCode();
            $original = (array) $response->getData(true);
            $message = trim((string) ($original['message'] ?? ''));

            if ($message === '' || ($status === 404 && ! config('app.debug') && str_starts_with($message, 'No query results'))) {
                $message = $status === 404 ? 'Data tidak ditemukan.' : (Response::$statusTexts[$status] ?? 'Error');
            }

            $body = ['success' => false, 'message' => $message];

            if (isset($original['errors'])) {
                $body['errors'] = $original['errors'];
            }

            // With APP_DEBUG=true the frontend error page shows the real cause
            // (same details the old Inertia error page received).
            if ($status >= 500 && config('app.debug')) {
                $relative = fn (string $file) => str_replace('\\', '/', Str::after($file, base_path().DIRECTORY_SEPARATOR));

                $body['debug'] = [
                    'exception' => $e::class,
                    'message'   => $e->getMessage(),
                    'file'      => $relative($e->getFile()),
                    'line'      => $e->getLine(),
                    // App frames only (vendor frames are noise when locating our own bug).
                    'trace'     => collect($e->getTrace())
                        ->filter(fn ($f) => isset($f['file']) && ! str_contains(str_replace('\\', '/', $f['file']), '/vendor/'))
                        ->take(10)
                        ->map(fn ($f) => $relative($f['file']).':'.($f['line'] ?? '?'))
                        ->values()
                        ->all(),
                ];
            }

            return $response->setData($body);
        });
    })->create();
