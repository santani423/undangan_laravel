<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Support\Auth\ResolvesPostAuthRedirect;
use Database\Seeders\Data\DevAccounts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class AuthenticatedSessionController extends Controller
{
    use ResolvesPostAuthRedirect;

    /**
     * GET /api/v1/auth/me — the signed-in user (or null).
     * Replaces the `auth.user` prop Inertia used to share with every page.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user('sanctum') ?? $request->user();

        return ApiResponse::ok(['user' => $user?->toAuthArray()]);
    }

    /**
     * GET /api/v1/auth/options — server-side data of the login page.
     */
    public function options(): JsonResponse
    {
        return ApiResponse::ok([
            'canResetPassword' => Route::has('auth.password.email'),
            // Quick-login picker for seeded accounts — only exposed on non-production/debug envs.
            'devAccounts' => config('app.debug') ? $this->devAccounts() : [],
        ]);
    }

    /**
     * Seeded accounts made available to the login page for quick access
     * while APP_DEBUG=true.
     */
    private function devAccounts(): array
    {
        return collect(DevAccounts::all())
            ->map(fn (array $account) => [
                'label' => "{$account['name']} ({$account['role']})",
                'email' => $account['email'],
                'password' => $account['password'],
            ])
            ->values()
            ->all();
    }

    /**
     * POST /api/v1/auth/login — handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        /** @var User $user */
        $user = Auth::user();

        $authUser = $user->toAuthArray();

        return ApiResponse::ok(
            ['user' => $authUser],
            extra: ['auth' => ['user' => $authUser], 'redirect' => $this->postAuthRedirect(
                $request,
                $user,
                $request->integer('onboarding_theme_id') ?: null,
                $request->integer('onboarding_package_id') ?: null,
                $request->input('onboarding_package_tier') ?: null,
            )],
        );
    }

    /**
     * POST /api/v1/auth/logout — destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ApiResponse::redirect('/', extra: ['auth' => ['user' => null]]);
    }
}
