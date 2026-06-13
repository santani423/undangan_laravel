<?php

use App\Http\Controllers\Admin\Settings\PackageController;
use App\Http\Controllers\Admin\Themes\ThemeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->name('admin.')->middleware(['auth'])->group(function () {

    // ─── Dashboard ───────────────────────────────────────────────────────────
    Route::get('/', fn () => Inertia::render('admin/dashboard'))->name('dashboard');

    // ─── Manajemen Pengguna ───────────────────────────────────────────────────
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', fn () => Inertia::render('admin/users/index'))->name('index');
        Route::get('/admins', fn () => Inertia::render('admin/users/admins'))->name('admins');
        Route::get('/roles', fn () => Inertia::render('admin/users/roles'))->name('roles');
        Route::get('/permissions', fn () => Inertia::render('admin/users/permissions'))->name('permissions');
    });

    // ─── Manajemen Undangan ───────────────────────────────────────────────────
    Route::prefix('invitations')->name('invitations.')->group(function () {
        Route::get('/', fn () => Inertia::render('admin/invitations/index'))->name('index');
        Route::get('/custom-domains', fn () => Inertia::render('admin/invitations/custom-domains'))->name('custom-domains');
    });

    // ─── Konten Platform ─────────────────────────────────────────────────────
    Route::prefix('event-types')->name('event-types.')->group(function () {
        Route::get('/', fn () => Inertia::render('admin/event-types/index'))->name('index');
    });

    Route::prefix('themes')->name('themes.')->group(function () {
        // ── static sub-pages dulu (sebelum parameter {theme}) ──────────────
        Route::get('/categories', fn () => Inertia::render('admin/themes/categories'))->name('categories');

        // ── CRUD ────────────────────────────────────────────────────────────
        Route::get('/',                 [ThemeController::class, 'index'])->name('index');
        Route::post('/',                [ThemeController::class, 'store'])->name('store');
        Route::patch('/{theme}/toggle', [ThemeController::class, 'toggle'])->name('toggle');
        Route::patch('/{theme}',        [ThemeController::class, 'update'])->name('update');
        Route::delete('/{theme}',       [ThemeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('packages')->name('packages.')->group(function () {
        Route::get('/', fn () => Inertia::render('admin/packages/index'))->name('index');
    });

    // ─── Keuangan & Transaksi ─────────────────────────────────────────────────
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', fn () => Inertia::render('admin/transactions/index'))->name('index');
        Route::get('/payments', fn () => Inertia::render('admin/transactions/payments'))->name('payments');
        Route::get('/refunds', fn () => Inertia::render('admin/transactions/refunds'))->name('refunds');
    });

    // ─── Konten & Komunitas ───────────────────────────────────────────────────
    Route::prefix('content')->name('content.')->group(function () {
        Route::get('/testimonials', fn () => Inertia::render('admin/content/testimonials'))->name('testimonials');
    });

    // ─── Laporan & Analitik ───────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/platform', fn () => Inertia::render('admin/reports/platform'))->name('platform');
        Route::get('/revenue', fn () => Inertia::render('admin/reports/revenue'))->name('revenue');
        Route::get('/activity-logs', fn () => Inertia::render('admin/reports/activity-logs'))->name('activity-logs');
    });

    // ─── Pengaturan Sistem ────────────────────────────────────────────────────
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/general', fn () => Inertia::render('admin/settings/general'))->name('general');
        Route::get('/packages',                       [PackageController::class, 'index'])->name('packages');
        Route::post('/packages',                      [PackageController::class, 'store'])->name('packages.store');
        Route::patch('/packages/{package}',           [PackageController::class, 'update'])->name('packages.update');
        Route::patch('/packages/{package}/features',  [PackageController::class, 'updateFeatures'])->name('packages.features');
        Route::delete('/packages/{package}',          [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::get('/payment', fn () => Inertia::render('admin/settings/payment'))->name('payment');
        Route::get('/whatsapp', fn () => Inertia::render('admin/settings/whatsapp'))->name('whatsapp');
        Route::get('/notification', fn () => Inertia::render('admin/settings/notification'))->name('notification');
    });
});
