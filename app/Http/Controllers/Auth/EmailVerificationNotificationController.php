<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * POST /api/v1/auth/email/verification-notification — send a new email verification notification.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return ApiResponse::redirect($request->user()->dashboardPath() ?? '/');
        }

        $request->user()->sendEmailVerificationNotification();

        return ApiResponse::message('verification-link-sent', extra: ['status' => 'verification-link-sent']);
    }
}
