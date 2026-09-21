<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * PackageSeeder
 *
 * Membuat 18 paket: 3 tier (basic, premium, exclusive) × 6 jenis undangan.
 * Setiap jenis memiliki fitur yang disesuaikan dengan kebutuhan acara tersebut.
 *
 * Jenis undangan:
 *   pernikahan | ulang_tahun | khitanan | aqiqah | gender_reveal | syukuran
 *
 * Tier:
 *   basic (Mulai)  → fitur dasar, harga terjangkau
 *   premium        → fitur lengkap, paling populer
 *   exclusive      → semua fitur, untuk acara prestisius
 */
class PackageSeeder extends Seeder
{
    // ─── Tier defaults ────────────────────────────────────────────────────────

    private array $tierDefaults = [
        'basic' => [
            'billing_period'      => 'once',
            'duration_days'       => 4,
            'trial_days'          => 3,
            'max_gallery_uploads' => 5,
            'display_order_offset' => 1,
        ],
        'premium' => [
            'billing_period'      => 'once',
            'duration_days'       => 180,
            'trial_days'          => 7,
            'max_gallery_uploads' => 10,
            'display_order_offset' => 2,
        ],
        'exclusive' => [
            'billing_period'      => 'once',
            'duration_days'       => 365,
            'trial_days'          => 14,
            'max_gallery_uploads' => 50,
            'display_order_offset' => 3,
        ],
    ];

    // ─── Harga per jenis per tier: [harga jual, harga coret] ──────────────────
    // Paket basic (Mulai) tetap gratis (Rp 0) tetapi tetap memiliki harga coret.

    private array $pricing = [
        'pernikahan'    => ['basic' => [0, 49000], 'premium' => [79000, 149000], 'exclusive' => [149000, 299000]],
        'ulang_tahun'   => ['basic' => [0, 29000], 'premium' => [49000, 99000],  'exclusive' => [99000, 199000]],
        'khitanan'      => ['basic' => [0, 35000], 'premium' => [59000, 119000], 'exclusive' => [119000, 229000]],
        'aqiqah'        => ['basic' => [0, 35000], 'premium' => [65000, 129000], 'exclusive' => [125000, 249000]],
        'gender_reveal' => ['basic' => [0, 25000], 'premium' => [45000, 89000],  'exclusive' => [89000, 179000]],
        'syukuran'      => ['basic' => [0, 29000], 'premium' => [55000, 109000], 'exclusive' => [109000, 219000]],
    ];

    // ─── Label & deskripsi per jenis per tier ─────────────────────────────────

    private array $meta = [
        'pernikahan' => [
            'basic' => [
                'label'       => 'Pernikahan Mulai',
                'description' => 'Paket terjangkau untuk undangan pernikahan digital. Tampilan elegan, RSVP lengkap, dan buku tamu. Cocok untuk pernikahan sederhana namun tetap berkesan.',
            ],
            'premium' => [
                'label'       => 'Pernikahan Premium',
                'description' => 'Paket terlengkap untuk hari spesial pernikahan Anda. Amplop digital, live streaming, dress code, dan WhatsApp reminder untuk tamu undangan.',
            ],
            'exclusive' => [
                'label'       => 'Pernikahan Eksklusif',
                'description' => 'Pengalaman undangan pernikahan paling mewah. Instagram Filter AR, custom domain, page builder penuh, dan account manager dedicated untuk pernikahan impian Anda.',
            ],
        ],
        'ulang_tahun' => [
            'basic' => [
                'label'       => 'Ulang Tahun Mulai',
                'description' => 'Undangan pesta ulang tahun yang menyenangkan dan terjangkau. Template cerah, RSVP digital, dan countdown hari H.',
            ],
            'premium' => [
                'label'       => 'Ulang Tahun Premium',
                'description' => 'Rayakan ulang tahun dengan gaya! Mini games interaktif, wish list hadiah, dress code tema, dan WhatsApp blast untuk semua tamu.',
            ],
            'exclusive' => [
                'label'       => 'Ulang Tahun Eksklusif',
                'description' => 'Pesta ulang tahun tak terlupakan dengan live streaming, Instagram Filter AR khusus, custom domain, dan semua fitur premium tanpa batas.',
            ],
        ],
        'khitanan' => [
            'basic' => [
                'label'       => 'Khitanan Mulai',
                'description' => 'Undangan khitanan/sunatan yang sederhana dan bermartabat. Fitur RSVP, galeri foto, dan Google Maps untuk kemudahan tamu.',
            ],
            'premium' => [
                'label'       => 'Khitanan Premium',
                'description' => 'Undangan khitanan lengkap dengan amplop digital, dress code, WhatsApp reminder, dan halaman undangan yang bisa diproteksi password.',
            ],
            'exclusive' => [
                'label'       => 'Khitanan Eksklusif',
                'description' => 'Undangan khitanan prestisius dengan live streaming, custom domain, page builder penuh, dan layanan account manager dedicated.',
            ],
        ],
        'aqiqah' => [
            'basic' => [
                'label'       => 'Aqiqah Mulai',
                'description' => 'Undangan syukuran aqiqah yang hangat dan personal. RSVP digital, galeri foto momen berharga, dan countdown acara.',
            ],
            'premium' => [
                'label'       => 'Aqiqah Premium',
                'description' => 'Bagikan kebahagiaan aqiqah dengan amplop digital, gender poll bayi, dress code, dan WhatsApp reminder untuk semua tamu.',
            ],
            'exclusive' => [
                'label'       => 'Aqiqah Eksklusif',
                'description' => 'Perayaan aqiqah lengkap dengan live streaming, Instagram Filter AR, custom domain, galeri tak terbatas, dan semua fitur premium.',
            ],
        ],
        'gender_reveal' => [
            'basic' => [
                'label'       => 'Gender Reveal Mulai',
                'description' => 'Undangan gender reveal seru dengan voting prediksi jenis kelamin bayi, mini games tebak-tebakan, dan countdown momen pengungkapan.',
            ],
            'premium' => [
                'label'       => 'Gender Reveal Premium',
                'description' => 'Pesta gender reveal interaktif dengan live streaming, games seru, amplop digital, dress code tema biru/pink, dan hasil voting real-time.',
            ],
            'exclusive' => [
                'label'       => 'Gender Reveal Eksklusif',
                'description' => 'Pengalaman gender reveal paling seru! Instagram Filter AR khusus, live streaming HD, custom domain, page builder penuh, dan semua fitur interaktif.',
            ],
        ],
        'syukuran' => [
            'basic' => [
                'label'       => 'Syukuran Mulai',
                'description' => 'Undangan acara syukuran dan selamatan yang hangat. RSVP digital, lokasi Google Maps, galeri foto, dan informasi acara lengkap.',
            ],
            'premium' => [
                'label'       => 'Syukuran Premium',
                'description' => 'Undangan syukuran dengan amplop digital, dress code, WhatsApp blast tamu, halaman terproteksi password, dan analytics kunjungan.',
            ],
            'exclusive' => [
                'label'       => 'Syukuran Eksklusif',
                'description' => 'Selamatan prestisius dengan live streaming, custom domain, page builder penuh, email marketing, dan account manager dedicated.',
            ],
        ],
    ];

    // ─── Fitur dasar per tier (berlaku semua jenis) ───────────────────────────

    private array $baseFeatures = [
        'basic' => [
            // Desain & Tema
            ['feature_key' => 'themes',                'feature_type' => 'level',   'feature_value' => 'basic'],
            ['feature_key' => 'theme_change_unlimited', 'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'page_builder',          'feature_type' => 'level',   'feature_value' => 'basic'],
            ['feature_key' => 'background_music',      'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'custom_css',            'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'custom_branding',       'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Domain & Akses
            ['feature_key' => 'custom_domain',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'page_password',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'multi_event',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'unlimited_edits',       'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Tamu & RSVP
            ['feature_key' => 'rsvp',                  'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'guestbook',             'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'send_invitation',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'import_guests',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'export_guests',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Konten & Media
            ['feature_key' => 'photo_gallery',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'video_gallery',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'countdown_timer',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'love_story',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'maps_location',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Konten Interaktif
            ['feature_key' => 'live_stream',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'social_share',          'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'gender_poll',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'interactive_games',     'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'dress_code',            'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'instagram_filter',      'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Komunikasi
            ['feature_key' => 'wa_reminders',          'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'email_marketing',       'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Gift & Pembayaran
            ['feature_key' => 'amplop_digital',        'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'gift_wishlist',         'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Analytics & Support
            ['feature_key' => 'analytics',             'feature_type' => 'level',   'feature_value' => 'basic'],
            ['feature_key' => 'api_access',            'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'priority_support',      'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'account_manager',       'feature_type' => 'boolean', 'feature_value' => 'false'],
        ],
        'premium' => [
            // Desain & Tema
            ['feature_key' => 'themes',                'feature_type' => 'level',   'feature_value' => 'extended'],
            ['feature_key' => 'theme_change_unlimited', 'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'page_builder',          'feature_type' => 'level',   'feature_value' => 'intermediate'],
            ['feature_key' => 'background_music',      'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'custom_css',            'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'custom_branding',       'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Domain & Akses
            ['feature_key' => 'custom_domain',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'page_password',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'multi_event',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'unlimited_edits',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Tamu & RSVP
            ['feature_key' => 'rsvp',                  'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'guestbook',             'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'send_invitation',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'import_guests',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'export_guests',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Konten & Media
            ['feature_key' => 'photo_gallery',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'video_gallery',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'countdown_timer',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'love_story',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'maps_location',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Konten Interaktif
            ['feature_key' => 'live_stream',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'social_share',          'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'gender_poll',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'interactive_games',     'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'dress_code',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'instagram_filter',      'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Komunikasi
            ['feature_key' => 'wa_reminders',          'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'email_marketing',       'feature_type' => 'boolean', 'feature_value' => 'false'],
            // Gift & Pembayaran
            ['feature_key' => 'amplop_digital',        'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'gift_wishlist',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Analytics & Support
            ['feature_key' => 'analytics',             'feature_type' => 'level',   'feature_value' => 'intermediate'],
            ['feature_key' => 'api_access',            'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'priority_support',      'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'account_manager',       'feature_type' => 'boolean', 'feature_value' => 'false'],
        ],
        'exclusive' => [
            // Desain & Tema
            ['feature_key' => 'themes',                'feature_type' => 'level',   'feature_value' => 'full'],
            ['feature_key' => 'theme_change_unlimited', 'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'page_builder',          'feature_type' => 'level',   'feature_value' => 'full'],
            ['feature_key' => 'background_music',      'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'custom_css',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'custom_branding',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Domain & Akses
            ['feature_key' => 'custom_domain',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'page_password',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'multi_event',           'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'unlimited_edits',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Tamu & RSVP
            ['feature_key' => 'rsvp',                  'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'guestbook',             'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'send_invitation',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'import_guests',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'export_guests',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Konten & Media
            ['feature_key' => 'photo_gallery',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'video_gallery',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'countdown_timer',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'love_story',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'maps_location',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Konten Interaktif
            ['feature_key' => 'live_stream',           'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'social_share',          'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'gender_poll',           'feature_type' => 'boolean', 'feature_value' => 'false'],
            ['feature_key' => 'interactive_games',     'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'dress_code',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'instagram_filter',      'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Komunikasi
            ['feature_key' => 'wa_reminders',          'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'email_marketing',       'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Gift & Pembayaran
            ['feature_key' => 'amplop_digital',        'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'gift_wishlist',         'feature_type' => 'boolean', 'feature_value' => 'true'],
            // Analytics & Support
            ['feature_key' => 'analytics',             'feature_type' => 'level',   'feature_value' => 'full'],
            ['feature_key' => 'api_access',            'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'priority_support',      'feature_type' => 'boolean', 'feature_value' => 'true'],
            ['feature_key' => 'account_manager',       'feature_type' => 'boolean', 'feature_value' => 'true'],
        ],
    ];

    /**
     * Override fitur khusus per jenis undangan.
     * Hanya definisikan yang berbeda dari base tier di atas.
     * Format: ['feature_key' => 'value']
     */
    private array $typeOverrides = [
        // Pernikahan: fokus pada romantis, dress code, live streaming, no gender poll
        'pernikahan' => [
            'basic'     => [],
            'premium'   => ['live_stream' => 'true', 'interactive_games' => 'true'],
            'exclusive' => [],
        ],

        // Ulang Tahun: games wajib, live streaming, no gender poll
        'ulang_tahun' => [
            'basic'     => [],
            'premium'   => ['interactive_games' => 'true'],
            'exclusive' => [],
        ],

        // Khitanan: simpel, tidak butuh gender_poll / games interaktif
        'khitanan' => [
            'basic'     => [],
            'premium'   => [],
            'exclusive' => ['interactive_games' => 'false'],
        ],

        // Aqiqah: gender poll relevan (sering diumumkan jenis kelamin bayi)
        'aqiqah' => [
            'basic'     => [],
            'premium'   => ['gender_poll' => 'true'],
            'exclusive' => ['gender_poll' => 'true', 'interactive_games' => 'false'],
        ],

        // Gender Reveal: gender_poll & interactive_games adalah FITUR UTAMA, tersedia dari basic
        'gender_reveal' => [
            'basic'     => ['gender_poll' => 'true', 'interactive_games' => 'true'],
            'premium'   => ['gender_poll' => 'true', 'interactive_games' => 'true', 'live_stream' => 'true'],
            'exclusive' => ['gender_poll' => 'true'],
        ],

        // Syukuran: sederhana, tidak butuh games / gender poll
        'syukuran' => [
            'basic'     => [],
            'premium'   => [],
            'exclusive' => ['interactive_games' => 'false', 'gender_poll' => 'false'],
        ],
    ];

    // ─── run ──────────────────────────────────────────────────────────────────

    public function run(): void
    {
        $invitationTypes = [
            'pernikahan',
            'ulang_tahun',
            'khitanan',
            'aqiqah',
            'gender_reveal',
            'syukuran',
        ];

        $tiers        = ['basic', 'premium', 'exclusive'];
        $displayOrder = 0;

        foreach ($invitationTypes as $typeIdx => $type) {
            foreach ($tiers as $tier) {
                $displayOrder++;
                $name = "{$type}_{$tier}";

                // Build package row
                $pkg = array_merge(
                    [
                        'name'            => $name,
                        'invitation_type' => $type,
                        'label'           => $this->meta[$type][$tier]['label'],
                        'description'     => $this->meta[$type][$tier]['description'],
                        'price'           => $this->pricing[$type][$tier][0],
                        'original_price'  => $this->pricing[$type][$tier][1],
                        'currency'        => 'IDR',
                        'is_active'       => true,
                        'display_order'   => $displayOrder,
                    ],
                    [
                        'billing_period'      => $this->tierDefaults[$tier]['billing_period'],
                        'duration_days'       => $this->tierDefaults[$tier]['duration_days'],
                        'trial_days'          => $this->tierDefaults[$tier]['trial_days'],
                        'max_gallery_uploads' => $this->tierDefaults[$tier]['max_gallery_uploads'],
                    ],
                );

                // Upsert package
                DB::table('packages')->updateOrInsert(
                    ['name' => $name],
                    array_merge($pkg, ['updated_at' => now(), 'created_at' => now()]),
                );

                $packageId = DB::table('packages')->where('name', $name)->value('id');

                // Build feature list = base tier + type overrides
                $features = $this->buildFeatures($tier, $type);

                foreach ($features as $feature) {
                    DB::table('package_features')->updateOrInsert(
                        ['package_id' => $packageId, 'feature_key' => $feature['feature_key']],
                        array_merge($feature, [
                            'package_id' => $packageId,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]),
                    );
                }

                $this->command->line("  ✓ {$name} ({$this->meta[$type][$tier]['label']}) — " . count($features) . ' fitur');
            }
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function buildFeatures(string $tier, string $type): array
    {
        // Start from base tier features (keyed by feature_key for easy override)
        $features = [];
        foreach ($this->baseFeatures[$tier] as $f) {
            $features[$f['feature_key']] = $f;
        }

        // Apply type-specific overrides
        $overrides = $this->typeOverrides[$type][$tier] ?? [];
        foreach ($overrides as $key => $value) {
            if (isset($features[$key])) {
                $features[$key]['feature_value'] = $value;
            }
        }

        return array_values($features);
    }
}
