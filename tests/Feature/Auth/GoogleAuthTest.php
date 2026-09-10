<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Role;

function fakeGoogleUser(array $attributes = []): SocialiteUser
{
    // SocialiteUser::fake() stores the whole attribute array as the raw
    // user payload too, so extra keys like `email_verified` (not a mapped
    // property) are still readable via $user->user['email_verified'].
    return SocialiteUser::fake(array_merge([
        'id' => '1234567890',
        'name' => 'Test Google User',
        'email' => 'google.user@example.com',
        'avatar' => 'https://lh3.googleusercontent.com/a/avatar.jpg',
        'email_verified' => true,
    ], $attributes));
}

test('google redirect route builds an oauth redirect', function () {
    $response = $this->get('/auth/google/redirect');

    $response->assertRedirect();
});

test('new user can register via google', function () {
    Role::create(['name' => 'customer', 'guard_name' => 'web']);
    Socialite::fake('google', fakeGoogleUser());

    $response = $this->get('/auth/google/callback');

    $this->assertAuthenticated();

    $user = User::where('email', 'google.user@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('1234567890');
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->hasRole('customer'))->toBeTrue();

    $response->assertRedirect(route('customer.dashboard', absolute: false));
});

test('existing user logs in via already linked google id without duplicating', function () {
    $existing = User::factory()->create([
        'email' => 'linked@example.com',
        'google_id' => 'google-id-999',
    ]);

    Socialite::fake('google', fakeGoogleUser([
        'id' => 'google-id-999',
        'email' => 'linked@example.com',
    ]));

    $this->get('/auth/google/callback');

    $this->assertAuthenticatedAs($existing);
    expect(User::where('google_id', 'google-id-999')->count())->toBe(1);
});

test('existing email password account is linked when google email is verified', function () {
    $existing = User::factory()->create([
        'email' => 'verified@example.com',
        'password' => Hash::make('password'),
        'google_id' => null,
    ]);

    Socialite::fake('google', fakeGoogleUser([
        'id' => 'google-id-link',
        'email' => 'verified@example.com',
        'email_verified' => true,
    ]));

    $this->get('/auth/google/callback');

    $this->assertAuthenticatedAs($existing->fresh());
    expect($existing->fresh()->google_id)->toBe('google-id-link');
    expect(User::where('email', 'verified@example.com')->count())->toBe(1);
});

test('existing email password account is not linked when google email is unverified', function () {
    $existing = User::factory()->create([
        'email' => 'unverified@example.com',
        'password' => Hash::make('password'),
        'google_id' => null,
    ]);

    Socialite::fake('google', fakeGoogleUser([
        'id' => 'google-id-unverified',
        'email' => 'unverified@example.com',
        'email_verified' => false,
    ]));

    $response = $this->get('/auth/google/callback');

    $this->assertGuest();
    expect($existing->fresh()->google_id)->toBeNull();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHas('error');
});

test('google callback fails gracefully when user cancels consent', function () {
    $response = $this->get('/auth/google/callback?error=access_denied');

    $this->assertGuest();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHas('error');
});

test('google callback fails gracefully when google gives no email', function () {
    Socialite::fake('google', fakeGoogleUser(['email' => null]));

    $response = $this->get('/auth/google/callback');

    $this->assertGuest();
    expect(User::count())->toBe(0);
    $response->assertSessionHas('error');
});

test('users can logout after logging in via google', function () {
    Role::create(['name' => 'customer', 'guard_name' => 'web']);
    Socialite::fake('google', fakeGoogleUser());

    $this->get('/auth/google/callback');
    $this->assertAuthenticated();

    $response = $this->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('google login never assigns an admin role to a new user', function () {
    Role::create(['name' => 'customer', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'super_admin', 'guard_name' => 'web']);

    Socialite::fake('google', fakeGoogleUser());

    $this->get('/auth/google/callback');

    $user = User::where('email', 'google.user@example.com')->first();
    expect($user->hasRole('customer'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
    expect($user->hasRole('super_admin'))->toBeFalse();
});
