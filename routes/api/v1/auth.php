<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

/*
| Authentication — prefix /api/v1/auth
|
| Laravel Sanctum SPA authentication: the frontend first calls
| GET /sanctum/csrf-cookie, then these endpoints with the XSRF-TOKEN cookie
| echoed in the X-XSRF-TOKEN header. The session lives in an HttpOnly cookie.
|
| Google OAuth and the signed e-mail verification link are browser redirect
| flows and therefore live in routes/web.php.
*/

Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('me', [AuthenticatedSessionController::class, 'me'])->name('me');
    Route::get('options', [AuthenticatedSessionController::class, 'options'])->name('options');

    Route::middleware('guest.api')->group(function () {
        Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login');
        Route::post('register', [RegisteredUserController::class, 'store'])->name('register');
        Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
        Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

        Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('verification.send');

        Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])->name('password.confirm');
    });
});
