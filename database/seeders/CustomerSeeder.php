<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Data\DevAccounts;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $spatieAvailable = class_exists(\Spatie\Permission\Models\Role::class);

        $customers = DevAccounts::customers();

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
                'password'          => Hash::make($data['password']),
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
        $this->command->info('Customer test accounts:');
        foreach ($customers as $c) {
            $this->command->info("  {$c['email']} / {$c['password']}");
        }
    }
}
