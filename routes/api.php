<?php

use App\Http\Controllers\InvitationPublicApiController;
use App\Http\Controllers\Webhook\XenditWebhookController;
use Illuminate\Support\Facades\Route;

// ─── Xendit Payment Webhook (no auth, verified via callback token) ────────────
Route::post('/webhooks/xendit', [XenditWebhookController::class, 'handle'])->name('webhooks.xendit');

// ─── Public invitation API (RSVP & wishes — no auth required) ────────────────
Route::prefix('inv/{code}')->group(function () {
    Route::post('/rsvp',   [InvitationPublicApiController::class, 'rsvp'])->name('inv.rsvp');
    Route::get('/wishes',  [InvitationPublicApiController::class, 'wishes'])->name('inv.wishes');
    Route::post('/wishes', [InvitationPublicApiController::class, 'submitWish'])->name('inv.wishes.submit');
});
