<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\PackageFeature;
use App\Models\Testimonial;
use App\Models\Theme;
use Illuminate\Support\Str;

class LandingPageService
{
    private const WHATSAPP_PLACEHOLDER = '+62 812-0000-0000';

    private const WHATSAPP_FALLBACK = '+6285778674418';

    /**
     * Order matters: tierBullets() takes the first 5 *enabled* entries, so
     * tier-differentiating features (premium+/exclusive-only) are listed
     * before the baseline features every tier already has — otherwise every
     * tier's bullet list would just show the same always-on basics.
     */
    private const FEATURE_LABELS = [
        'custom_domain'    => 'Domain undangan sendiri',
        'amplop_digital'   => 'Amplop digital / QRIS',
        'background_music' => 'Musik latar custom',
        'wa_reminders'     => 'Pengingat WhatsApp otomatis',
        'custom_branding'  => 'Branding kustom',
        'priority_support' => 'Dukungan pelanggan prioritas',
        'rsvp'             => 'RSVP digital tamu',
        'guestbook'        => 'Buku tamu digital',
        'countdown_timer'  => 'Hitung mundur acara',
        'maps_location'    => 'Peta lokasi & navigasi',
        'photo_gallery'    => 'Galeri foto & video',
    ];

    /**
     * Curated marketing feature list. Every entry cites a real `feature_key`
     * from database/seeders/PackageSeeder.php rather than an invented claim.
     *
     * @return array<int, array{key: string, icon: string, title: string, description: string}>
     */
    public function topFeatures(): array
    {
        return [
            ['key' => 'rsvp', 'icon' => 'Users', 'title' => 'RSVP Digital', 'description' => 'Konfirmasi kehadiran tamu secara online'],
            ['key' => 'guestbook', 'icon' => 'BookOpen', 'title' => 'Buku Tamu Digital', 'description' => 'Ucapan & doa tersimpan rapi'],
            ['key' => 'countdown_timer', 'icon' => 'Clock', 'title' => 'Hitung Mundur Acara', 'description' => 'Timer elegan menuju hari-H'],
            ['key' => 'maps_location', 'icon' => 'MapPin', 'title' => 'Peta Lokasi', 'description' => 'Google Maps & petunjuk arah'],
            ['key' => 'photo_gallery', 'icon' => 'Camera', 'title' => 'Galeri Foto', 'description' => 'Kenangan indah dalam galeri'],
            ['key' => 'background_music', 'icon' => 'Music', 'title' => 'Musik Latar', 'description' => 'Lagu favorit menemani undangan'],
            ['key' => 'social_share', 'icon' => 'Share2', 'title' => 'Bagikan Mudah', 'description' => 'Sebar ke WhatsApp & media sosial'],
            ['key' => 'live_stream', 'icon' => 'Video', 'title' => 'Live Streaming', 'description' => 'Untuk tamu yang berhalangan hadir'],
            ['key' => 'amplop_digital', 'icon' => 'Gift', 'title' => 'Amplop Digital', 'description' => 'Hadiah digital praktis via QRIS'],
            ['key' => 'custom_domain', 'icon' => 'Globe', 'title' => 'Domain Kustom', 'description' => 'Alamat undangan khusus milikmu'],
        ];
    }

    /**
     * Simplified 3-tier marketing preview built from the real 18-package
     * catalog (6 invitation types x 3 tiers). "pernikahan" is used as the
     * representative type for feature bullets since it's the flagship
     * use case; price_from is the true minimum across all types per tier.
     *
     * @return array<int, array{tier: string, label: string, price_from: int, is_popular: bool, features: array<int, string>}>
     */
    public function packageTiers(): array
    {
        $tierLabels = [
            'basic'     => 'Paket Dasar',
            'premium'   => 'Paket Premium',
            'exclusive' => 'Paket Eksklusif',
        ];

        $packages = Package::active()->with('features')->get();
        $result   = [];

        foreach ($tierLabels as $tier => $label) {
            $tierPackages = $packages->filter(fn (Package $p) => Str::afterLast($p->name, '_') === $tier);

            if ($tierPackages->isEmpty()) {
                continue;
            }

            $representative = $tierPackages->firstWhere('invitation_type', 'pernikahan') ?? $tierPackages->first();

            $result[] = [
                'tier'       => $tier,
                'label'      => $label,
                'price_from' => (int) $tierPackages->min(fn (Package $p) => (float) $p->price),
                'is_popular' => $tier === 'premium',
                'features'   => $this->tierBullets($representative),
            ];
        }

        return $result;
    }

    /** @return array<int, string> */
    private function tierBullets(Package $package): array
    {
        $bullets = collect(array_keys(self::FEATURE_LABELS))
            ->map(fn (string $key) => $package->features->firstWhere('feature_key', $key))
            ->filter(fn (?PackageFeature $feature) => $feature?->isEnabled())
            ->map(fn (PackageFeature $feature) => self::FEATURE_LABELS[$feature->feature_key])
            ->values()
            ->take(5)
            ->all();

        $bullets[] = $package->max_gallery_uploads > 0
            ? "Galeri hingga {$package->max_gallery_uploads} foto"
            : 'Galeri foto tanpa batas';
        $bullets[] = "Aktif {$package->duration_days} hari";

        return $bullets;
    }

    /**
     * Teaser grid for the showcase section — pulls real themes independently
     * by usage_count (Theme.event_type and Package.invitation_type are
     * different taxonomies, so we don't try to match a theme to a tier).
     *
     * @return array<int, array{id: int, name: string, category: string, event_type: string, thumbnail: ?string, color_primary: ?string, color_secondary: ?string, is_premium: bool, is_exclusive: bool}>
     */
    public function themeSamples(): array
    {
        return Theme::active()
            ->orderByDesc('usage_count')
            ->limit(6)
            ->get()
            ->map(fn (Theme $theme) => [
                'id'              => $theme->id,
                'name'            => $theme->name,
                'category'        => $theme->category,
                'event_type'      => $theme->event_type,
                'thumbnail'       => $theme->thumbnail_url,
                'color_primary'   => $theme->color_primary,
                'color_secondary' => $theme->color_secondary,
                'is_premium'      => $theme->is_premium,
                'is_exclusive'    => $theme->is_exclusive,
            ])
            ->all();
    }

    /**
     * @return array<int, array{id: int, name: string, event_type: ?string, content: string, rating: int, photo_url: ?string}>
     */
    public function testimonials(): array
    {
        return Testimonial::approved()
            ->featured()
            ->limit(6)
            ->get(['id', 'name', 'event_type', 'content', 'rating', 'photo_url'])
            ->map(fn (Testimonial $t) => [
                'id'         => $t->id,
                'name'       => $t->name,
                'event_type' => $t->event_type,
                'content'    => $t->content,
                'rating'     => $t->rating,
                'photo_url'  => $t->photo_url,
            ])
            ->all();
    }

    /** @return array{invitations_created: int, themes_available: int, event_types: int} */
    public function stats(): array
    {
        return [
            'invitations_created' => Invitation::where('status', '!=', 'draft')->count(),
            'themes_available'    => Theme::active()->count(),
            'event_types'         => Package::where('is_active', true)->pluck('invitation_type')->unique()->count(),
        ];
    }

    /** @return array{whatsapp: string, whatsapp_link: string, email: string, instagram: string, facebook: string} */
    public function contact(): array
    {
        $phone     = trim((string) AppSetting::get('company_phone', ''));
        $whatsapp  = ($phone === '' || $phone === self::WHATSAPP_PLACEHOLDER) ? self::WHATSAPP_FALLBACK : $phone;

        return [
            'whatsapp'      => $whatsapp,
            'whatsapp_link' => 'https://wa.me/'.preg_replace('/\D/', '', $whatsapp),
            'email'         => (string) AppSetting::get('company_email', 'halo@undesia.com'),
            'instagram'     => '@undesia.official',
            'facebook'      => 'UNDESIA Official',
        ];
    }
}
