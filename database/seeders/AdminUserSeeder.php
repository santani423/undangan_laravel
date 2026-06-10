<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $spatieAvailable = class_exists(\Spatie\Permission\Models\Role::class);

        if (!$spatieAvailable) {
            $this->command->warn('Spatie Permission tidak tersedia — user dibuat tanpa role assignment.');
        }

        $users = [
            [
                'name'              => 'Super Admin UNDESIA',
                'email'             => 'superadmin@undesia.id',
                'password'          => Hash::make('SuperAdmin@2026!'),
                'phone_number'      => '+6281234567890',
                'role'              => 'super_admin',
                'wa_notification'   => true,
            ],
            [
                'name'              => 'Admin UNDESIA',
                'email'             => 'admin@undesia.id',
                'password'          => Hash::make('Admin@2026!'),
                'phone_number'      => '+6281234567891',
                'role'              => 'admin',
                'wa_notification'   => false,
            ],
            [
                'name'              => 'Demo Customer',
                'email'             => 'demo@undesia.id',
                'password'          => Hash::make('Demo@2026!'),
                'phone_number'      => '+6281234567892',
                'role'              => 'customer',
                'wa_notification'   => true,
            ],
        ];

        foreach ($users as $data) {
            // Idempotent: skip insert jika email sudah ada, tapi tetap sync role
            if (DB::table('users')->where('email', $data['email'])->exists()) {
                $this->command->warn("User {$data['email']} sudah ada, sync role...");
                if ($spatieAvailable) {
                    $user = User::where('email', $data['email'])->first();
                    if ($user && method_exists($user, 'syncRoles')) {
                        $user->syncRoles([$data['role']]);
                        $this->command->info("  Role synced: {$data['email']} => {$data['role']}");
                    }
                }
                continue;
            }

            $userId = DB::table('users')->insertGetId([
                'name'              => $data['name'],
                'email'             => $data['email'],
                'password'          => $data['password'],
                'phone_number'      => $data['phone_number'],
                'is_active'         => true,
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            DB::table('user_profiles')->insert([
                'user_id'                    => $userId,
                'language'                   => 'id',
                'timezone'                   => 'Asia/Jakarta',
                'notification_preferences'   => json_encode([
                    'email'     => true,
                    'whatsapp'  => $data['wa_notification'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign role hanya jika Spatie terinstall DAN User model memiliki trait HasRoles
            if ($spatieAvailable) {
                $user = User::find($userId);
                if ($user && method_exists($user, 'assignRole')) {
                    $user->assignRole($data['role']);
                }
            }

            $this->command->info("  Dibuat: {$data['email']} (role: {$data['role']})");
        }

        $this->command->info('');
        $this->command->info('Akun test:');
        $this->command->info('  superadmin@undesia.id / SuperAdmin@2026!');
        $this->command->info('  admin@undesia.id      / Admin@2026!');
        $this->command->info('  demo@undesia.id       / Demo@2026!');
    }
}
