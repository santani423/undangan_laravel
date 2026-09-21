<?php

use App\Models\User;

test('guests are redirected to login from both areas', function () {
    $this->get('/admin')->assertRedirect('/login');
    $this->get('/customer')->assertRedirect('/login');
});

test('a customer can open the customer area', function () {
    $this->actingAs(User::factory()->create())
        ->get('/customer')
        ->assertOk();
});

test('a customer is redirected to the customer dashboard from admin pages', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/admin')->assertRedirect(route('customer.dashboard'));
    $this->get('/admin/users')->assertRedirect(route('customer.dashboard'));
    $this->get('/settings/app')->assertRedirect(route('customer.dashboard'));
    $this->get('/settings/packages')->assertRedirect(route('customer.dashboard'));
});

test('an admin can open the admin area', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertOk();
});

test('an admin is redirected to the admin dashboard from customer pages', function () {
    $this->actingAs(User::factory()->admin()->create());

    $this->get('/customer')->assertRedirect(route('admin.dashboard'));
    $this->get('/customer/invitations')->assertRedirect(route('admin.dashboard'));
});

test('a super admin is redirected to the admin dashboard from customer pages', function () {
    $this->actingAs(User::factory()->admin('super_admin')->create())
        ->get('/customer')
        ->assertRedirect(route('admin.dashboard'));
});

test('shared account settings stay reachable for every role', function () {
    $this->actingAs(User::factory()->create())->get('/settings/profile')->assertOk();
    $this->actingAs(User::factory()->admin()->create())->get('/settings/profile')->assertOk();
});

test('a user without a role is forbidden from both areas', function () {
    $this->actingAs(User::factory()->withoutRole()->create());

    $this->get('/admin')->assertForbidden();
    $this->get('/customer')->assertForbidden();
});
