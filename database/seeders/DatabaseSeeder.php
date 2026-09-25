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
     * 5. Customer accounts
     * 6. Sample invitations
     * 7. Sample transactions and payment history
     * 8. Payment gateway configs
     * 9. Application settings
     */
    public function run(): void
    {
        $this->call([
            EventTypeSeeder::class,
            PackageSeeder::class,
            ThemeSeeder::class,
            AdditionalThemeSeeder::class,
            ThemeCoverSeeder::class,
            EventTypeFieldSeeder::class,
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            CustomerSeeder::class,
            InvitationSeeder::class,
            SampleInvitationSeeder::class,
            TransactionSeeder::class,
            PaymentGatewayConfigSeeder::class,
            AppSettingSeeder::class,
        ]);

        $this->command?->info('');
        $this->command?->info('==============================================');
        $this->command?->info('UNDESIA Database Seeding Complete!');
        $this->command?->info('==============================================');
        $this->command?->info('');
        $this->command?->info('Tables seeded:');
        $this->command?->info('- event_types (6 types)');
        $this->command?->info('- event_type_fields (EAV field definitions)');
        $this->command?->info('- packages (18 packages: 3 tiers x 6 invitation types)');
        $this->command?->info('- package_features (feature catalogue)');
        $this->command?->info('- themes (default + additional themes)');
        $this->command?->info('- roles & permissions');
        $this->command?->info('- users (super_admin, admin, demo customers)');
        $this->command?->info('- invitations (30 sample records)');
        $this->command?->info('- theme sample invitations (1 per renderable theme, is_sample = true)');
        $this->command?->info('- transactions (30 sample records)');
        $this->command?->info('- payments (35 sample records)');
        $this->command?->info('- payment_gateway_configs');
        $this->command?->info('- app_settings (defaults)');
        $this->command?->info('');
        $this->command?->info('Test accounts:');
        $this->command?->info('superadmin@undesia.id / SuperAdmin@2026!');
        $this->command?->info('admin@undesia.id / Admin@2026!');
        $this->command?->info('demo@undesia.id / Demo@2026!');
    }
}
