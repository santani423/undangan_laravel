<?php

namespace App\Providers;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
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
    }
}
