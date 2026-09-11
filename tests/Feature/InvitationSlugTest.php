<?php

use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Str;

function makeBirthdayInvitationContext(): array
{
    $user = User::factory()->create();

    $eventType = EventType::create([
        'name' => 'birthday',
        'label' => 'ulang_tahun',
        'description' => 'Undangan pesta ulang tahun',
        'icon_path' => 'icons/birthday.svg',
        'is_active' => true,
    ]);

    $package = Package::create([
        'name' => 'birthday-basic',
        'invitation_type' => 'ulang_tahun',
        'label' => 'Birthday Basic',
        'description' => 'Paket dasar ulang tahun',
        'price' => 0,
        'currency' => 'IDR',
        'billing_period' => 'month',
        'is_active' => true,
        'display_order' => 0,
    ]);

    $theme = Theme::create([
        'name' => 'Birthday Theme',
        'slug' => 'birthday-theme',
        'event_type' => 'birthday',
        'is_active' => true,
    ]);

    return compact('user', 'eventType', 'package', 'theme');
}

function createInvitationForSlugTest(array $context, array $overrides = []): Invitation
{
    return Invitation::create(array_merge([
        'user_id' => $context['user']->id,
        'event_type_id' => $context['eventType']->id,
        'package_id' => $context['package']->id,
        'theme_id' => $context['theme']->id,
        'slug' => 'muhammad-arsya-putra',
        'title' => 'Muhammad Arsya Putra',
        'status' => 'active',
        'is_public' => true,
        'allow_guest_comments' => true,
        'allow_guest_plus_one' => true,
        'max_guests_plus_one' => 1,
    ], $overrides));
}

it('checks slug availability globally and respects the excluded invitation id', function () {
    $context = makeBirthdayInvitationContext();
    $this->actingAs($context['user']);

    $invitation = createInvitationForSlugTest($context);

    $response = $this->getJson(route('customer.invitations.check-slug', [
        'slug' => 'Muhammad Arsya Putra',
    ]));

    $response->assertOk()
        ->assertJsonPath('slug', 'muhammad-arsya-putra')
        ->assertJsonPath('available', false)
        ->assertJsonPath('suggestions.0', 'muhammad-arsya-putra-01');

    $response = $this->getJson(route('customer.invitations.check-slug', [
        'slug' => 'Muhammad Arsya Putra',
        'exclude_id' => $invitation->id,
    ]));

    $response->assertOk()
        ->assertJsonPath('slug', 'muhammad-arsya-putra')
        ->assertJsonPath('available', true)
        ->assertJsonPath('suggestions', []);
});

it('returns available slug recommendations that skip occupied slugs', function () {
    $context = makeBirthdayInvitationContext();
    $this->actingAs($context['user']);

    $takenSlugs = [
        'arsya-putra',
        'arsya-putra-01',
        'arsya-putra-02',
        'arsya-putra-' . now()->year,
        'arsya-putra-7th',
    ];

    foreach ($takenSlugs as $slug) {
        createInvitationForSlugTest($context, [
            'slug' => $slug,
            'title' => Str::headline($slug),
        ]);
    }

    $response = $this->getJson(route('customer.invitations.slug.recommendations', [
        'slug' => 'Arsya Putra',
    ]));

    $response->assertOk()
        ->assertJsonPath('slug', 'arsya-putra');

    $suggestions = $response->json('suggestions');

    expect($suggestions)->toHaveCount(5)
        ->and($suggestions)->toContain(
            'arsya-putra-party',
            'arsya-putra-invite',
            'arsya-putra-official'
        );

    foreach ($suggestions as $suggestion) {
        expect(Invitation::withTrashed()->where('slug', $suggestion)->exists())->toBeFalse();
    }
});

it('rejects duplicate slugs when storing a new invitation', function () {
    $context = makeBirthdayInvitationContext();
    $this->actingAs($context['user']);

    createInvitationForSlugTest($context);

    $response = $this->post(route('customer.invitations.store'), [
        'event_type_id' => $context['eventType']->id,
        'theme_id' => $context['theme']->id,
        'package_id' => $context['package']->id,
        'slug' => '',
        'field_values' => [
            'child_name' => 'Muhammad Arsya Putra',
        ],
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('slug');
    $this->assertCount(1, Invitation::withTrashed()->get());
});

it('updates the invitation slug from settings and serves the public page and api by slug', function () {
    $context = makeBirthdayInvitationContext();
    $this->actingAs($context['user']);

    $invitation = createInvitationForSlugTest($context, [
        'slug' => 'muhammad-arsya-putra',
        'title' => 'Muhammad Arsya Putra',
    ]);

    $newSlug = 'muhammad-arsya-putra-7th';

    $response = $this->patch(route('customer.invitations.update-settings', $invitation->slug), [
        'slug' => '',
        'field_values' => [
            'child_name' => 'Muhammad Arsya Putra 7th',
        ],
    ]);

    $response->assertRedirect(route('customer.invitations.settings', $newSlug));

    $this->assertDatabaseHas('invitations', [
        'id' => $invitation->id,
        'slug' => $newSlug,
    ]);

    $this->get("/{$newSlug}")->assertOk();

    $this->postJson(route('inv.rsvp', ['code' => $newSlug]), [
        'name' => 'Tamu Uji',
    ])
        ->assertCreated()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('guests', [
        'invitation_id' => $invitation->id,
        'name' => 'Tamu Uji',
    ]);
});
