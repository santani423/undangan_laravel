<?php

test('new users can register', function () {
    $response = $this->post($this->api('auth/register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertCreated()
        ->assertJsonPath('data.user.email', 'test@example.com')
        ->assertJsonPath('redirect', '/customer');
});

test('registration is validated', function () {
    $this->post($this->api('auth/register'), [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'password',
        'password_confirmation' => 'different',
    ])->assertStatus(422)->assertJsonValidationErrors(['name', 'email', 'password']);

    $this->assertGuest();
});
