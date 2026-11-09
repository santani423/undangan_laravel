<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\EventTypeController;
use App\Http\Controllers\Admin\InvitationController as AdminInvitationController;
use App\Http\Controllers\Admin\Settings\PackageController;
use App\Http\Controllers\Admin\Settings\PaymentSettingController;
use App\Http\Controllers\Admin\Themes\ThemeController;
use App\Http\Controllers\Admin\Transactions\TransactionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

/*
| Admin area — prefix /api/v1/admin
|
| Pages that had no server data in the original application (dashboard,
| admins/roles/permissions, invitations list, custom domains, theme
| categories, packages, refunds, testimonials, platform/revenue reports,
| general/WhatsApp/notification settings) are rendered by the frontend only.
*/

Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', 'area:admin'])->group(function () {

    // ─── Manajemen Pengguna ───────────────────────────────────────────────────
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::get('/{user}', [AdminUserController::class, 'show'])->name('show')->withTrashed();
    });

    // ─── Manajemen Undangan ───────────────────────────────────────────────────
    Route::prefix('invitations')->name('invitations.')->group(function () {
        Route::get('/check-slug', [AdminInvitationController::class, 'checkSlug'])->name('check-slug');
        Route::get('/{invitation:id}', [AdminInvitationController::class, 'show'])->name('show')->whereNumber('invitation');
        Route::patch('/{invitation:id}', [AdminInvitationController::class, 'update'])->name('update')->whereNumber('invitation');
        Route::patch('/{invitation:id}/settings', [AdminInvitationController::class, 'updateSettings'])->name('update-settings')->whereNumber('invitation');
        Route::patch('/{invitation:id}/theme', [AdminInvitationController::class, 'updateTheme'])->name('update-theme')->whereNumber('invitation');
        Route::post('/{invitation:id}/upload-music', [AdminInvitationController::class, 'uploadMusic'])->name('upload-music')->whereNumber('invitation');
    });

    // ─── Konten Platform ─────────────────────────────────────────────────────
    Route::prefix('event-types')->name('event-types.')->group(function () {
        Route::get('/', [EventTypeController::class, 'index'])->name('index');
        Route::post('/', [EventTypeController::class, 'store'])->name('store');
        Route::patch('/{eventType}/toggle', [EventTypeController::class, 'toggle'])->name('toggle');
        Route::patch('/{eventType}', [EventTypeController::class, 'update'])->name('update');
        Route::delete('/{eventType}', [EventTypeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('themes')->name('themes.')->group(function () {
        Route::get('/', [ThemeController::class, 'index'])->name('index');
        Route::post('/', [ThemeController::class, 'store'])->name('store');
        Route::patch('/reorder', [ThemeController::class, 'reorder'])->name('reorder');
        Route::patch('/{theme}/toggle', [ThemeController::class, 'toggle'])->name('toggle');
        Route::patch('/{theme}', [ThemeController::class, 'update'])->name('update');
        Route::delete('/{theme}', [ThemeController::class, 'destroy'])->name('destroy');
    });

    // ─── Keuangan & Transaksi ─────────────────────────────────────────────────
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/payments', [TransactionController::class, 'payments'])->name('payments');
        Route::get('/{transaction}', [TransactionController::class, 'show'])->name('show');
        Route::patch('/{transaction}/approve', [TransactionController::class, 'approve'])->name('approve');
        Route::patch('/{transaction}/reject', [TransactionController::class, 'reject'])->name('reject');
    });

    // ─── Laporan & Analitik ───────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs');
    });

    // ─── Pengaturan Sistem ────────────────────────────────────────────────────
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/packages', [PackageController::class, 'index'])->name('packages');
        Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
        Route::patch('/packages/{package}', [PackageController::class, 'update'])->name('packages.update');
        Route::patch('/packages/{package}/features', [PackageController::class, 'updateFeatures'])->name('packages.features');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::get('/payment', [PaymentSettingController::class, 'index'])->name('payment');
        Route::patch('/payment/gateways/{gateway}', [PaymentSettingController::class, 'updateGateway'])->name('payment.gateway.update');
        Route::patch('/payment/methods', [PaymentSettingController::class, 'updateMethods'])->name('payment.methods.update');
        Route::patch('/payment/webhook', [PaymentSettingController::class, 'updateWebhook'])->name('payment.webhook.update');
        Route::patch('/payment/qris', [PaymentSettingController::class, 'updateQris'])->name('payment.qris.update');
        Route::post('/payment/qris/test', [PaymentSettingController::class, 'testQris'])->name('payment.qris.test');
    });
});
