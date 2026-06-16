<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvitationSeeder extends Seeder
{
    /**
     * Seed 1 sample invitation per event type for each customer.
     * Total: 5 customers × 6 types = 30 invitations.
     */
    public function run(): void
    {
        $customers = $this->getCustomers();

        if ($customers->isEmpty()) {
            $this->command->warn('Tidak ada customer ditemukan. Jalankan CustomerSeeder terlebih dahulu.');
            return;
        }

        $lookup = $this->buildLookup();
        [$created, $skipped] = $this->seedInvitations($customers, $lookup);

        $this->command->info("InvitationSeeder: {$created} undangan dibuat, {$skipped} dilewati (sudah ada).");
    }

    private function getCustomers()
    {
        return DB::table('users')
            ->whereIn('email', [
                'budi@example.com',
                'siti@example.com',
                'ahmad@example.com',
                'dewi@example.com',
                'rizky@example.com',
            ])
            ->pluck('id', 'email');
    }

    private function buildLookup(): array
    {
        return [
            'eventTypes' => DB::table('event_types')->pluck('id', 'name'),
            'packages'   => DB::table('packages')->pluck('id', 'name'),
            'themes'     => DB::table('themes')->pluck('id', 'slug'),
        ];
    }

    private function seedInvitations($customers, array $lookup): array
    {
        $created = 0;
        $skipped = 0;

        foreach ($customers as $email => $userId) {
            foreach ($this->typeConfig() as $typeSlug => $config) {
                $result = $this->seedOne($userId, $email, $typeSlug, $config, $lookup);
                $result === 'created' ? $created++ : $skipped++;
            }
        }

        return [$created, $skipped];
    }

    private function seedOne(int $userId, string $email, string $typeSlug, array $config, array $lookup): string
    {
        $eventTypeId = $lookup['eventTypes'][$typeSlug] ?? null;
        if (! $eventTypeId) {
            $this->command->warn("  Event type '{$typeSlug}' tidak ditemukan, skip.");
            return 'skipped';
        }

        $slug = Str::slug($config['title']) . '-' . Str::lower(explode('@', $email)[0]) . '-' . $typeSlug;

        if (DB::table('invitations')->where('slug', $slug)->exists()) {
            return 'skipped';
        }

        $packageId = $this->resolvePackageId($typeSlug, $config['package_name'], $lookup['packages']);
        $themeId   = $lookup['themes'][$config['theme_slug']] ?? null;

        $invitationId = $this->insertInvitation($userId, $eventTypeId, $packageId, $themeId, $slug, $config['title']);
        $this->insertSettings($invitationId);
        $this->insertEvents($invitationId, $config['events']);

        return 'created';
    }

    private function resolvePackageId(string $typeSlug, string $packageName, $packages): ?int
    {
        if ($packages->has($packageName)) {
            return $packages[$packageName];
        }

        return DB::table('packages')->where('invitation_type', $typeSlug)->value('id')
            ?? $packages->first();
    }

    private function insertInvitation(int $userId, int $eventTypeId, ?int $packageId, ?int $themeId, string $slug, string $title): int
    {
        return DB::table('invitations')->insertGetId([
            'user_id'              => $userId,
            'event_type_id'        => $eventTypeId,
            'package_id'           => $packageId,
            'theme_id'             => $themeId,
            'slug'                 => $slug,
            'invitation_code'      => strtoupper(Str::random(8)),
            'title'                => $title,
            'status'               => 'draft',
            'is_public'            => false,
            'requires_password'    => false,
            'allow_guest_comments' => true,
            'allow_guest_plus_one' => true,
            'max_guests_plus_one'  => 1,
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);
    }

    private function insertSettings(int $invitationId): void
    {
        DB::table('invitation_settings')->insert([
            'invitation_id'             => $invitationId,
            'feature_rsvp'              => true,
            'feature_gift_wishlist'     => false,
            'feature_gender_poll'       => false,
            'feature_live_stream'       => false,
            'feature_interactive_games' => false,
            'feature_dress_code'        => false,
            'feature_amplop_digital'    => false,
            'feature_instagram_filter'  => false,
            'feature_analytics'         => false,
            'feature_page_builder'      => false,
            'feature_custom_domain'     => false,
            'countdown_label'           => 'Hitung Mundur',
            'show_guest_count'          => true,
            'greeting_title'            => 'Kepada Yth.',
            'greeting_guest_label'      => 'Tamu Undangan',
            'greeting_button_text'      => 'Buka Undangan',
            'music_enabled'             => false,
            'music_autoplay'            => true,
            'music_loop'                => true,
            'created_at'                => now(),
            'updated_at'                => now(),
        ]);
    }

    private function insertEvents(int $invitationId, array $events): void
    {
        foreach ($events as $order => $event) {
            DB::table('invitation_events')->insert([
                'invitation_id' => $invitationId,
                'event_name'    => $event['name'],
                'event_date'    => $event['date'],
                'event_time'    => $event['time'],
                'display_order' => $order,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }

    private function typeConfig(): array
    {
        return [
            'wedding' => [
                'title'        => 'Undangan Pernikahan',
                'package_name' => 'pernikahan_basic',
                'theme_slug'   => 'blossom-garden',
                'events'       => [
                    ['name' => 'Akad Nikah', 'date' => '2026-09-20', 'time' => '08:00:00'],
                    ['name' => 'Resepsi',    'date' => '2026-09-20', 'time' => '11:00:00'],
                ],
            ],
            'birthday' => [
                'title'        => 'Undangan Ulang Tahun',
                'package_name' => 'ulang_tahun_basic',
                'theme_slug'   => 'starry-night',
                'events'       => [
                    ['name' => 'Pesta Ulang Tahun', 'date' => '2026-08-10', 'time' => '16:00:00'],
                ],
            ],
            'khitanan' => [
                'title'        => 'Undangan Khitanan',
                'package_name' => 'khitanan_basic',
                'theme_slug'   => 'sky-blue-junior',
                'events'       => [
                    ['name' => 'Acara Khitanan', 'date' => '2026-07-15', 'time' => '09:00:00'],
                ],
            ],
            'aqiqah' => [
                'title'        => 'Undangan Aqiqah',
                'package_name' => 'aqiqah_basic',
                'theme_slug'   => 'baby-bloom',
                'events'       => [
                    ['name' => 'Acara Aqiqah', 'date' => '2026-07-05', 'time' => '10:00:00'],
                ],
            ],
            'gender_reveal' => [
                'title'        => 'Undangan Gender Reveal',
                'package_name' => 'gender_reveal_basic',
                'theme_slug'   => 'pink-or-blue',
                'events'       => [
                    ['name' => 'Gender Reveal Party', 'date' => '2026-08-25', 'time' => '14:00:00'],
                ],
            ],
            'syukuran' => [
                'title'        => 'Undangan Syukuran',
                'package_name' => 'syukuran_basic',
                'theme_slug'   => 'warm-gathering',
                'events'       => [
                    ['name' => 'Acara Syukuran', 'date' => '2026-07-30', 'time' => '09:00:00'],
                ],
            ],
        ];
    }
}
