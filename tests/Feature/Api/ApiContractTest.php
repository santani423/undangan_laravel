<?php

use App\Models\EventType;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\Theme;
use App\Models\User;
use App\Support\FrontendUrl;

/*
| Contract of the REST API consumed by the standalone frontend
| (docs/API_DOCUMENTATION.md): envelope, errors, CORS, URLs, SEO renderer.
*/

function contractInvitation(array $attrs = []): Invitation
{
    $eventType = EventType::firstOrCreate(['name' => 'wedding'], ['label' => 'Pernikahan', 'is_active' => true]);
    $package = Package::firstOrCreate(
        ['name' => 'pernikahan_exclusive'],
        ['label' => 'Eksklusif', 'invitation_type' => 'pernikahan', 'price' => 99000],
    );
    $theme = Theme::firstOrCreate(
        ['slug' => 'wedding_theme_01'],
        ['name' => 'Wedding Theme 01', 'event_type' => 'wedding', 'is_active' => true, 'thumbnail_url' => '/images/theme-covers/wedding_theme_01.svg'],
    );

    return Invitation::create(array_merge([
        'user_id'       => User::factory()->create()->id,
        'event_type_id' => $eventType->id,
        'package_id'    => $package->id,
        'theme_id'      => $theme->id,
        'slug'          => 'budi-dan-ani',
        'title'         => 'The Wedding of Budi & Ani',
        'status'        => 'active',
    ], $attrs));
}

it('answers unknown endpoints with the JSON error envelope', function () {
    $this->get('/api/v1/does-not-exist')
        ->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['success', 'message']);
});

it('answers missing models with a 404 envelope without leaking the model class', function () {
    config(['app.debug' => false]);

    $this->get($this->api('invitations/tidak-ada'))
        ->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Data tidak ditemukan.');
});

it('answers validation failures with 422 and field errors', function () {
    $this->post($this->api('auth/login'), [])
        ->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['message', 'errors' => ['email', 'password']]);
});

it('adds debug details to 500 errors only when APP_DEBUG is on', function () {
    Route::get('/api/v1/__boom', fn () => throw new RuntimeException('kaboom'));

    config(['app.debug' => true]);
    $this->get('/api/v1/__boom')
        ->assertStatus(500)
        ->assertJsonPath('success', false)
        ->assertJsonPath('debug.message', 'kaboom')
        ->assertJsonPath('debug.exception', RuntimeException::class);

    config(['app.debug' => false]);
    $this->get('/api/v1/__boom')
        ->assertStatus(500)
        ->assertJsonMissingPath('debug');
});

it('allows the frontend origin with credentials (CORS)', function () {
    config(['cors.allowed_origins' => ['http://localhost:5173']]);

    $this->withHeaders([
        'Origin' => 'http://localhost:5173',
        'Access-Control-Request-Method' => 'POST',
    ])->options($this->api('auth/login'))
        ->assertNoContent()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

it('serves the public viewer for /{code} and /{code}/{visitor}', function () {
    $invitation = contractInvitation();
    Guest::create(['invitation_id' => $invitation->id, 'name' => 'Pak Joko', 'slug' => 'pak-joko']);

    $this->get($this->api('invitations/budi-dan-ani'))
        ->assertOk()
        ->assertJsonPath('data.themeSlug', 'wedding_theme_01')
        ->assertJsonPath('data.invitation.ogUrl', FrontendUrl::to('/budi-dan-ani'))
        ->assertJsonPath('data.invitation.rsvpEndpoint', url('/api/v1/invitations/budi-dan-ani/rsvp'))
        ->assertJsonPath('data.invitation.wishesEndpoint', url('/api/v1/invitations/budi-dan-ani/wishes'));

    $this->get($this->api('invitations/budi-dan-ani/visitors/pak-joko'))
        ->assertOk()
        ->assertJsonPath('data.visitor', 'pak-joko')
        ->assertJsonPath('data.invitation.guestName', 'Pak Joko')
        ->assertJsonPath('data.invitation.guestSlug', 'pak-joko');
});

it('keeps the legacy /api/inv aliases used by already-open invitations', function () {
    contractInvitation(['allow_guest_comments' => true]);

    $this->postJson('/api/inv/budi-dan-ani/wishes', ['name' => 'Sari', 'message' => 'Selamat!'])
        ->assertCreated()
        ->assertJsonPath('success', true);

    $this->getJson('/api/v1/invitations/budi-dan-ani/wishes')
        ->assertOk()
        ->assertJsonPath('wishes.0.name', 'Sari');
});

it('hands out absolute URLs for files served by the backend', function () {
    contractInvitation();

    $this->get($this->api('themes'))
        ->assertOk()
        ->assertJsonPath('data.themes.0.thumbnail', url('/images/theme-covers/wedding_theme_01.svg'))
        ->assertJsonStructure(['data' => ['seo' => ['title', 'description', 'canonical', 'meta', 'jsonLd']]]);
});

it('renders Open Graph tags of an invitation for link-preview bots', function () {
    contractInvitation();

    $this->withHeaders(['Accept' => 'text/html'])->get('/seo/budi-dan-ani')
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, follow')
        ->assertSee('<meta property="og:title" content="The Wedding of Budi &amp; Ani">', false)
        ->assertSee('<meta property="og:url" content="'.FrontendUrl::to('/budi-dan-ani').'">', false);
});

it('renders indexable SEO tags and JSON-LD for the landing page', function () {
    $this->withHeaders(['Accept' => 'text/html'])->get('/seo')
        ->assertOk()
        ->assertSee('<link rel="canonical" href="'.config('seo.site_url').'/">', false)
        ->assertSee('application/ld+json', false)
        ->assertSee(config('seo.pages.welcome.title'));
});

it('keeps app pages and unknown invitations out of search results', function () {
    $this->withHeaders(['Accept' => 'text/html'])->get('/seo/login')
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, follow');

    $this->withHeaders(['Accept' => 'text/html'])->get('/seo/kode-tidak-ada')
        ->assertNotFound()
        ->assertSee('<meta name="robots" content="noindex, follow">', false);
});

it('no longer exposes the unauthenticated test-invitation route', function () {
    $this->get('/test-invitation')->assertNotFound();
    expect(Invitation::count())->toBe(0);
});
