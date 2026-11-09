<?php

namespace App\Providers;

use App\Services\ActivityLogger;
use App\Support\FrontendUrl;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auth events → activity log. The actor is taken from the event, since
        // the guard may not yet (or no longer) hold the user at this point.
        Event::listen(Login::class, fn (Login $event) => ActivityLogger::record('login', $event->user, null, $event->user->getAuthIdentifier()));
        Event::listen(Logout::class, fn (Logout $event) => $event->user
            ? ActivityLogger::record('logout', $event->user, null, $event->user->getAuthIdentifier())
            : null);
        Event::listen(Registered::class, fn (Registered $event) => ActivityLogger::record('registered', $event->user, null, $event->user->getAuthIdentifier()));
        Event::listen(PasswordReset::class, fn (PasswordReset $event) => ActivityLogger::record('password_reset', $event->user, null, $event->user->getAuthIdentifier()));

        // The password reset e-mail links to the SPA page, which posts the new
        // password to POST /api/v1/auth/reset-password.
        ResetPassword::createUrlUsing(fn ($user, string $token) => FrontendUrl::to(
            '/reset-password/'.$token,
            ['email' => $user->getEmailForPasswordReset()],
        ));

        // Pagination links of API responses point at the matching SPA path
        // (/api/v1/admin/reports/activity-logs?page=2 → /admin/reports/activity-logs?page=2),
        // so the pages can keep rendering Laravel's paginator `links` as-is.
        Paginator::currentPathResolver(function () {
            $request = request();

            return $request->is('api/v1/*')
                ? FrontendUrl::fromApiUrl('/'.ltrim($request->path(), '/'))
                : $request->url();
        });

        // Public invitation interactions (RSVP / wishes) — generous per-IP limit,
        // since many guests at a venue can share one network.
        RateLimiter::for('public-invitation', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
    }
}
