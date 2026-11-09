<?php

namespace App\Support\Auth;

use App\Models\User;
use App\Services\Onboarding\OnboardingContextResolver;
use App\Support\FrontendUrl;
use Illuminate\Http\Request;

/**
 * Shared by every auth entry point (email/password login, email/password
 * register, Google OAuth callback) so a customer who started "Buat Undangan"
 * from a theme/package card — then had to authenticate — lands back on the
 * matching wizard step instead of a generic dashboard. Admins are never
 * affected: they always go to the admin dashboard (or the page they were
 * originally heading to), onboarding context or not.
 *
 * Returns a frontend path ("/customer"), or an absolute URL when the intended
 * destination is a backend web route (e.g. the signed e-mail verification link).
 */
trait ResolvesPostAuthRedirect
{
    protected function postAuthRedirect(Request $request, User $user, ?int $themeId, ?int $packageId, ?string $packageTier): string
    {
        $intended = $this->pullIntendedUrl($request);

        if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
            return $intended ?? '/admin';
        }

        $resolver = app(OnboardingContextResolver::class);
        $context = $resolver->resolve($themeId, $packageId, $packageTier);

        if ($resolver->hasContext($context)) {
            return $resolver->resolveUrl($context);
        }

        return $intended ?? '/customer';
    }

    /**
     * The "intended" destination, like redirect()->intended(): the URL a
     * backend web route stored in the session when it bounced a guest (signed
     * e-mail verification link), else the SPA path the frontend guard was
     * protecting (request field `intended`, a same-site relative path only).
     */
    private function pullIntendedUrl(Request $request): ?string
    {
        $fromSession = $request->hasSession() ? $request->session()->pull('url.intended') : null;

        if (is_string($fromSession) && $fromSession !== '') {
            return FrontendUrl::fromApiUrl($fromSession);
        }

        $fromSpa = $request->input('intended');

        return FrontendUrl::isSafeRelativePath($fromSpa) ? $fromSpa : null;
    }
}
