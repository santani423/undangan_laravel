<?php

use App\Http\Controllers\InvitationPublicApiController;
use App\Http\Controllers\Webhook\MidtransWebhookController;
use App\Http\Controllers\Webhook\XenditWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes (prefix /api)
|--------------------------------------------------------------------------
|
| /api/v1/*        — the REST API consumed by the React frontend (frontend/).
|                    Route names and URIs mirror the URLs of the SPA, so a page
|                    at /customer/invitations loads GET /api/v1/customer/invitations.
| /api/webhooks/*  — payment gateway callbacks. Their URLs are registered in the
|                    Xendit / Midtrans dashboards, so they are kept unversioned.
| /api/inv/*       — legacy public invitation endpoints, kept as aliases of
|                    /api/v1/invitations/{code}/… for already-open invitations.
|
| See docs/API_DOCUMENTATION.md.
*/

// ─── Payment webhooks (no auth; verified by callback token / signature) ──────
Route::post('/webhooks/xendit', [XenditWebhookController::class, 'handle'])->name('webhooks.xendit');
Route::post('/webhooks/midtrans', [MidtransWebhookController::class, 'handle'])->name('webhooks.midtrans');

// ─── Legacy public invitation API (aliases of /api/v1/invitations/{code}/…) ──
Route::prefix('inv/{code}')->middleware('throttle:public-invitation')->group(function () {
    Route::post('/rsvp',   [InvitationPublicApiController::class, 'rsvp'])->name('inv.rsvp');
    Route::get('/wishes',  [InvitationPublicApiController::class, 'wishes'])->name('inv.wishes');
    Route::post('/wishes', [InvitationPublicApiController::class, 'submitWish'])->name('inv.wishes.submit');
});

// ─── v1 ──────────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    require __DIR__.'/api/v1/public.php';
    require __DIR__.'/api/v1/auth.php';
    require __DIR__.'/api/v1/settings.php';
    require __DIR__.'/api/v1/customer.php';
    require __DIR__.'/api/v1/admin.php';
});
