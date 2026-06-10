<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentGatewayConfigSeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            [
                'gateway_name' => 'midtrans',
                'gateway_type' => 'payment',
                'config_key' => null, // To be set via admin panel
                'config_secret' => null,
                'config_extra' => json_encode([
                    'environment' => 'sandbox',
                    'snap_url' => 'https://app.sandbox.midtrans.com/snap/snap.js',
                    'api_url' => 'https://api.sandbox.midtrans.com',
                ]),
                'is_active' => false,
                'is_test_mode' => true,
            ],
            [
                'gateway_name' => 'xendit',
                'gateway_type' => 'payment',
                'config_key' => null,
                'config_secret' => null,
                'config_extra' => json_encode([
                    'environment' => 'test',
                    'api_url' => 'https://api.xendit.co',
                    'webhook_token' => null,
                ]),
                'is_active' => false,
                'is_test_mode' => true,
            ],
            [
                'gateway_name' => 'manual',
                'gateway_type' => 'payment',
                'config_key' => null,
                'config_secret' => null,
                'config_extra' => json_encode([
                    'instructions' => 'Transfer ke rekening yang tertera, kemudian konfirmasi pembayaran.',
                    'confirmation_hours' => 24,
                ]),
                'is_active' => true,
                'is_test_mode' => false,
            ],
        ];

        foreach ($gateways as $gateway) {
            DB::table('payment_gateway_configs')->updateOrInsert(
                ['gateway_name' => $gateway['gateway_name']],
                array_merge($gateway, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('Payment gateway configs seeded (midtrans, xendit, manual).');
    }
}
