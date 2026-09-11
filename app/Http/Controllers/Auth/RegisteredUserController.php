<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Auth\ResolvesPostAuthRedirect;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class RegisteredUserController extends Controller
{
    use ResolvesPostAuthRedirect;

    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/register', [
            'onboardingThemeId' => $request->integer('theme_id') ?: null,
            'onboardingPackageId' => $request->integer('package_id') ?: null,
            'onboardingPackageTier' => $request->string('package_tier')->value() ?: null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'onboarding_theme_id' => 'nullable|integer',
            'onboarding_package_id' => 'nullable|integer',
            'onboarding_package_tier' => 'nullable|string|in:basic,premium,exclusive',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Baseline role for every self-registered account — matches the
        // convention already used for Google sign-ups. A missing seeded
        // role must never block account creation.
        try {
            $user->assignRole('customer');
        } catch (RoleDoesNotExist $e) {
            Log::warning('Skipped assigning "customer" role to new user: role not seeded.', [
                'user_id' => $user->id,
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return $this->postAuthRedirect(
            $user,
            $request->integer('onboarding_theme_id') ?: null,
            $request->integer('onboarding_package_id') ?: null,
            $request->input('onboarding_package_tier') ?: null,
        );
    }
}
