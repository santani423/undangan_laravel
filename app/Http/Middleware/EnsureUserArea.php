<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Support\FrontendUrl;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards a route group by the user's role area ("admin" or "customer").
 * A logged-in user who belongs to the other area is sent to the dashboard
 * that matches their own role instead of seeing a plain 403: the API answers
 * 403 with a `redirect` to that dashboard, which the SPA follows.
 *
 * Usage: ->middleware(['auth:sanctum', 'area:admin'])
 */
class EnsureUserArea
{
    public function handle(Request $request, Closure $next, string $area): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson() || $request->is('api/*')
                ? ApiResponse::error('Unauthenticated.', 401, redirect: '/login')
                : redirect()->to(FrontendUrl::to('/login'));
        }

        if ($user->area() === $area) {
            return $next($request);
        }

        $ownDashboard = $user->dashboardPath();

        if ($ownDashboard === null) {
            abort(403);
        }

        return ApiResponse::error(
            'Halaman ini tidak tersedia untuk akun Anda.',
            403,
            redirect: $ownDashboard,
        );
    }
}
