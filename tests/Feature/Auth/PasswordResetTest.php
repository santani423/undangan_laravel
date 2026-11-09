<?php

use App\Models\User;
use App\Support\FrontendUrl;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post($this->api('auth/forgot-password'), ['email' => $user->email])
        ->assertOk()
        ->assertJsonStructure(['status']);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('the reset link in the e-mail points at the frontend page', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post($this->api('auth/forgot-password'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $url = $notification->toMail($user)->actionUrl;

        expect($url)->toBe(FrontendUrl::to('/reset-password/'.$notification->token, ['email' => $user->email]));

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post($this->api('auth/forgot-password'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post($this->api('auth/reset-password'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('redirect', '/login');

        return true;
    });
});

test('password is not reset with an invalid token', function () {
    $user = User::factory()->create();

    $this->post($this->api('auth/reset-password'), [
        'token' => 'invalid',
        'email' => $user->email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(422)->assertJsonValidationErrors('email');
});
