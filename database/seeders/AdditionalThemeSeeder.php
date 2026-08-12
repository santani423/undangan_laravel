<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalThemeSeeder extends Seeder
{
    public function run(): void
    {
        $eventTypes = ['wedding', 'birthday', 'khitanan', 'aqiqah', 'gender_reveal', 'syukuran'];
        foreach ($eventTypes as $type) {
            for ($i = 1; $i <= 30; $i++) {
                $index = str_pad($i, 2, '0', STR_PAD_LEFT);
                $slug = "{$type}_theme_{$index}";
                $name = ucwords(str_replace('_', ' ', $slug));

                // Skip slugs already seeded with curated data (e.g. by ThemeSeeder) —
                // this seeder only fills in placeholder rows for slugs nothing else defines.
                if (DB::table('themes')->where('slug', $slug)->exists()) {
                    continue;
                }

                DB::table('themes')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'description' => "Premium {$type} theme number {$i}.",
                        'category' => 'Premium',
                        'event_type' => $type,
                        'color_primary' => '#'.dechex(rand(0x000000, 0xFFFFFF)),
                        'color_secondary' => '#'.dechex(rand(0x000000, 0xFFFFFF)),
                        'tags' => json_encode(['premium', $type]),
                        'is_active' => true,
                        'is_premium' => true,
                        'is_exclusive' => false,
                        'price' => 50000,
                        'usage_count' => 0,
                        'preview_image_url' => null,
                        'thumbnail_url' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
