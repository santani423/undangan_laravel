<?php

use App\Models\EventType;
use App\Models\Invitation;
use App\Models\InvitationSetting;
use App\Models\Package;
use App\Models\Theme;
use App\Models\User;
use Spatie\Permission\Models\Role;

const BIRTHDAY_DEFAULT_MUSIC = 'audio/birthday-default.mp3';

function musicAdmin(): User
{
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    return tap(User::factory()->create())->assignRole('admin');
}

/** An invitation of $type; $settings = null means no invitation_settings row at all. */
function musicInvitation(string $type, ?array $settings = [], ?string $themeSlug = null, array $attrs = []): Invitation
{
    $eventType = EventType::firstOrCreate(['name' => $type], ['label' => ucfirst($type), 'is_active' => true]);
    $invitationType = EventType::INVITATION_TYPES[$type];
    $package = Package::firstOrCreate(
        ['name' => "{$invitationType}_exclusive"],
        ['label' => 'Eksklusif', 'invitation_type' => $invitationType, 'price' => 99000],
    );
    $themeSlug ??= "{$type}-theme-01";
    $theme = Theme::firstOrCreate(
        ['slug' => $themeSlug],
        ['name' => $themeSlug, 'event_type' => $type, 'is_active' => true],
    );

    $invitation = Invitation::create(array_merge([
        'user_id'       => User::factory()->create()->id,
        'event_type_id' => $eventType->id,
        'package_id'    => $package->id,
        'theme_id'      => $theme->id,
        'slug'          => 'undangan-' . str_replace('_', '-', $themeSlug) . '-' . uniqid(),
        'title'         => "Undangan {$type}",
        'status'        => 'active',
    ], $attrs));

    if ($settings !== null) {
        InvitationSetting::create(['invitation_id' => $invitation->id, ...$settings]);
    }

    return $invitation;
}

it('ships the default birthday track', function () {
    expect(public_path(BIRTHDAY_DEFAULT_MUSIC))->toBeFile();
});

it('plays the default track on a birthday invitation without music', function (?array $settings) {
    $invitation = musicInvitation('birthday', $settings);

    $this->get('/' . $invitation->slug)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invitation.music.url', asset(BIRTHDAY_DEFAULT_MUSIC))
            ->where('invitation.music.autoplay', true)
            ->where('invitation.music.loop', true));
})->with([
    'music_url null'        => [['music_url' => null]],
    'music_url empty'       => [['music_url' => '']],
    'music never enabled'   => [['music_url' => null, 'music_enabled' => false]],
    'library pick, no file' => [['music_url' => null, 'music_enabled' => true, 'music_source' => 'library', 'music_library_id' => 'canon-d']],
    'no settings row'       => [null],
]);

it('keeps the autoplay and loop choices when falling back to the default track', function () {
    $invitation = musicInvitation('birthday', ['music_autoplay' => false, 'music_loop' => false]);

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page
            ->where('invitation.music.url', asset(BIRTHDAY_DEFAULT_MUSIC))
            ->where('invitation.music.autoplay', false)
            ->where('invitation.music.loop', false));
});

it('plays the customer\'s custom music on a birthday invitation', function (string $stored, string $expected) {
    $invitation = musicInvitation('birthday', ['music_enabled' => true, 'music_source' => 'upload', 'music_url' => $stored]);

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page->where('invitation.music.url', $expected));
})->with([
    'full url'     => ['https://cdn.example.com/lagu.mp3', 'https://cdn.example.com/lagu.mp3'],
    'storage path' => ['invitations/1/music/lagu.mp3', fn () => asset('storage/invitations/1/music/lagu.mp3')],
]);

it('leaves a custom track that the customer switched off silent', function () {
    $invitation = musicInvitation('birthday', ['music_enabled' => false, 'music_url' => 'https://cdn.example.com/lagu.mp3']);

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page->missing('invitation.music'));
});

it('falls back to the default track once the custom music is removed in the editor', function () {
    $invitation = musicInvitation('birthday', ['music_enabled' => true, 'music_source' => 'upload', 'music_url' => 'https://cdn.example.com/lagu.mp3']);

    // What the editor sends after "Hapus": url and source cleared, toggle off.
    $this->actingAs(musicAdmin())
        ->patch(route('admin.invitations.update-settings', $invitation->id), [
            'slug'           => $invitation->slug,
            'music_enabled'  => false,
            'music_autoplay' => true,
            'music_loop'     => true,
            'music_source'   => '',
            'music_url'      => '',
        ])
        ->assertSessionHasNoErrors();

    expect($invitation->settings()->first()->music_url)->toBeNull();

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page->where('invitation.music.url', asset(BIRTHDAY_DEFAULT_MUSIC)));
});

it('gives every birthday theme the same fallback', function (string $themeSlug) {
    $invitation = musicInvitation('birthday', [], $themeSlug);

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page
            ->where('themeSlug', $themeSlug)
            ->where('invitation.music.url', asset(BIRTHDAY_DEFAULT_MUSIC)));
})->with([
    'starry-night',
    ...array_map(fn ($n) => sprintf('birthday_theme_%02d', $n), range(1, 9)),
]);

it('uses the default track in a birthday theme preview', function () {
    $invitation = musicInvitation('birthday', [], 'birthday_theme_01', ['is_sample' => true]);

    $this->get(route('themes.sample', $invitation->theme->slug))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('invitation.music.url', asset(BIRTHDAY_DEFAULT_MUSIC)));
});

it('does not give other invitation types a default track', function (string $type) {
    $invitation = musicInvitation($type, ['music_url' => null, 'music_enabled' => true]);

    $this->get('/' . $invitation->slug)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->missing('invitation.music'));

    $this->actingAs(musicAdmin())
        ->get(route('admin.invitations.show', $invitation->id))
        ->assertInertia(fn ($page) => $page->where('defaultMusic', null));
})->with(['wedding', 'khitanan', 'aqiqah', 'gender_reveal', 'syukuran']);

it('still plays custom music on other invitation types', function () {
    $invitation = musicInvitation('wedding', ['music_enabled' => true, 'music_url' => 'https://cdn.example.com/lagu.mp3']);

    $this->get('/' . $invitation->slug)
        ->assertInertia(fn ($page) => $page->where('invitation.music.url', 'https://cdn.example.com/lagu.mp3'));
});

it('tells the editor which default track a birthday invitation uses', function () {
    $invitation = musicInvitation('birthday');

    $this->actingAs(musicAdmin())
        ->get(route('admin.invitations.show', $invitation->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('defaultMusic.url', asset(BIRTHDAY_DEFAULT_MUSIC))
            ->where('defaultMusic.label', 'Default Birthday Music')
            ->where('invitationSettings.music_url', ''));
});
