<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards a route group by the user's role area ("admin" or "customer").
 * A logged-in user who belongs to the other area is redirected to the
 * dashboard that matches their own role instead of seeing a 403.
 *
 * Usage: ->middleware(['auth', 'area:admin'])
 */
class EnsureUserArea
{
    public function handle(Request $request, Closure $next, string $area): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->area() === $area) {
            return $next($request);
        }

        $ownDashboard = $user->dashboardRoute();

        if ($ownDashboard === null) {
            abort(403);
        }

        if ($request->expectsJson()) {
            abort(403);
        }

        return redirect()->route($ownDashboard);
    }
}
