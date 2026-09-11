<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\Auth\GoogleAuthException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\GoogleAuthService;
use App\Support\Auth\ResolvesPostAuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class GoogleAuthController extends Controller
{
    use ResolvesPostAuthRedirect;

    public function __construct(private readonly GoogleAuthService $googleAuthService) {}

    /**
     * Redirect the user to Google's OAuth consent screen.
     *
     * `intent` (login|register) is remembered in the session purely so the
     * callback can send the user back to the page they started from if
     * something goes wrong. The onboarding theme/package context (if any)
     * is stashed the same way, since Google's redirect round-trip can't
     * carry it any other way — it's re-validated against the database
     * again in the callback, exactly like the email/password paths.
     */
    public function redirect(Request $request): RedirectResponse
    {
        $request->session()->put(
            'google_auth_intent',
            $request->query('intent') === 'register' ? 'register' : 'login'
        );

        $request->session()->put('google_auth_onboarding', [
            'theme_id' => $request->integer('theme_id') ?: null,
            'package_id' => $request->integer('package_id') ?: null,
            'package_tier' => $request->query('package_tier') ?: null,
        ]);

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Handle Google's OAuth callback: resolve/create the local user, log
     * them in, and redirect to the right dashboard. Any failure is caught
     * and turned into a safe, generic flash message — never a raw
     * exception or stack trace.
     */
    public function callback(Request $request): RedirectResponse
    {
        $intent = $request->session()->pull('google_auth_intent', 'login');
        $fallbackRoute = $intent === 'register' ? 'register' : 'login';
        $onboarding = $request->session()->pull('google_auth_onboarding', []);

        if ($request->filled('error')) {
            // User declined consent on Google's screen, or Google reported
            // an OAuth-level error (e.g. access_denied).
            return redirect()->route($fallbackRoute)
                ->with('error', 'Login dengan Google dibatalkan.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();

            $user = $this->googleAuthService->findOrCreateUser($googleUser);

            Auth::login($user, true);
            $request->session()->regenerate();

            /** @var User $user */
            $user = Auth::user();

            return $this->postAuthRedirect(
                $user,
                $onboarding['theme_id'] ?? null,
                $onboarding['package_id'] ?? null,
                $onboarding['package_tier'] ?? null,
            );
        } catch (GoogleAuthException $e) {
            return redirect()->route($fallbackRoute)->with('error', $e->getMessage());
        } catch (InvalidStateException $e) {
            Log::warning('Google OAuth state mismatch on callback.', ['message' => $e->getMessage()]);

            return redirect()->route($fallbackRoute)
                ->with('error', 'Sesi login Google sudah kedaluwarsa. Silakan coba lagi.');
        } catch (Throwable $e) {
            Log::error('Google OAuth callback failed.', ['exception' => $e]);

            return redirect()->route($fallbackRoute)
                ->with('error', 'Terjadi kesalahan saat menghubungkan ke Google. Silakan coba lagi nanti.');
        }
    }
}
