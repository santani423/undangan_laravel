<?php

use App\Models\User;

test('profile page data is returned', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get($this->api('settings/profile'));

    $response->assertOk()->assertJsonStructure(['data' => ['mustVerifyEmail']]);
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch($this->api('settings/profile'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response->assertOk()->assertJsonPath('auth.user.name', 'Test User');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch($this->api('settings/profile'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response->assertOk();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete($this->api('settings/profile'), [
            'password' => 'password',
        ]);

    $response->assertOk()->assertJsonPath('redirect', '/')->assertJsonPath('auth.user', null);

    $this->assertGuest('web');
    // User uses SoftDeletes: the account is soft-deleted, not removed.
    // (Before the migration this test expected a hard delete and failed.)
    expect($user->fresh()->trashed())->toBeTrue();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete($this->api('settings/profile'), [
            'password' => 'wrong-password',
        ]);

    $response->assertStatus(422)->assertJsonValidationErrors('password');

    expect($user->fresh())->not->toBeNull();
});
