<?php

namespace App\Services\Auth;

use App\Exceptions\Auth\GoogleAuthException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class GoogleAuthService
{
    /**
     * Resolve a local User for the given Google account.
     *
     * Resolution order: match by google_id (already linked) -> match by
     * verified email (link to existing password account) -> create new.
     * Linking only happens when Google reports the email as verified, to
     * prevent an attacker-controlled unverified email from taking over an
     * existing account.
     *
     * @throws GoogleAuthException
     */
    public function findOrCreateUser(SocialiteUser $googleUser): User
    {
        $googleId = (string) $googleUser->getId();
        $email = $googleUser->getEmail();
        $emailVerified = filter_var(
            $googleUser->user['email_verified'] ?? $googleUser->user['verified_email'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $googleId) {
            throw new GoogleAuthException('Login dengan Google gagal: Google tidak mengirimkan identitas akun.');
        }

        if (! $email) {
            throw new GoogleAuthException('Login dengan Google gagal: akun Google Anda tidak memiliki alamat email yang dapat dibagikan.');
        }

        // Already linked — this is the common path for returning users.
        $user = User::where('google_id', $googleId)->first();
        if ($user) {
            return $this->syncAvatar($user, $googleUser->getAvatar());
        }

        // Not yet linked: look for an existing account by email and link it,
        // but only if Google has verified that email actually belongs to
        // this person (otherwise this would be an account-takeover vector).
        $user = User::where('email', $email)->first();
        if ($user) {
            if (! $emailVerified) {
                throw new GoogleAuthException(
                    'Email Google Anda belum terverifikasi, sehingga tidak dapat dihubungkan ke akun yang sudah ada. '.
                    'Silakan verifikasi email Anda di Google terlebih dahulu, atau login menggunakan password.'
                );
            }

            $user->forceFill(['google_id' => $googleId])->save();

            return $this->syncAvatar($user, $googleUser->getAvatar());
        }

        // Brand new user. Password column is not nullable, so store a
        // random, unusable hash — this account can only sign in via Google
        // unless the user later sets a password through "forgot password".
        $user = User::create([
            'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
            'email' => $email,
            'password' => Hash::make(Str::random(40)),
            'google_id' => $googleId,
            'avatar' => $googleUser->getAvatar(),
        ]);

        // email_verified_at isn't mass-assignable (by design, it's not
        // meant to come from user input) — set it directly since this
        // value comes from Google, a trusted OAuth provider.
        if ($emailVerified) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        // New self-registered accounts always get the baseline "customer"
        // role, matching the seeded convention — never an elevated role.
        // A missing "customer" role (e.g. seeder not run yet) must not
        // block account creation/login, so this failure is swallowed.
        if (method_exists($user, 'assignRole')) {
            try {
                $user->assignRole('customer');
            } catch (RoleDoesNotExist $e) {
                Log::warning('Skipped assigning "customer" role to new Google user: role not seeded.', [
                    'user_id' => $user->id,
                ]);
            }
        }

        return $user;
    }

    /**
     * Keep the Google-sourced avatar up to date, without touching any other
     * profile field a user may have customized (e.g. their display name).
     */
    private function syncAvatar(User $user, ?string $avatar): User
    {
        if ($avatar && $user->avatar !== $avatar) {
            $user->forceFill(['avatar' => $avatar])->save();
        }

        return $user;
    }
}
