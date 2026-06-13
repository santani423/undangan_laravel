<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application database.
     *
     * Run order is important due to foreign key dependencies:
     * 1. Core lookup tables (event_types, packages, themes)
     * 2. EAV field definitions (event_type_fields, package_features)
     * 3. Auth (roles, permissions via Spatie)
     * 4. Users (admin accounts)
     * 5. Payment gateway configs
     *
     * Usage:
     *   php artisan db:seed                     # Full seed
     *   php artisan db:seed --class=PackageSeeder   # Single seeder
     *
     * Prerequisites:
     *   composer require spatie/laravel-permission
     *   php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
     *   php artisan migrate
     */
    public function run(): void
    {
        $this->call([
            // 1. Core lookup tables (no dependencies)
            EventTypeSeeder::class,
            PackageSeeder::class,
            ThemeSeeder::class,

            // 2. EAV field definitions (depends on event_types, packages)
            EventTypeFieldSeeder::class,

            // 3. Roles & Permissions (depends on Spatie tables from migration)
            RolePermissionSeeder::class,

            // 4. Admin users (depends on roles, packages)
            AdminUserSeeder::class,

            // 5. Customer accounts (depends on roles)
            CustomerSeeder::class,

            // 6. Payment gateway configs
            PaymentGatewayConfigSeeder::class,

            // 7. Application settings (defaults)
            AppSettingSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('==============================================');
        $this->command->info(' UNDESIA Database Seeding Complete!');
        $this->command->info('==============================================');
        $this->command->info('');
        $this->command->info('Tables seeded:');
        $this->command->info('  ✓ event_types (6 types)');
        $this->command->info('  ✓ event_type_fields (EAV field definitions)');
        $this->command->info('  ✓ packages (18 paket: 3 tier × 6 jenis undangan)');
        $this->command->info('  ✓ package_features (19 fitur × 18 paket = 342 baris)');
        $this->command->info('  ✓ themes (12 themes)');
        $this->command->info('  ✓ roles & permissions (47 permissions, 3 roles)');
        $this->command->info('  ✓ users (super_admin, admin, demo customer)');
        $this->command->info('  ✓ payment_gateway_configs');
        $this->command->info('  ✓ app_settings (defaults)');
        $this->command->info('');
        $this->command->info('Test accounts:');
        $this->command->info('  superadmin@undesia.id / SuperAdmin@2026!');
        $this->command->info('  admin@undesia.id / Admin@2026!');
        $this->command->info('  demo@undesia.id / Demo@2026!');
    }
}
