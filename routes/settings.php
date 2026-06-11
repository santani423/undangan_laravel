<?php

use App\Http\Controllers\Admin\Settings\PackageController;
use App\Http\Controllers\Settings\AppSettingController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // ── Pengaturan Sistem ──────────────────────────────────────────────────────
    Route::get('settings/app',    [AppSettingController::class, 'edit'])->name('settings.app');
    Route::patch('settings/app',  [AppSettingController::class, 'update'])->name('settings.app.update');
    Route::post('settings/app/assets/{type}',   [AppSettingController::class, 'uploadAsset'])->name('settings.app.asset.upload')->where('type', 'logo|favicon');
    Route::delete('settings/app/assets/{type}', [AppSettingController::class, 'deleteAsset'])->name('settings.app.asset.delete')->where('type', 'logo|favicon');

    Route::get('settings/payment', function () {
        return Inertia::render('settings/payment');
    })->name('settings.payment');

    Route::get('settings/packages',                       [PackageController::class, 'index'])->name('settings.packages');
    Route::post('settings/packages',                      [PackageController::class, 'store'])->name('settings.packages.store');
    Route::patch('settings/packages/{package}',           [PackageController::class, 'update'])->name('settings.packages.update');
    Route::patch('settings/packages/{package}/features',  [PackageController::class, 'updateFeatures'])->name('settings.packages.features');
    Route::delete('settings/packages/{package}',          [PackageController::class, 'destroy'])->name('settings.packages.destroy');
});
