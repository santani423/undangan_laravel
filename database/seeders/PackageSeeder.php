<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'basic',
                'label' => 'Paket Basic',
                'description' => 'Paket terjangkau untuk undangan digital sederhana. Cocok untuk acara kecil dan personal.',
                'price' => 99000.00,
                'currency' => 'IDR',
                'billing_period' => 'month',
                'duration_days' => 90,
                'trial_days' => 3,
                'max_gallery_uploads' => 10,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'premium',
                'label' => 'Paket Premium',
                'description' => 'Paket populer dengan fitur lengkap. Cocok untuk sebagian besar acara. Termasuk amplop digital dan domain kustom.',
                'price' => 249000.00,
                'currency' => 'IDR',
                'billing_period' => 'month',
                'duration_days' => 180,
                'trial_days' => 7,
                'max_gallery_uploads' => 50,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'exclusive',
                'label' => 'Paket Eksklusif',
                'description' => 'Paket lengkap dengan semua fitur premium. Untuk acara besar dan profesional. Termasuk Instagram Filter dan API access.',
                'price' => 499000.00,
                'currency' => 'IDR',
                'billing_period' => 'month',
                'duration_days' => 365,
                'trial_days' => 14,
                'max_gallery_uploads' => 0,
                'is_active' => true,
                'display_order' => 3,
            ],
        ];

        $features = [
            'basic' => [
                ['feature_key' => 'page_builder', 'feature_type' => 'level', 'feature_value' => 'basic'],
                ['feature_key' => 'analytics', 'feature_type' => 'level', 'feature_value' => 'basic'],
                ['feature_key' => 'themes', 'feature_type' => 'level', 'feature_value' => 'basic'],
                ['feature_key' => 'custom_domain', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'page_password', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'amplop_digital', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'gift_wishlist', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'gender_poll', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'live_stream', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'interactive_games', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'instagram_filter', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'dress_code', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'wa_reminders', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'email_marketing', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'api_access', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'priority_support', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'custom_branding', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'account_manager', 'feature_type' => 'boolean', 'feature_value' => 'false'],
            ],
            'premium' => [
                ['feature_key' => 'page_builder', 'feature_type' => 'level', 'feature_value' => 'intermediate'],
                ['feature_key' => 'analytics', 'feature_type' => 'level', 'feature_value' => 'intermediate'],
                ['feature_key' => 'themes', 'feature_type' => 'level', 'feature_value' => 'extended'],
                ['feature_key' => 'custom_domain', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'page_password', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'amplop_digital', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'gift_wishlist', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'gender_poll', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'live_stream', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'interactive_games', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'instagram_filter', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'dress_code', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'wa_reminders', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'email_marketing', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'api_access', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'priority_support', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'custom_branding', 'feature_type' => 'boolean', 'feature_value' => 'false'],
                ['feature_key' => 'account_manager', 'feature_type' => 'boolean', 'feature_value' => 'false'],
            ],
            'exclusive' => [
                ['feature_key' => 'page_builder', 'feature_type' => 'level', 'feature_value' => 'full'],
                ['feature_key' => 'analytics', 'feature_type' => 'level', 'feature_value' => 'full'],
                ['feature_key' => 'themes', 'feature_type' => 'level', 'feature_value' => 'full'],
                ['feature_key' => 'custom_domain', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'page_password', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'amplop_digital', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'gift_wishlist', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'gender_poll', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'live_stream', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'interactive_games', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'instagram_filter', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'dress_code', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'wa_reminders', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'email_marketing', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'api_access', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'priority_support', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'custom_branding', 'feature_type' => 'boolean', 'feature_value' => 'true'],
                ['feature_key' => 'account_manager', 'feature_type' => 'boolean', 'feature_value' => 'true'],
            ],
        ];

        foreach ($packages as $packageData) {
            $packageId = DB::table('packages')->insertGetId(array_merge($packageData, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            if (!$packageId) {
                $pkg = DB::table('packages')->where('name', $packageData['name'])->first();
                $packageId = $pkg->id;
            }

            foreach ($features[$packageData['name']] as $feature) {
                DB::table('package_features')->updateOrInsert(
                    ['package_id' => $packageId, 'feature_key' => $feature['feature_key']],
                    array_merge($feature, [
                        'package_id' => $packageId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }
}
