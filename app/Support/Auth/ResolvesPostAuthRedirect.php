<?php

namespace App\Support\Auth;

use App\Models\User;
use App\Services\Onboarding\OnboardingContextResolver;
use Illuminate\Http\RedirectResponse;

/**
 * Shared by every auth entry point (email/password login, email/password
 * register, Google OAuth callback) so a customer who started "Buat Undangan"
 * from a theme/package card — then had to authenticate — lands back on the
 * matching wizard step instead of a generic dashboard. Admins are never
 * affected: they always go to the admin dashboard, onboarding context
 * or not.
 */
trait ResolvesPostAuthRedirect
{
    protected function postAuthRedirect(User $user, ?int $themeId, ?int $packageId, ?string $packageTier): RedirectResponse
    {
        if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        $resolver = app(OnboardingContextResolver::class);
        $context = $resolver->resolve($themeId, $packageId, $packageTier);

        if ($resolver->hasContext($context)) {
            return redirect()->to($resolver->resolveUrl($context));
        }

        return redirect()->intended(route('customer.dashboard', absolute: false));
    }
}
