<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Responses\ApiResponse;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * GET /api/v1/settings/profile — data of the profile settings page.
     */
    public function edit(Request $request): JsonResponse
    {
        return ApiResponse::ok([
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
        ]);
    }

    /**
     * PATCH /api/v1/settings/profile — update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        $authUser = $request->user()->fresh()->toAuthArray();

        return ApiResponse::ok(['user' => $authUser], extra: ['auth' => ['user' => $authUser]]);
    }

    /**
     * DELETE /api/v1/settings/profile — delete the user's account.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::guard('web')->logout();

        $user->delete();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ApiResponse::redirect('/', extra: ['auth' => ['user' => null]]);
    }
}
