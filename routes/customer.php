<?php

use App\Http\Controllers\Customer\CommentController;
use App\Http\Controllers\Customer\DigitalWalletController;
use App\Http\Controllers\Customer\GuestBookController;
use App\Http\Controllers\Customer\InvitationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('customer')->name('customer.')->middleware(['auth'])->group(function () {

    // ─── Dashboard ────────────────────────────────────────────────────────────
    Route::get('/', fn () => Inertia::render('customer/dashboard'))->name('dashboard');

    // ─── Undangan ─────────────────────────────────────────────────────────────
    Route::prefix('invitations')->name('invitations.')->group(function () {
        Route::get('/',                       [InvitationController::class, 'index'])->name('index');
        Route::get('/create',                 [InvitationController::class, 'create'])->name('create');
        Route::get('/create/theme',           [InvitationController::class, 'selectTheme'])->name('create.theme');
        Route::get('/create/detail',          [InvitationController::class, 'createDetail'])->name('create.detail');
        Route::get('/check-code',             [InvitationController::class, 'checkCode'])->name('check-code');
        Route::post('/',                      [InvitationController::class, 'store'])->name('store');
        Route::get('/{invitation}',           fn () => Inertia::render('customer/invitations/show'))->name('show');
        Route::get('/{invitation}/edit',      [InvitationController::class, 'edit'])->name('edit');
        Route::get('/{slug}/detail',          [InvitationController::class, 'edit'])->name('detail');
        Route::patch('/{invitation}/theme',   [InvitationController::class, 'updateTheme'])->name('update-theme');
        Route::patch('/{invitation}',         [InvitationController::class, 'update'])->name('update');
        Route::delete('/{invitation}',        fn () => abort(501))->name('destroy');

        // ── Buku Tamu ─────────────────────────────────────────────────────────
        Route::prefix('{invitation}/guests')->name('guests.')->group(function () {
            Route::get('/',                  [GuestBookController::class, 'index'])->name('index');
            Route::post('/',                 [GuestBookController::class, 'store'])->name('store');
            Route::patch('/{guest}',         [GuestBookController::class, 'update'])->name('update');
            Route::patch('/{guest}/checkin', [GuestBookController::class, 'checkIn'])->name('checkin');
            Route::delete('/{guest}',        [GuestBookController::class, 'destroy'])->name('destroy');
            Route::get('/export/csv',        [GuestBookController::class, 'export'])->name('export');
        });

        // ── Komentar ──────────────────────────────────────────────────────────
        Route::prefix('{invitation}/comments')->name('comments.')->group(function () {
            Route::get('/',                       [CommentController::class, 'index'])->name('index');
            Route::patch('/{comment}/approve',    [CommentController::class, 'approve'])->name('approve');
            Route::patch('/{comment}/reject',     [CommentController::class, 'reject'])->name('reject');
            Route::patch('/{comment}/flag',       [CommentController::class, 'flag'])->name('flag');
            Route::delete('/{comment}',           [CommentController::class, 'destroy'])->name('destroy');
            Route::post('/bulk',                  [CommentController::class, 'bulkAction'])->name('bulk');
        });

        // ── Dompet Digital per undangan ───────────────────────────────────────
        Route::prefix('{invitation}/digital-wallets')->name('digital-wallets.')->group(function () {
            Route::get('/',    [DigitalWalletController::class, 'invitationWallets'])->name('index');
            Route::post('/sync', [DigitalWalletController::class, 'syncInvitationWallets'])->name('sync');
        });
    });

    // ─── Dompet Digital (global milik user) ───────────────────────────────────
    Route::prefix('digital-wallets')->name('digital-wallets.')->group(function () {
        Route::get('/',                        [DigitalWalletController::class, 'index'])->name('index');
        Route::post('/',                       [DigitalWalletController::class, 'store'])->name('store');
        Route::patch('/{digitalWallet}',       [DigitalWalletController::class, 'update'])->name('update');
        Route::delete('/{digitalWallet}',      [DigitalWalletController::class, 'destroy'])->name('destroy');
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
