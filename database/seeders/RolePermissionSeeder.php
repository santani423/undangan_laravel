<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seeds roles and permissions using Spatie Laravel Permission.
     *
     * Prerequisites:
     *   composer require spatie/laravel-permission
     *   php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
     *   php artisan migrate
     */
    public function run(): void
    {
        if (!class_exists(\Spatie\Permission\Models\Permission::class)) {
            $this->command->error('Spatie Laravel Permission package tidak ditemukan!');
            $this->command->warn('Jalankan: composer require spatie/laravel-permission');
            $this->command->warn('Kemudian: php artisan vendor:publish --provider="Spatie\\Permission\\PermissionServiceProvider"');
            $this->command->warn('Kemudian: php artisan migrate');
            return;
        }

        // Clear cached permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Domain A: User Management (6)
            'users.view',
            'users.edit',
            'users.delete',
            'users.list',
            'users.admin.manage',
            'users.role.change',

            // Domain B: Invitation Management (8)
            'invitations.create',
            'invitations.view',
            'invitations.view.all',
            'invitations.edit',
            'invitations.delete',
            'invitations.publish',
            'invitations.custom_domain',
            'invitations.builder',

            // Domain C: Guest Management (5)
            'guests.view',
            'guests.create',
            'guests.edit',
            'guests.delete',
            'guests.import',

            // Domain D: Transactions & Payments (7)
            'transactions.view',
            'transactions.view.all',
            'transactions.create',
            'payments.view',
            'payments.methods',
            'payments.refund',
            'payments.receipt',

            // Domain E: Analytics (5)
            'analytics.view',
            'analytics.system',
            'analytics.export',
            'analytics.financial',
            'analytics.schedule',

            // Domain F: Content (8)
            'content.media.upload',
            'content.media.delete',
            'content.stories',
            'content.gallery',
            'content.themes',
            'content.themes.custom',
            'content.comments.moderate',
            'content.photos.approve',

            // Domain G: System Administration (6)
            'system.payment_gateways',
            'system.audit_logs',
            'system.settings',
            'system.health',
            'system.testimonials.manage',
            'system.backup',

            // Domain H: Amplop Digital (2)
            'amplope.accounts',
            'amplope.withdraw',
        ];

        // Create all permissions (idempotent)
        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate([
                'name'       => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create roles (idempotent)
        $superAdmin = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $admin      = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin',       'guard_name' => 'web']);
        $customer   = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer',    'guard_name' => 'web']);

        // Super admin: semua permission
        $superAdmin->syncPermissions($permissions);

        // Admin: semua kecuali admin management, gateway config, dan backup
        $excludeFromAdmin = [
            'users.admin.manage',
            'users.role.change',
            'users.delete',
            'system.payment_gateways',
            'system.settings',
            'system.backup',
            'analytics.schedule',
            'content.themes.custom',
            'amplope.accounts',
        ];
        $adminPermissions = array_values(array_filter($permissions, fn ($p) => !in_array($p, $excludeFromAdmin)));
        $admin->syncPermissions($adminPermissions);

        // Customer: data milik sendiri saja
        $customerPermissions = [
            'users.view',
            'users.edit',
            'invitations.create',
            'invitations.view',
            'invitations.edit',
            'invitations.delete',
            'invitations.publish',
            'invitations.custom_domain',
            'invitations.builder',
            'guests.view',
            'guests.create',
            'guests.edit',
            'guests.delete',
            'guests.import',
            'transactions.view',
            'transactions.create',
            'payments.view',
            'payments.methods',
            'payments.receipt',
            'analytics.view',
            'analytics.export',
            'content.media.upload',
            'content.media.delete',
            'content.stories',
            'content.gallery',
            'content.themes',
            'content.themes.custom',
            'content.photos.approve',
            'amplope.accounts',
            'amplope.withdraw',
        ];
        $customer->syncPermissions($customerPermissions);

        $this->command->info('Roles dan permissions berhasil di-seed.');
        $this->command->info('  super_admin : ' . count($permissions)           . ' permissions');
        $this->command->info('  admin       : ' . count($adminPermissions)      . ' permissions');
        $this->command->info('  customer    : ' . count($customerPermissions)   . ' permissions');
    }
}
