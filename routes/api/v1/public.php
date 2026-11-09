<?php

use App\Http\Controllers\AppConfigController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InvitationPublicApiController;
use App\Http\Controllers\InvitationPublicController;
use App\Http\Controllers\ThemeCatalogController;
use Illuminate\Support\Facades\Route;

/*
| Public endpoints (no authentication) — prefix /api/v1
*/

// App-wide data the SPA shows on every page (was the Inertia shared props `name` / `quote`).
Route::get('app/config', [AppConfigController::class, 'show'])->name('app.config');

// ─── Landing & catalog ───────────────────────────────────────────────────────
Route::get('landing', [HomeController::class, 'index'])->name('home');
Route::get('landing/wedding', [HomeController::class, 'wedding'])->name('wedding.index');

Route::get('themes', [ThemeCatalogController::class, 'index'])->name('themes.index');
// Theme preview: the seeded sample invitation of that theme, in the real viewer format.
Route::get('themes/{theme:slug}/sample', [InvitationPublicController::class, 'sample'])->name('themes.sample');

// ─── Public invitation (viewer + guest interactions) ─────────────────────────
Route::prefix('invitations/{code}')
    ->where(['code' => '[A-Za-z0-9_-]+'])
    ->group(function () {
        Route::middleware('throttle:public-invitation')->group(function () {
            Route::post('rsvp', [InvitationPublicApiController::class, 'rsvp'])->name('invitations.rsvp');
            Route::get('wishes', [InvitationPublicApiController::class, 'wishes'])->name('invitations.wishes');
            Route::post('wishes', [InvitationPublicApiController::class, 'submitWish'])->name('invitations.wishes.submit');
        });

        Route::get('/', [InvitationPublicController::class, 'show'])->name('invitation.view');
        // Personalised link /{code}/{visitor} of the SPA.
        Route::get('visitors/{visitor}', [InvitationPublicController::class, 'show'])
            ->where('visitor', '[A-Za-z0-9_-]+')
            ->name('invitation.view.visitor');
    });
