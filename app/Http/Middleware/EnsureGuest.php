<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Support\FrontendUrl;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * JSON counterpart of Laravel's `guest` middleware for the API auth
 * endpoints (login, register, forgot/reset password). The stock middleware
 * answers with a 302 to a backend URL, which an XHR cannot use; this one
 * answers 409 with the frontend dashboard the user belongs to.
 */
class EnsureGuest
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if (! $user) {
            return $next($request);
        }

        $dashboard = $user->dashboardPath();

        return ApiResponse::error(
            'Anda sudah masuk.',
            409,
            redirect: $dashboard ?? '/',
        );
    }
}
