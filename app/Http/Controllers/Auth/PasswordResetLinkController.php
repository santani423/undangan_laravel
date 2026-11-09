<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class PasswordResetLinkController extends Controller
{
    /**
     * POST /api/v1/auth/forgot-password — handle an incoming password reset link request.
     * The e-mailed link points at the SPA (/reset-password/{token}), see AppServiceProvider.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink(
            $request->only('email')
        );

        $status = __('A reset link will be sent if the account exists.');

        return ApiResponse::message($status, extra: ['status' => $status]);
    }
}
