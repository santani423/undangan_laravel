<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

/**
 * Seeds starter/demo testimonials so the public landing page isn't empty on
 * a fresh install. These are placeholder social proof, not real customer
 * submissions — edit or remove them via `php artisan tinker` for now. No
 * admin moderation UI exists yet (resources/js/pages/admin/content/testimonials.tsx
 * is currently a "Coming Soon" stub with no backing routes/controller).
 */
class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'name'          => 'Rina & Fajar',
                'event_type'    => 'Pernikahan',
                'content'       => 'Undesia membuat pernikahan kami terasa lebih eksklusif. Semua tamu mudah mengakses undangan digital kami.',
                'rating'        => 5,
                'display_order' => 1,
            ],
            [
                'name'          => 'Sari & Ahmad',
                'event_type'    => 'Khitanan',
                'content'       => 'Undangan digital untuk khitanan anak kami sangat berkesan. Keluarga yang jauh bisa ikut merasakan momen bahagia ini.',
                'rating'        => 5,
                'display_order' => 2,
            ],
            [
                'name'          => 'Maya & Budi',
                'event_type'    => 'Ulang Tahun',
                'content'       => 'Fitur amplop digital dan buku tamu digital sangat memudahkan acara ulang tahun putri kami. Terima kasih Undesia!',
                'rating'        => 5,
                'display_order' => 3,
            ],
            [
                'name'          => 'Dewi & Rizki',
                'event_type'    => 'Pernikahan',
                'content'       => 'Desain yang elegan dan fitur lengkap membuat undangan pernikahan kami terlihat profesional dan mudah digunakan.',
                'rating'        => 5,
                'display_order' => 4,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(
                ['name' => $testimonial['name'], 'event_type' => $testimonial['event_type']],
                array_merge($testimonial, [
                    'status'      => 'approved',
                    'is_featured' => true,
                    'approved_at' => now(),
                ]),
            );
        }
    }
}
