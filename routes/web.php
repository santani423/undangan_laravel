<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InvitationPublicController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WeddingThemePreviewController;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/tess', function () {
    return view('tess');
});
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('undangan/pernikahan', [HomeController::class, 'wedding'])->name('wedding.index');
Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::get('themes', function (Request $request) {
    $themes = Theme::where('is_active', true)
        ->withExists('sampleInvitation')
        ->ordered()
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
            'usage_count'     => $t->usage_count,
            'tags'            => $t->tags ?? [],
            'sample_url'      => $t->sampleUrl($t->sample_invitation_exists),
        ]);

    return Inertia::render('themes/index', [
        'themes'     => $themes,
        // Pre-selects the event filter, e.g. when coming from a landing showcase tab.
        'event_type' => $request->string('event_type')->toString(),
    ]);
})->name('themes.index');

// Theme preview: opens the seeded sample invitation of that theme in the real viewer.
Route::get('themes/{theme:slug}/sample', [InvitationPublicController::class, 'sample'])
    ->name('themes.sample');

Route::prefix('preview/themes/wedding')->group(function () {
    Route::get('/{theme}', function (string $theme) {
        $queryString = request()->getQueryString();

        return redirect()->to('/preview/themes/wedding/' . $theme . '/index.html' . ($queryString ? '?' . $queryString : ''));
    })->where('theme', '[A-Za-z0-9_-]+')->name('preview.wedding.redirect');

    Route::get('/{theme}/index.html', [WeddingThemePreviewController::class, 'show'])
        ->where('theme', '[A-Za-z0-9_-]+')
        ->name('preview.wedding.show');

    Route::get('/{theme}/assets/{path}', [WeddingThemePreviewController::class, 'asset'])
        ->where([
            'theme' => '[A-Za-z0-9_-]+',
            'path'  => '.*',
        ])
        ->name('preview.wedding.asset');
});

Route::middleware(['auth'])->group(function () {
    // Generic entry point: send each user to the dashboard for their role.
    Route::get('dashboard', function (Request $request) {
        $route = $request->user()->dashboardRoute();

        abort_if($route === null, 403);

        return redirect()->route($route);
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
Route::get('/{code}/{visitor}', [InvitationPublicController::class, 'show'])
    ->name('invitation.view')
    ->where('code', '[A-Za-z0-9_-]+')
    ->where('visitor', '[A-Za-z0-9_-]+');
require __DIR__ . '/test.php';
