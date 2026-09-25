<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\PackageFeature;
use App\Models\Testimonial;
use App\Models\Theme;
use App\Support\WhatsAppLink;
use Illuminate\Support\Str;

class LandingPageService
{
    private const WHATSAPP_PLACEHOLDER = '+62 812-0000-0000';

    private const WHATSAPP_FALLBACK = '+6285778674418';

    /**
     * event_types.label is inconsistently cased in the seed data ("Pernikahan"
     * vs "ulang_tahun") because it doubles as the matching key against
     * packages.invitation_type — it's not fit to show to a visitor as-is, so
     * tab titles use this curated display name instead, keyed by the
     * always-consistent event_types.name.
     */
    private const EVENT_TYPE_DISPLAY_LABELS = [
        'wedding'       => 'Pernikahan',
        'birthday'      => 'Ulang Tahun',
        'khitanan'      => 'Khitanan',
        'aqiqah'        => 'Aqiqah',
        'gender_reveal' => 'Gender Reveal',
        'syukuran'      => 'Syukuran',
    ];

    private const TIER_LABELS = [
        'basic'     => 'Paket Dasar',
        'premium'   => 'Paket Premium',
        'exclusive' => 'Paket Eksklusif',
    ];

    private const TIER_ORDER = [
        'basic'     => 0,
        'premium'   => 1,
        'exclusive' => 2,
    ];

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
     * Real per-type package catalog, grouped by invitation type, for the
     * landing page's "jenis undangan" tabs — unlike packageTiers() (one
     * aggregated card per tier, price/features borrowed from a
     * representative package), each package here is its own real row: its
     * own price, its own features, and a real package_id the "Pilih Paket"
     * CTA can carry straight into the wizard.
     *
     * @return array<int, array{event_type: string, label: string, packages: array<int, array{id: int, tier: string, tier_label: string, label: string, price: int, is_popular: bool, features: array<int, string>}>}>
     */
    public function packagesByType(): array
    {
        $eventTypes = EventType::active()->orderBy('id')->get(['id', 'name', 'label']);
        $packages = Package::active()->with('features')->get();

        return $eventTypes
            ->map(function (EventType $eventType) use ($packages) {
                $typePackages = $packages
                    ->filter(fn (Package $p) => $p->invitation_type === $eventType->invitationType())
                    ->sortBy(fn (Package $p) => self::TIER_ORDER[Str::afterLast($p->name, '_')] ?? 99)
                    ->values();

                return [
                    'event_type' => $eventType->name,
                    'label'      => self::EVENT_TYPE_DISPLAY_LABELS[$eventType->name] ?? $eventType->label,
                    'packages'   => $typePackages->map(function (Package $p) {
                        $tier = Str::afterLast($p->name, '_');

                        return [
                            'id'         => $p->id,
                            'tier'       => $tier,
                            'tier_label' => self::TIER_LABELS[$tier] ?? $p->label,
                            'label'      => $p->label,
                            'price'      => (int) $p->price,
                            'original_price' => $p->original_price !== null && (float) $p->original_price > (float) $p->price
                                ? (int) $p->original_price
                                : null,
                            'is_popular' => $tier === 'premium',
                            'features'   => $this->tierBullets($p),
                        ];
                    })->all(),
                ];
            })
            ->filter(fn (array $group) => count($group['packages']) > 0)
            ->values()
            ->all();
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
     * Teaser grid for the showcase section — pulls real themes in the
     * admin-defined order (Theme::ordered(): each invitation type's top picks
     * first). Theme.event_type and Package.invitation_type are different
     * taxonomies, so we don't try to match a theme to a tier.
     *
     * @return array<int, array{id: int, name: string, category: string, event_type: string, thumbnail: ?string, color_primary: ?string, color_secondary: ?string, is_premium: bool, is_exclusive: bool, sample_url: ?string}>
     */
    public function themeSamples(): array
    {
        return Theme::active()
            ->withExists('sampleInvitation')
            ->ordered()
            ->limit(6)
            ->get()
            ->map(fn (Theme $theme) => [
                'id'              => $theme->id,
                'name'            => $theme->name,
                'slug'            => $theme->slug,
                'category'        => $theme->category,
                'event_type'      => $theme->event_type,
                'thumbnail'       => $theme->thumbnail_url,
                'color_primary'   => $theme->color_primary,
                'color_secondary' => $theme->color_secondary,
                'is_premium'      => $theme->is_premium,
                'is_exclusive'    => $theme->is_exclusive,
                'sample_url'      => $theme->sampleUrl($theme->sample_invitation_exists),
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
            'invitations_created' => Invitation::notSample()->where('status', '!=', 'draft')->count(),
            'themes_available'    => Theme::active()->count(),
            'event_types'         => Package::where('is_active', true)->pluck('invitation_type')->unique()->count(),
        ];
    }

    /** @return array{whatsapp: string, whatsapp_link: string, email: string, instagram: string, facebook: string} */
    public function contact(): array
    {
        return [
            'whatsapp'      => self::adminWhatsappNumber(),
            'whatsapp_link' => WhatsAppLink::build(self::adminWhatsappNumber()),
            'email'         => (string) AppSetting::get('company_email', 'halo@undesia.com'),
            'instagram'     => '@undesia.official',
            'facebook'      => 'UNDESIA Official',
        ];
    }

    /**
     * The single source of truth for the admin's WhatsApp contact number,
     * so no other part of the app hardcodes it. Falls back to a working
     * number whenever the setting is empty or still the CMS placeholder.
     */
    public static function adminWhatsappNumber(): string
    {
        $phone = trim((string) AppSetting::get('company_phone', ''));

        return ($phone === '' || $phone === self::WHATSAPP_PLACEHOLDER) ? self::WHATSAPP_FALLBACK : $phone;
    }
}
