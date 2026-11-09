<?php

use App\Models\User;

test('password can be confirmed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post($this->api('auth/confirm-password'), [
        'password' => 'password',
    ]);

    $response->assertOk()->assertJsonPath('redirect', '/dashboard');
});

test('password is not confirmed with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post($this->api('auth/confirm-password'), [
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors('password');
});
