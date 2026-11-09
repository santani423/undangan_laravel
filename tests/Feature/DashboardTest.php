<?php

use App\Models\User;

/*
| The generic /dashboard entry point is a frontend route now: the SPA sends
| the user to `dashboardPath()` of the area reported by GET /api/v1/auth/me.
*/

test('customers are sent to the customer dashboard', function () {
    $user = User::factory()->create();

    expect($user->dashboardPath())->toBe('/customer');
    $this->actingAs($user)->get($this->api('auth/me'))->assertJsonPath('data.user.area', 'customer');
});

test('admins are sent to the admin dashboard', function () {
    $user = User::factory()->admin()->create();

    expect($user->dashboardPath())->toBe('/admin');
    $this->actingAs($user)->get($this->api('auth/me'))->assertJsonPath('data.user.area', 'admin');
});

test('super admins are sent to the admin dashboard', function () {
    $user = User::factory()->admin('super_admin')->create();

    expect($user->dashboardPath())->toBe('/admin');
    $this->actingAs($user)->get($this->api('auth/me'))->assertJsonPath('data.user.area', 'admin');
});

test('users without a role have no dashboard', function () {
    $user = User::factory()->withoutRole()->create();

    expect($user->dashboardPath())->toBeNull();
    $this->actingAs($user)->get($this->api('auth/me'))->assertJsonPath('data.user.area', null);
});
