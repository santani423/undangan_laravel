<?php

use App\Models\EventType;
use App\Models\Invitation;
use App\Models\InvitationSetting;
use App\Models\Package;
use App\Models\Theme;
use App\Models\User;
use Spatie\Permission\Models\Role;

function editorAdmin(): User
{
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    return tap(User::factory()->create())->assignRole('admin');
}

function editorCustomer(): User
{
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    return tap(User::factory()->create())->assignRole('customer');
}

function editorInvitation(User $owner, string $type = 'wedding', array $attrs = []): Invitation
{
    $eventType = EventType::firstOrCreate(['name' => $type], ['label' => ucfirst($type), 'is_active' => true]);
    $invitationType = EventType::INVITATION_TYPES[$type];
    $package = Package::firstOrCreate(
        ['name' => "{$invitationType}_exclusive"],
        ['label' => 'Eksklusif', 'invitation_type' => $invitationType, 'price' => 99000],
    );
    $theme = Theme::firstOrCreate(
        ['slug' => "{$type}-theme-01"],
        ['name' => "{$type} Theme 01", 'event_type' => $type, 'is_active' => true],
    );

    $invitation = Invitation::create(array_merge([
        'user_id'       => $owner->id,
        'event_type_id' => $eventType->id,
        'package_id'    => $package->id,
        'theme_id'      => $theme->id,
        'slug'          => "undangan-{$type}-{$owner->id}",
        'title'         => "Undangan {$type}",
        'status'        => 'draft',
    ], $attrs));
    InvitationSetting::create(['invitation_id' => $invitation->id]);

    return $invitation;
}

it('opens the editor for every invitation type with a slug-based preview', function (string $type) {
    $invitation = editorInvitation(editorCustomer(), $type);

    $this->actingAs(editorAdmin())
        ->get(route('admin.invitations.show', $invitation->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/invitations/show')
            ->where('invitation.id', $invitation->id)
            ->where('invitation.slug', $invitation->slug)
            ->where('eventType.name', $type)
            ->where('theme.id', $invitation->theme_id)
            ->where('adminMeta.customer.id', $invitation->user_id)
            ->where('adminMeta.preview_url', url('/' . $invitation->slug))
            ->missing('guests'));
})->with(['wedding', 'khitanan', 'aqiqah', 'gender_reveal', 'syukuran']);

it('lets an admin edit content of another customer\'s invitation', function () {
    $invitation = editorInvitation(editorCustomer());

    $this->actingAs(editorAdmin())
        ->patch(route('admin.invitations.update', $invitation->id), [
            'status'       => 'active',
            'field_values' => ['groom_name' => 'Santani', 'bride_name' => 'Ayu'],
            'acara_events' => [[
                'name' => 'Akad', 'date' => '2026-12-12', 'time_start' => '08:00', 'time_end' => '',
                'location_name' => 'Masjid', 'location_address' => '', 'maps_url' => '', 'maps_embed' => '',
                'maps_lat' => '', 'maps_lng' => '', 'is_countdown' => true,
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $invitation->refresh();
    expect($invitation->status)->toBe('active')
        ->and($invitation->getContent('groom_name'))->toBe('Santani')
        ->and($invitation->events()->sole()->event_name)->toBe('Akad');
});

it('lets an admin change the slug and theme, and the public viewer follows the new slug', function () {
    $invitation = editorInvitation(editorCustomer());
    $newTheme = Theme::create(['name' => 'Wedding Theme 02', 'slug' => 'wedding-theme-02', 'event_type' => 'wedding', 'is_active' => true]);
    $this->actingAs(editorAdmin());

    $this->patch(route('admin.invitations.update-settings', $invitation->id), ['slug' => 'slug-baru-admin'])
        ->assertRedirect(route('admin.invitations.show', $invitation->id));

    $this->patch(route('admin.invitations.update-theme', $invitation->id), ['theme_id' => $newTheme->id])
        ->assertRedirect();

    $invitation->refresh();
    expect($invitation->slug)->toBe('slug-baru-admin')
        ->and($invitation->theme_id)->toBe($newTheme->id);

    $this->get('/slug-baru-admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('invitation/show')->where('themeSlug', 'wedding-theme-02'));
});

it('keeps customers out of the admin editor and out of other customers\' invitations', function () {
    $owner = editorCustomer();
    $other = editorCustomer();
    $invitation = editorInvitation($owner);

    $this->actingAs($other)
        ->get(route('admin.invitations.show', $invitation->id))
        ->assertRedirect(route('customer.dashboard'));

    $this->actingAs($other)
        ->patchJson(route('admin.invitations.update', $invitation->id), ['status' => 'active'])
        ->assertForbidden();

    $this->actingAs($other)
        ->patch(route('customer.invitations.update', $invitation->slug), ['status' => 'active'])
        ->assertForbidden();

    $this->actingAs($owner)
        ->patch(route('customer.invitations.update', $invitation->slug), ['status' => 'active'])
        ->assertRedirect();

    expect($invitation->refresh()->status)->toBe('active');
});
