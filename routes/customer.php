<?php

use App\Http\Controllers\Customer\InvitationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('customer')->name('customer.')->middleware(['auth'])->group(function () {

    // ─── Dashboard ────────────────────────────────────────────────────────────
    Route::get('/', fn () => Inertia::render('customer/dashboard'))->name('dashboard');

    // ─── Undangan ─────────────────────────────────────────────────────────────
    Route::prefix('invitations')->name('invitations.')->group(function () {
        Route::get('/',                       fn () => Inertia::render('customer/invitations/index'))->name('index');
        Route::get('/create',                 [InvitationController::class, 'create'])->name('create');
        Route::get('/create/theme',           [InvitationController::class, 'selectTheme'])->name('create.theme');
        Route::get('/create/detail',          [InvitationController::class, 'createDetail'])->name('create.detail');
        Route::post('/',                      [InvitationController::class, 'store'])->name('store');
        Route::get('/{invitation}',           fn () => Inertia::render('customer/invitations/show'))->name('show');
        Route::get('/{invitation}/edit',      fn () => Inertia::render('customer/invitations/edit'))->name('edit');
        Route::patch('/{invitation}',         fn () => abort(501))->name('update');
        Route::delete('/{invitation}',        fn () => abort(501))->name('destroy');

        // ── Tamu ──────────────────────────────────────────────────────────────
        Route::prefix('{invitation}/guests')->name('guests.')->group(function () {
            Route::get('/',    fn () => Inertia::render('customer/invitations/guests/index'))->name('index');
            Route::post('/',   fn () => abort(501))->name('store');
            Route::patch('/{guest}', fn () => abort(501))->name('update');
            Route::delete('/{guest}', fn () => abort(501))->name('destroy');
        });
    });

    // ─── Paket & Langganan ────────────────────────────────────────────────────
    Route::prefix('subscription')->name('subscription.')->group(function () {
        Route::get('/',        fn () => Inertia::render('customer/subscription/index'))->name('index');
        Route::get('/upgrade', fn () => Inertia::render('customer/subscription/upgrade'))->name('upgrade');
    });

    // ─── Transaksi ────────────────────────────────────────────────────────────
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/',              fn () => Inertia::render('customer/transactions/index'))->name('index');
        Route::get('/{transaction}', fn () => Inertia::render('customer/transactions/show'))->name('show');
    });

    // ─── Profil ───────────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/',    fn () => Inertia::render('customer/profile/index'))->name('index');
        Route::patch('/',  fn () => abort(501))->name('update');
    });
});
