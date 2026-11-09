<?php

use App\Models\User;

test('login options can be loaded', function () {
    $response = $this->get($this->api('auth/options'));

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.canResetPassword', true);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post($this->api('auth/login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertOk()
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonPath('auth.user.area', 'customer')
        ->assertJsonPath('redirect', '/customer');
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post($this->api('auth/login'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonValidationErrors('email');

    $this->assertGuest();
});

test('the current user is returned by auth/me', function () {
    $this->get($this->api('auth/me'))->assertOk()->assertJsonPath('data.user', null);

    $user = User::factory()->create();

    $this->actingAs($user)->get($this->api('auth/me'))
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.area', 'customer')
        ->assertJsonPath('data.user.roles', ['customer']);
});

test('the frontend intended path is honoured after login', function () {
    $user = User::factory()->create();

    $this->post($this->api('auth/login'), [
        'email' => $user->email,
        'password' => 'password',
        'intended' => '/customer/invitations',
    ])->assertJsonPath('redirect', '/customer/invitations');
});

test('an unsafe intended url is ignored after login', function () {
    $user = User::factory()->create();

    $this->post($this->api('auth/login'), [
        'email' => $user->email,
        'password' => 'password',
        'intended' => '//evil.example.com/phish',
    ])->assertJsonPath('redirect', '/customer');
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post($this->api('auth/logout'));

    $this->assertGuest('web');
    $response->assertOk()->assertJsonPath('redirect', '/')->assertJsonPath('auth.user', null);
});

test('logged in users cannot log in again', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post($this->api('auth/login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertStatus(409)->assertJsonPath('redirect', '/customer');
});
