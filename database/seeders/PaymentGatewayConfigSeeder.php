<?php

namespace Database\Seeders;

use App\Models\PaymentGatewayConfig;
use Illuminate\Database\Seeder;

class PaymentGatewayConfigSeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            [
                'gateway_name' => 'midtrans',
                'gateway_type' => 'payment',
                'config_extra' => [
                    'values' => [],
                    'enabled_methods' => ['va', 'qris', 'ewallet'],
                ],
                'is_active' => false,
                'is_test_mode' => true,
            ],
            [
                'gateway_name' => 'xendit',
                'gateway_type' => 'payment',
                'config_extra' => [
                    'values' => [],
                    'enabled_methods' => [],
                ],
                'is_active' => false,
                'is_test_mode' => true,
            ],
            [
                'gateway_name' => 'tripay',
                'gateway_type' => 'payment',
                'config_extra' => [
                    'values' => [],
                    'enabled_methods' => [],
                ],
                'is_active' => false,
                'is_test_mode' => true,
            ],
            [
                'gateway_name' => 'manual',
                'gateway_type' => 'payment',
                'config_extra' => [
                    'values' => [],
                    'enabled_methods' => ['transfer'],
                ],
                'is_active' => true,
                'is_test_mode' => false,
            ],
        ];

        // Uses the Eloquent model (not DB::table()) so config_extra passes through
        // the model's `encrypted:array` cast instead of being stored as plaintext JSON.
        foreach ($gateways as $gateway) {
            PaymentGatewayConfig::updateOrCreate(
                ['gateway_name' => $gateway['gateway_name']],
                $gateway
            );
        }

        $this->command->info('Payment gateway configs seeded (midtrans, xendit, tripay, manual).');
    }
}
