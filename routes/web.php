<?php

use App\Http\Controllers\InvitationPublicController;
use App\Models\Theme;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/tess', function () {
    return view('tess');
});
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('themes', function () {
    $themes = Theme::where('is_active', true)
        ->orderByDesc('usage_count')
        ->get()
        ->map(fn (Theme $t) => [
            'id'              => $t->id,
            'name'            => $t->name,
            'slug'            => $t->slug,
            'category'        => $t->category,
            'event_type'      => $t->event_type,
            'thumbnail'       => $t->thumbnail_url ?? '',
            'color_primary'   => $t->color_primary,
            'color_secondary' => $t->color_secondary,
            'is_premium'      => $t->is_premium,
            'is_exclusive'    => $t->is_exclusive,
            'price'           => $t->price,
            'usage_count'     => $t->usage_count,
            'tags'            => $t->tags ?? [],
        ]);

    return Inertia::render('themes/index', [
        'themes' => $themes,
    ]);
})->name('themes.index');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/customer.php';

// ─── Public invitation viewer — must be last (catch-all) ─────────────────────
Route::get('/{code}', [InvitationPublicController::class, 'show'])
    ->name('invitation.view')
    ->where('code', '[A-Za-z0-9_-]+');
