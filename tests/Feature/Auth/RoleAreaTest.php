<?php

use App\Models\User;

test('guests are rejected from both areas', function () {
    $this->get($this->api('admin/users'))->assertUnauthorized()->assertJsonPath('success', false);
    $this->get($this->api('customer'))->assertUnauthorized();
});

test('a customer can open the customer area', function () {
    $this->actingAs(User::factory()->create())
        ->get($this->api('customer'))
        ->assertOk();
});

test('a customer is sent to the customer dashboard from admin pages', function () {
    $this->actingAs(User::factory()->create());

    foreach (['admin/users', 'admin/themes', 'settings/app', 'settings/packages'] as $path) {
        $this->get($this->api($path))
            ->assertForbidden()
            ->assertJsonPath('redirect', '/customer');
    }
});

test('an admin can open the admin area', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get($this->api('admin/users'))
        ->assertOk();
});

test('an admin is sent to the admin dashboard from customer pages', function () {
    $this->actingAs(User::factory()->admin()->create());

    $this->get($this->api('customer'))->assertForbidden()->assertJsonPath('redirect', '/admin');
    $this->get($this->api('customer/invitations'))->assertForbidden()->assertJsonPath('redirect', '/admin');
});

test('a super admin is sent to the admin dashboard from customer pages', function () {
    $this->actingAs(User::factory()->admin('super_admin')->create())
        ->get($this->api('customer'))
        ->assertForbidden()
        ->assertJsonPath('redirect', '/admin');
});

test('shared account settings stay reachable for every role', function () {
    $this->actingAs(User::factory()->create())->get($this->api('settings/profile'))->assertOk();
    $this->actingAs(User::factory()->admin()->create())->get($this->api('settings/profile'))->assertOk();
});

test('a user without a role is forbidden from both areas', function () {
    $this->actingAs(User::factory()->withoutRole()->create());

    $this->get($this->api('admin/users'))->assertForbidden();
    $this->get($this->api('customer'))->assertForbidden();
});
