<?php

use App\Http\Middleware\EnsureUserArea;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'area' => EnsureUserArea::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontFlash([
            'current_password',
            'password',
            'password_confirmation',
            'field_values',
            'gallery_items',
            'love_story',
            'acara_events',
        ]);

        $exceptions->respond(function (Response $response, \Throwable $e, Request $request) {
            $status = $response->getStatusCode();

            if (in_array($status, [404, 403, 410, 500, 503]) && ! $request->expectsJson()) {
                $props = ['status' => $status];

                // With APP_DEBUG=true the generic error page would otherwise hide
                // the real cause, so hand the exception details to the UI.
                if ($status === 500 && config('app.debug')) {
                    $relative = fn (string $file) => str_replace('\\', '/', Str::after($file, base_path().DIRECTORY_SEPARATOR));

                    $props['debug'] = [
                        'exception' => $e::class,
                        'message' => $e->getMessage(),
                        'file' => $relative($e->getFile()),
                        'line' => $e->getLine(),
                        // App frames only (vendor frames are noise when locating our own bug).
                        'trace' => collect($e->getTrace())
                            ->filter(fn ($f) => isset($f['file']) && ! str_contains(str_replace('\\', '/', $f['file']), '/vendor/'))
                            ->take(10)
                            ->map(fn ($f) => $relative($f['file']).':'.($f['line'] ?? '?'))
                            ->values()
                            ->all(),
                    ];
                }

                return Inertia::render('error', $props)
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
