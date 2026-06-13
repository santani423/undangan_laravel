<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $eventTypes = [
            [
                'name' => 'wedding',
                'label' => 'Pernikahan',
                'description' => 'Undangan pernikahan untuk akad dan resepsi',
                'icon_path' => 'icons/wedding.svg',
                'is_active' => true,
            ],
            [
                'name' => 'birthday',
                'label' => 'ulang_tahun',
                'description' => 'Undangan pesta ulang tahun',
                'icon_path' => 'icons/birthday.svg',
                'is_active' => true,
            ],
            [
                'name' => 'khitanan',
                'label' => 'Khitanan',
                'description' => 'Undangan acara khitanan/sunatan',
                'icon_path' => 'icons/khitanan.svg',
                'is_active' => true,
            ],
            [
                'name' => 'aqiqah',
                'label' => 'Aqiqah',
                'description' => 'Undangan acara aqiqah',
                'icon_path' => 'icons/aqiqah.svg',
                'is_active' => true,
            ],
            [
                'name' => 'gender_reveal',
                'label' => 'gender_reveal',
                'description' => 'Undangan pesta gender reveal',
                'icon_path' => 'icons/gender_reveal.svg',
                'is_active' => true,
            ],
            [
                'name' => 'syukuran',
                'label' => 'Syukuran/Selamatan',
                'description' => 'Undangan acara syukuran dan selamatan',
                'icon_path' => 'icons/syukuran.svg',
                'is_active' => true,
            ],
        ];

        foreach ($eventTypes as $eventType) {
            DB::table('event_types')->updateOrInsert(
                ['name' => $eventType['name']],
                array_merge($eventType, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
