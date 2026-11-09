<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function profilePayload(array $overrides = []): array
{
    return array_merge([
        'name'            => 'Budi Baru',
        'email'           => 'budi.baru@example.com',
        'phone_number'    => '08123456789',
        'bio'             => 'Halo',
        'language'        => 'en',
        'timezone'        => 'Asia/Makassar',
        'notify_email'    => false,
        'notify_whatsapp' => true,
    ], $overrides);
}

it('shows the customer profile page with the current data', function () {
    $user = User::factory()->create(['phone_number' => '0811111111']);

    $this->actingAs($user)
        ->get($this->api('customer/profile'))
        ->assertOk()
        ->assertData(fn ($page) => $page
            ->where('profile.name', $user->name)
            ->where('profile.email', $user->email)
            ->where('profile.phone_number', '0811111111')
            ->where('profile.language', 'id')
            ->where('profile.timezone', 'Asia/Jakarta')
        );
});

it('requires authentication to view or update the profile', function () {
    $this->get($this->api('customer/profile'))->assertUnauthorized();
    $this->patch($this->api('customer/profile'), profilePayload())->assertUnauthorized();
});

it('updates the user and profile data', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload())
        ->assertOk()
        ->assertJsonPath('message', 'Profil berhasil diperbarui.');

    $user->refresh();
    expect($user->name)->toBe('Budi Baru')
        ->and($user->email)->toBe('budi.baru@example.com')
        ->and($user->phone_number)->toBe('08123456789');

    $profile = $user->profile;
    expect($profile->bio)->toBe('Halo')
        ->and($profile->language)->toBe('en')
        ->and($profile->timezone)->toBe('Asia/Makassar')
        ->and($profile->notification_preferences)->toBe(['email' => false, 'whatsapp' => true]);
});

it('rejects an email already used by another user', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload(['email' => 'taken@example.com']))
        ->assertJsonValidationErrors('email');
});

it('rejects invalid language and timezone values', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload(['language' => 'xx', 'timezone' => 'Mars/Base']))
        ->assertJsonValidationErrors(['language', 'timezone']);
});

it('uploads and then removes a profile photo', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload(['photo' => UploadedFile::fake()->image('me.png', 600, 600)]))
        ->assertOk();

    $path = $user->refresh()->profile->profile_photo_url;
    expect($path)->toStartWith('avatars/' . $user->id . '/');
    Storage::disk('public')->assertExists($path);
    expect($user->displayAvatar())->toContain($path);

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload(['remove_photo' => true]))
        ->assertOk();

    Storage::disk('public')->assertMissing($path);
    expect($user->refresh()->profile->profile_photo_url)->toBeNull();
});

it('rejects non-image uploads', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch($this->api('customer/profile'), profilePayload(['photo' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')]))
        ->assertJsonValidationErrors('photo');
});
