<?php

namespace Database\Seeders\Data;

/**
 * Single source of truth for the dev/test accounts created by AdminUserSeeder
 * and CustomerSeeder. Also read by AuthenticatedSessionController to offer a
 * quick-login picker on the login page when APP_DEBUG=true.
 */
class DevAccounts
{
    public static function admins(): array
    {
        return [
            [
                'name'            => 'Super Admin UNDESIA',
                'email'           => 'admin@gmail.com',
                'password'        => '12345678',
                'phone_number'    => '+6281234567890',
                'role'            => 'super_admin',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Admin UNDESIA',
                'email'           => 'admin@undesia.id',
                'password'        => 'Admin@2026!',
                'phone_number'    => '+6281234567891',
                'role'            => 'admin',
                'wa_notification' => false,
            ],
            [
                'name'            => 'Demo Customer',
                'email'           => 'demo@undesia.id',
                'password'        => 'Demo@2026!',
                'phone_number'    => '+6281234567892',
                'role'            => 'customer',
                'wa_notification' => true,
            ],
        ];
    }

    public static function customers(): array
    {
        return [
            [
                'name'            => 'Budi Santoso',
                'email'           => 'budi@example.com',
                'password'        => '123456789',
                'phone_number'    => '+6281200000001',
                'role'            => 'customer',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Siti Rahayu',
                'email'           => 'siti@example.com',
                'password'        => '123456789',
                'phone_number'    => '+6281200000002',
                'role'            => 'customer',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Ahmad Fauzi',
                'email'           => 'ahmad@example.com',
                'password'        => '123456789',
                'phone_number'    => '+6281200000003',
                'role'            => 'customer',
                'wa_notification' => false,
            ],
            [
                'name'            => 'Dewi Kusuma',
                'email'           => 'dewi@example.com',
                'password'        => '123456789',
                'phone_number'    => '+6281200000004',
                'role'            => 'customer',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Rizky Pratama',
                'email'           => 'rizky@example.com',
                'password'        => '123456789',
                'phone_number'    => '+6281200000005',
                'role'            => 'customer',
                'wa_notification' => false,
            ],
        ];
    }

    public static function all(): array
    {
        return array_merge(self::admins(), self::customers());
    }
}
