<?php

use App\Http\Controllers\Admin\Settings\PackageController;
use App\Http\Controllers\Settings\AppSettingController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

/*
| Account & system settings — prefix /api/v1/settings
|
| Pages without server data (/settings/appearance, /settings/payment) are
| rendered by the frontend only.
*/

Route::middleware('auth:sanctum')->prefix('settings')->group(function () {
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    // ── System settings (admin only) ─────────────────────────────────────────
    Route::middleware('area:admin')->group(function () {
        Route::get('app', [AppSettingController::class, 'edit'])->name('settings.app');
        Route::patch('app', [AppSettingController::class, 'update'])->name('settings.app.update');
        Route::post('app/assets/{type}', [AppSettingController::class, 'uploadAsset'])->name('settings.app.asset.upload')->where('type', 'logo|favicon');
        Route::delete('app/assets/{type}', [AppSettingController::class, 'deleteAsset'])->name('settings.app.asset.delete')->where('type', 'logo|favicon');

        Route::get('packages', [PackageController::class, 'index'])->name('settings.packages');
        Route::post('packages', [PackageController::class, 'store'])->name('settings.packages.store');
        Route::patch('packages/{package}', [PackageController::class, 'update'])->name('settings.packages.update');
        Route::patch('packages/{package}/features', [PackageController::class, 'updateFeatures'])->name('settings.packages.features');
        Route::delete('packages/{package}', [PackageController::class, 'destroy'])->name('settings.packages.destroy');
    });
});
