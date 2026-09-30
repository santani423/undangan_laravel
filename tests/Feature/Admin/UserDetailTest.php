<?php

use App\Models\ActivityLog;
use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\User;
use Spatie\Permission\Models\Role;

function userDetailAdmin(): User
{
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    return tap(User::factory()->create())->assignRole('admin');
}

function userDetailInvitation(User $owner, array $attrs = []): Invitation
{
    $eventType = EventType::firstOrCreate(['name' => 'birthday'], ['label' => 'Ulang Tahun']);
    $package = Package::firstOrCreate(
        ['name' => 'ulang_tahun_exclusive'],
        ['label' => 'Ulang Tahun Eksklusif', 'invitation_type' => 'birthday', 'price' => 99000],
    );

    return Invitation::create(array_merge([
        'user_id'       => $owner->id,
        'event_type_id' => $eventType->id,
        'package_id'    => $package->id,
        'slug'          => 'giavanya-elisabet-kau-suni',
        'title'         => 'Glavanya Elisabet Kau Suni',
        'status'        => 'active',
    ], $attrs));
}

it('builds the preview url from the slug when the invitation has no code', function () {
    $customer = User::factory()->create();
    userDetailInvitation($customer, ['invitation_code' => null]);

    $this->actingAs(userDetailAdmin())
        ->get(route('admin.users.show', $customer))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/show')
            ->where('invitations.0.invitation_code', null)
            ->where('invitations.0.preview_url', url('/giavanya-elisabet-kau-suni')));
});

it('builds the preview url from the slug even when the invitation has a code', function () {
    $customer = User::factory()->create();
    $invitation = userDetailInvitation($customer, ['invitation_code' => 'giavanya-27']);

    $this->actingAs(userDetailAdmin())
        ->get(route('admin.users.show', $customer))
        ->assertInertia(fn ($page) => $page
            ->where('invitations.0.preview_url', url('/giavanya-elisabet-kau-suni'))
            ->where('invitations.0.detail_url', route('admin.invitations.show', $invitation->id)));
});

it('has no preview url for a soft-deleted invitation', function () {
    $customer = User::factory()->create();
    userDetailInvitation($customer)->delete();

    $this->actingAs(userDetailAdmin())
        ->get(route('admin.users.show', $customer))
        ->assertInertia(fn ($page) => $page->where('invitations.0.preview_url', null));
});

it('records login with the authenticated user as actor', function () {
    $user = User::factory()->create();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

    $log = ActivityLog::where('action', 'login')->sole();

    expect($log->user_id)->toBe($user->id)
        ->and($log->model_type)->toBe(User::class)
        ->and($log->model_id)->toBe($user->id)
        ->and($log->ip_address)->not->toBeNull()
        ->and($log->created_at)->not->toBeNull();
});

it('records model changes with the acting admin and redacts hidden attributes', function () {
    $admin = userDetailAdmin();
    $this->actingAs($admin);

    $customer = User::factory()->create();
    $customer->update(['name' => 'Nama Baru', 'password' => 'rahasia-baru']);

    $created = ActivityLog::where('action', 'created')->where('model_id', $customer->id)->sole();
    $updated = ActivityLog::where('action', 'updated')->where('model_id', $customer->id)->sole();

    expect($created->user_id)->toBe($admin->id)
        ->and($created->changes['attributes']['password'])->toBe('[redacted]')
        ->and($updated->changes['attributes']['name'])->toBe('Nama Baru')
        ->and($updated->changes['old']['password'])->toBe('[redacted]')
        ->and($updated->description())->toContain('Mengubah Pengguna');
});

it('logs opening the user detail and shows the logs on both admin pages', function () {
    $admin = userDetailAdmin();
    $customer = User::factory()->create();

    $this->actingAs($admin)->get(route('admin.users.show', $customer))->assertOk();

    $viewed = ActivityLog::where('action', 'viewed')->sole();
    expect($viewed->user_id)->toBe($admin->id)
        ->and($viewed->model_id)->toBe($customer->id);

    // Opening the admin's own page is itself logged, so it comes first.
    $this->get(route('admin.users.show', $admin))
        ->assertInertia(fn ($page) => $page
            ->where('activityLogs.0.description', "Membuka detail Pengguna #{$admin->id}")
            ->where('activityLogs.1.action', 'viewed')
            ->where('activityLogs.1.description', "Membuka detail Pengguna #{$customer->id}")
            ->where('activityLogs.1.module', 'Pengguna'));

    $this->get(route('admin.reports.activity-logs', ['action' => 'viewed']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/activity-logs')
            ->where('logs.data.0.user.id', $admin->id)
            ->where('logs.data.0.action', 'viewed'));
});
