<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            // Basic Themes (3 free themes)
            [
                'name' => 'Minimalist White',
                'slug' => 'minimalist-white',
                'description' => 'Tema minimalis dengan latar putih bersih. Elegan dan modern.',
                'colors' => json_encode(['primary' => '#2D2D2D', 'secondary' => '#6B7280', 'accent' => '#F3F4F6', 'background' => '#FFFFFF', 'text' => '#111827']),
                'is_free' => true,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Elegant Gold',
                'slug' => 'elegant-gold',
                'description' => 'Tema elegan dengan sentuhan emas. Cocok untuk pernikahan mewah.',
                'colors' => json_encode(['primary' => '#C9A84C', 'secondary' => '#8B6914', 'accent' => '#FDF6E3', 'background' => '#FFFBF0', 'text' => '#3D2B0B']),
                'is_free' => true,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Modern Dark',
                'slug' => 'modern-dark',
                'description' => 'Tema modern dengan latar gelap. Kontras yang kuat dan dramatis.',
                'colors' => json_encode(['primary' => '#E5E7EB', 'secondary' => '#9CA3AF', 'accent' => '#374151', 'background' => '#111827', 'text' => '#F9FAFB']),
                'is_free' => true,
                'is_featured' => false,
                'is_active' => true,
            ],

            // Premium Themes (7 additional)
            [
                'name' => 'Floral Rose',
                'slug' => 'floral-rose',
                'description' => 'Tema bunga mawar yang romantis. Sempurna untuk pernikahan dan ulang tahun.',
                'colors' => json_encode(['primary' => '#BE123C', 'secondary' => '#E11D48', 'accent' => '#FFF1F2', 'background' => '#FFF5F7', 'text' => '#4C0519']),
                'is_free' => false,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Garden Bloom',
                'slug' => 'garden-bloom',
                'description' => 'Tema taman bunga yang segar dan natural.',
                'colors' => json_encode(['primary' => '#166534', 'secondary' => '#15803D', 'accent' => '#DCFCE7', 'background' => '#F0FDF4', 'text' => '#14532D']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Vintage Rustic',
                'slug' => 'vintage-rustic',
                'description' => 'Tema vintage rustic dengan nuansa hangat dan nostalgia.',
                'colors' => json_encode(['primary' => '#92400E', 'secondary' => '#B45309', 'accent' => '#FEF3C7', 'background' => '#FFFBEB', 'text' => '#451A03']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Bohemian Dream',
                'slug' => 'bohemian-dream',
                'description' => 'Tema bohemian yang artistik dan penuh warna.',
                'colors' => json_encode(['primary' => '#7C3AED', 'secondary' => '#8B5CF6', 'accent' => '#F5F3FF', 'background' => '#FDFAFF', 'text' => '#2E1065']),
                'is_free' => false,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Ocean Breeze',
                'slug' => 'ocean-breeze',
                'description' => 'Tema laut yang menenangkan dengan warna biru dan tosca.',
                'colors' => json_encode(['primary' => '#0C4A6E', 'secondary' => '#0369A1', 'accent' => '#E0F2FE', 'background' => '#F0F9FF', 'text' => '#082F49']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Sunset Glow',
                'slug' => 'sunset-glow',
                'description' => 'Tema sunset dengan gradasi warna oranye dan merah muda.',
                'colors' => json_encode(['primary' => '#EA580C', 'secondary' => '#F97316', 'accent' => '#FFF7ED', 'background' => '#FFFBF5', 'text' => '#431407']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Cherry Blossom',
                'slug' => 'cherry-blossom',
                'description' => 'Tema sakura yang lembut dan cantik. Cocok untuk pernikahan musim semi.',
                'colors' => json_encode(['primary' => '#9D174D', 'secondary' => '#BE185D', 'accent' => '#FDF2F8', 'background' => '#FFF5F9', 'text' => '#500724']),
                'is_free' => false,
                'is_featured' => true,
                'is_active' => true,
            ],

            // Exclusive Themes (10 additional premium)
            [
                'name' => 'Royal Blue',
                'slug' => 'royal-blue',
                'description' => 'Tema kerajaan biru yang megah dan berwibawa.',
                'colors' => json_encode(['primary' => '#1E3A8A', 'secondary' => '#1D4ED8', 'accent' => '#EFF6FF', 'background' => '#F8FAFF', 'text' => '#1E3A8A']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Luxury Black',
                'slug' => 'luxury-black',
                'description' => 'Tema mewah hitam dengan aksen emas. Untuk undangan premium.',
                'colors' => json_encode(['primary' => '#D97706', 'secondary' => '#B45309', 'accent' => '#292524', 'background' => '#1C1917', 'text' => '#FEF3C7']),
                'is_free' => false,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Tropical Paradise',
                'slug' => 'tropical-paradise',
                'description' => 'Tema tropis dengan nuansa hijau dan kuning cerah.',
                'colors' => json_encode(['primary' => '#065F46', 'secondary' => '#059669', 'accent' => '#ECFDF5', 'background' => '#F0FDF9', 'text' => '#022C22']),
                'is_free' => false,
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($themes as $theme) {
            DB::table('themes')->updateOrInsert(
                ['slug' => $theme['slug']],
                array_merge($theme, [
                    'preview_image_url' => 'themes/previews/' . $theme['slug'] . '.jpg',
                    'thumbnail_url' => 'themes/thumbnails/' . $theme['slug'] . '.jpg',
                    'created_by_user_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
