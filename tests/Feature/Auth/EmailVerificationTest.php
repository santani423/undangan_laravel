<?php

use App\Models\User;
use App\Support\FrontendUrl;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

test('a new verification link can be requested', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->post($this->api('auth/email/verification-notification'))
        ->assertOk()
        ->assertJsonPath('status', 'verification-link-sent');
});

test('a verified user is sent to the dashboard instead', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post($this->api('auth/email/verification-notification'))
        ->assertOk()
        ->assertJsonPath('redirect', '/customer');
});

test('email can be verified', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    // The e-mailed link is opened by the browser (web route), then lands on the SPA.
    $response = $this->actingAs($user)->withHeaders(['Accept' => 'text/html'])->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(FrontendUrl::to('/dashboard').'?verified=1');
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});
