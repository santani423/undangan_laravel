<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\Auth\ResolvesPostAuthRedirect;
use Database\Seeders\Data\DevAccounts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    use ResolvesPostAuthRedirect;

    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            // Quick-login picker for seeded accounts — only exposed on non-production/debug envs.
            'devAccounts' => config('app.debug') ? $this->devAccounts() : [],
            'onboardingThemeId' => $request->integer('theme_id') ?: null,
            'onboardingPackageId' => $request->integer('package_id') ?: null,
            'onboardingPackageTier' => $request->string('package_tier')->value() ?: null,
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
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        return $this->postAuthRedirect(
            $user,
            $request->integer('onboarding_theme_id') ?: null,
            $request->integer('onboarding_package_id') ?: null,
            $request->input('onboarding_package_tier') ?: null,
        );
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
