<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $spatieAvailable = class_exists(\Spatie\Permission\Models\Role::class);

        $customers = [
            [
                'name'            => 'Budi Santoso',
                'email'           => 'budi@example.com',
                'password'        => Hash::make('Customer@2026!'),
                'phone_number'    => '+6281200000001',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Siti Rahayu',
                'email'           => 'siti@example.com',
                'password'        => Hash::make('Customer@2026!'),
                'phone_number'    => '+6281200000002',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Ahmad Fauzi',
                'email'           => 'ahmad@example.com',
                'password'        => Hash::make('Customer@2026!'),
                'phone_number'    => '+6281200000003',
                'wa_notification' => false,
            ],
            [
                'name'            => 'Dewi Kusuma',
                'email'           => 'dewi@example.com',
                'password'        => Hash::make('Customer@2026!'),
                'phone_number'    => '+6281200000004',
                'wa_notification' => true,
            ],
            [
                'name'            => 'Rizky Pratama',
                'email'           => 'rizky@example.com',
                'password'        => Hash::make('Customer@2026!'),
                'phone_number'    => '+6281200000005',
                'wa_notification' => false,
            ],
        ];

        foreach ($customers as $data) {
            if (DB::table('users')->where('email', $data['email'])->exists()) {
                $this->command->warn("Customer {$data['email']} sudah ada, sync role...");
                if ($spatieAvailable) {
                    $user = User::where('email', $data['email'])->first();
                    if ($user && method_exists($user, 'syncRoles')) {
                        $user->syncRoles(['customer']);
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
                'user_id'                  => $userId,
                'language'                 => 'id',
                'timezone'                 => 'Asia/Jakarta',
                'notification_preferences' => json_encode([
                    'email'     => true,
                    'whatsapp'  => $data['wa_notification'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($spatieAvailable) {
                $user = User::find($userId);
                if ($user && method_exists($user, 'assignRole')) {
                    $user->assignRole('customer');
                }
            }

            $this->command->info("  Dibuat: {$data['email']} (role: customer)");
        }

        $this->command->info('');
        $this->command->info('Customer test accounts (password: Customer@2026!):');
        foreach ($customers as $c) {
            $this->command->info("  {$c['email']}");
        }
    }
}
