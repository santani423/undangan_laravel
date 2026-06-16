<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = array_merge(
            $this->weddingThemes(),
            $this->birthdayThemes(),
            $this->khitananThemes(),
            $this->aqiqahThemes(),
            $this->genderRevealThemes(),
            $this->syukuranThemes(),
        );

        foreach ($themes as $theme) {
            DB::table('themes')->updateOrInsert(
                ['slug' => $theme['slug']],
                array_merge($theme, [
                    'tags'               => json_encode($theme['tags']),
                    'preview_image_url'  => null,
                    'thumbnail_url'      => null,
                    'is_active'          => true,
                    'created_by_user_id' => null,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ])
            );
        }
    }

    private function weddingThemes(): array
    {
        return [
            [
                'name'            => 'Blossom Garden',
                'slug'            => 'blossom-garden',
                'description'     => 'Tema floral romantis dengan palet warna pastel lembut.',
                'category'        => 'Floral',
                'event_type'      => 'wedding',
                'color_primary'   => '#e8a5b4',
                'color_secondary' => '#f9e4ea',
                'tags'            => ['floral', 'romantis', 'pastel'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 342,
            ],
            [
                'name'            => 'Rustic Charm',
                'slug'            => 'rustic-charm',
                'description'     => 'Nuansa rustic yang hangat dan natural.',
                'category'        => 'Rustic',
                'event_type'      => 'wedding',
                'color_primary'   => '#8b6f47',
                'color_secondary' => '#f2ebe0',
                'tags'            => ['rustic', 'natural', 'vintage'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 189,
            ], 
        ];
    }

    private function birthdayThemes(): array
    {
        return [
            [
                'name'            => 'Starry Night',
                'slug'            => 'starry-night',
                'description'     => 'Minimalis dengan sentuhan bintang dan langit malam.',
                'category'        => 'Minimalis',
                'event_type'      => 'birthday',
                'color_primary'   => '#3b4c8a',
                'color_secondary' => '#eef0fb',
                'tags'            => ['minimalis', 'bintang', 'biru'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 156,
            ], 
        ];
    }

    private function khitananThemes(): array
    {
        return [
            [
                'name'            => 'Sky Blue Junior',
                'slug'            => 'sky-blue-junior',
                'description'     => 'Tema biru langit segar yang cocok untuk khitanan anak.',
                'category'        => 'Minimalis',
                'event_type'      => 'khitanan',
                'color_primary'   => '#4fc3f7',
                'color_secondary' => '#e1f5fe',
                'tags'            => ['biru', 'segar', 'anak'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 174,
            ], 
        ];
    }

    private function aqiqahThemes(): array
    {
        return [
            [
                'name'            => 'Baby Bloom',
                'slug'            => 'baby-bloom',
                'description'     => 'Manis dan lembut untuk menyambut buah hati.',
                'category'        => 'Floral',
                'event_type'      => 'aqiqah',
                'color_primary'   => '#f8bbd0',
                'color_secondary' => '#fce4ec',
                'tags'            => ['bayi', 'lembut', 'floral'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 198,
            ],
            [
                'name'            => 'Little Star',
                'slug'            => 'little-star',
                'description'     => 'Bintang kecil yang bersinar untuk sang buah hati.',
                'category'        => 'Minimalis',
                'event_type'      => 'aqiqah',
                'color_primary'   => '#ffe082',
                'color_secondary' => '#fffde7',
                'tags'            => ['bintang', 'kuning', 'lembut'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 154,
            ],
            [
                'name'            => 'Aqua Marine',
                'slug'            => 'aqua-marine',
                'description'     => 'Kesegaran laut dengan warna biru toska jernih.',
                'category'        => 'Modern',
                'event_type'      => 'aqiqah',
                'color_primary'   => '#2a9d8f',
                'color_secondary' => '#e8f8f6',
                'tags'            => ['toska', 'laut', 'segar'],
                'is_premium'      => true,
                'is_exclusive'    => false,
                'price'           => 75000,
                'usage_count'     => 88,
            ],
            [
                'name'            => 'Bismillah Blossom',
                'slug'            => 'bismillah-blossom',
                'description'     => 'Ornamen islami dengan bunga lembut yang penuh berkah.',
                'category'        => 'Islami',
                'event_type'      => 'aqiqah',
                'color_primary'   => '#80cbc4',
                'color_secondary' => '#e0f2f1',
                'tags'            => ['islami', 'floral', 'berkah'],
                'is_premium'      => true,
                'is_exclusive'    => false,
                'price'           => 69000,
                'usage_count'     => 112,
            ],
            [
                'name'            => 'Angel Cloud',
                'slug'            => 'angel-cloud',
                'description'     => 'Desain premium eksklusif dengan nuansa awan putih yang suci.',
                'category'        => 'Mewah',
                'event_type'      => 'aqiqah',
                'color_primary'   => '#b3c7e6',
                'color_secondary' => '#eaf0fb',
                'tags'            => ['awan', 'putih', 'suci'],
                'is_premium'      => true,
                'is_exclusive'    => true,
                'price'           => 135000,
                'usage_count'     => 28,
            ],
        ];
    }

    private function genderRevealThemes(): array
    {
        return [
            [
                'name'            => 'Pink or Blue',
                'slug'            => 'pink-or-blue',
                'description'     => 'Klasik pink dan biru untuk reveal jenis kelamin si kecil.',
                'category'        => 'Ceria',
                'event_type'      => 'gender_reveal',
                'color_primary'   => '#f48fb1',
                'color_secondary' => '#90caf9',
                'tags'            => ['pink', 'biru', 'reveal'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 267,
            ],
            [
                'name'            => 'Balloon Fiesta',
                'slug'            => 'balloon-fiesta',
                'description'     => 'Semarak balon warna-warni untuk momen pengungkapan.',
                'category'        => 'Ceria',
                'event_type'      => 'gender_reveal',
                'color_primary'   => '#ce93d8',
                'color_secondary' => '#f3e5f5',
                'tags'            => ['balon', 'pesta', 'ceria'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 183,
            ],
            [
                'name'            => 'Confetti Surprise',
                'slug'            => 'confetti-surprise',
                'description'     => 'Kejutan konfeti yang meriah dan penuh warna.',
                'category'        => 'Ceria',
                'event_type'      => 'gender_reveal',
                'color_primary'   => '#7c4dff',
                'color_secondary' => '#ede7f6',
                'tags'            => ['konfeti', 'kejutan', 'ungu'],
                'is_premium'      => true,
                'is_exclusive'    => false,
                'price'           => 59000,
                'usage_count'     => 142,
            ],
            [
                'name'            => 'Sweet Reveal',
                'slug'            => 'sweet-reveal',
                'description'     => 'Manis dan elegan untuk mengumumkan jenis kelamin bayi.',
                'category'        => 'Floral',
                'event_type'      => 'gender_reveal',
                'color_primary'   => '#f06292',
                'color_secondary' => '#fce4ec',
                'tags'            => ['manis', 'elegan', 'floral'],
                'is_premium'      => true,
                'is_exclusive'    => false,
                'price'           => 79000,
                'usage_count'     => 94,
            ],
            [
                'name'            => 'Galaxy Reveal',
                'slug'            => 'galaxy-reveal',
                'description'     => 'Desain eksklusif bertema galaksi yang memukau.',
                'category'        => 'Modern',
                'event_type'      => 'gender_reveal',
                'color_primary'   => '#311b92',
                'color_secondary' => '#ead1f7',
                'tags'            => ['galaksi', 'bintang', 'eksklusif'],
                'is_premium'      => true,
                'is_exclusive'    => true,
                'price'           => 145000,
                'usage_count'     => 37,
            ],
        ];
    }

    private function syukuranThemes(): array
    {
        return [
            [
                'name'            => 'Warm Gathering',
                'slug'            => 'warm-gathering',
                'description'     => 'Kehangatan kebersamaan dengan warna tanah yang nyaman.',
                'category'        => 'Rustic',
                'event_type'      => 'syukuran',
                'color_primary'   => '#d4845a',
                'color_secondary' => '#fdf0e8',
                'tags'            => ['hangat', 'kebersamaan', 'natural'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 221,
            ],
            [
                'name'            => 'Sandy Shore',
                'slug'            => 'sandy-shore',
                'description'     => 'Nuansa pantai dengan gradasi pasir dan laut.',
                'category'        => 'Alam',
                'event_type'      => 'syukuran',
                'color_primary'   => '#c8a96e',
                'color_secondary' => '#fdf6ec',
                'tags'            => ['pantai', 'hangat', 'natural'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 84,
            ],
            [
                'name'            => 'Alhamdulillah',
                'slug'            => 'alhamdulillah',
                'description'     => 'Nuansa islami syukuran dengan ornamen kaligrafi yang indah.',
                'category'        => 'Islami',
                'event_type'      => 'syukuran',
                'color_primary'   => '#388e3c',
                'color_secondary' => '#e8f5e9',
                'tags'            => ['islami', 'kaligrafi', 'hijau'],
                'is_premium'      => false,
                'is_exclusive'    => false,
                'price'           => 0,
                'usage_count'     => 309,
            ],
            [
                'name'            => 'Golden Blessing',
                'slug'            => 'golden-blessing',
                'description'     => 'Syukuran istimewa dengan sentuhan emas yang berkelas.',
                'category'        => 'Mewah',
                'event_type'      => 'syukuran',
                'color_primary'   => '#f9a825',
                'color_secondary' => '#fff8e1',
                'tags'            => ['emas', 'berkah', 'mewah'],
                'is_premium'      => true,
                'is_exclusive'    => false,
                'price'           => 69000,
                'usage_count'     => 156,
            ],
            [
                'name'            => 'Barakah Garden',
                'slug'            => 'barakah-garden',
                'description'     => 'Taman penuh berkah dengan ornamen bunga islami eksklusif.',
                'category'        => 'Islami',
                'event_type'      => 'syukuran',
                'color_primary'   => '#1b5e20',
                'color_secondary' => '#dcedc8',
                'tags'            => ['islami', 'taman', 'berkah'],
                'is_premium'      => true,
                'is_exclusive'    => true,
                'price'           => 125000,
                'usage_count'     => 44,
            ],
        ];
    }
}
