<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Support\Auth\ResolvesPostAuthRedirect;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class RegisteredUserController extends Controller
{
    use ResolvesPostAuthRedirect;

    /**
     * POST /api/v1/auth/register — handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
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

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $authUser = $user->fresh()->toAuthArray();

        return ApiResponse::created(
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
}
