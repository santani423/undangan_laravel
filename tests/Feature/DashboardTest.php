<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('customers are sent to the customer dashboard', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/dashboard')->assertRedirect(route('customer.dashboard'));
});

test('admins are sent to the admin dashboard', function () {
    $this->actingAs(User::factory()->admin()->create());

    $this->get('/dashboard')->assertRedirect(route('admin.dashboard'));
});

test('super admins are sent to the admin dashboard', function () {
    $this->actingAs(User::factory()->admin('super_admin')->create());

    $this->get('/dashboard')->assertRedirect(route('admin.dashboard'));
});

test('users without a role cannot use the dashboard entry point', function () {
    $this->actingAs(User::factory()->withoutRole()->create());

    $this->get('/dashboard')->assertForbidden();
});
