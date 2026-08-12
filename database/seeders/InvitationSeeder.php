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
            'packages'   => DB::table('packages')->get(['id', 'name', 'invitation_type', 'price', 'duration_days'])->keyBy('name'),
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

        $package = $this->resolvePackage($typeSlug, $config['package_name'], $lookup['packages']);
        $themeId = $lookup['themes'][$config['theme_slug']] ?? null;

        // One demo invitation per customer (syukuran) is left unpaid so the
        // "menunggu konfirmasi" admin views have something real to show.
        $isPaid = $typeSlug !== 'syukuran';

        $invitationId = $this->insertInvitation($userId, $eventTypeId, $package, $themeId, $slug, $config['title'], $isPaid);
        $this->insertSettings($invitationId);
        $this->insertEvents($invitationId, $config['events']);
        $transactionId = $this->insertTransaction($userId, $invitationId, $package, $isPaid);
        $this->insertPayment($transactionId, $package, $isPaid);

        return 'created';
    }

    private function resolvePackage(string $typeSlug, string $packageName, $packages): ?object
    {
        if ($packages->has($packageName)) {
            return $packages[$packageName];
        }

        return DB::table('packages')->where('invitation_type', $typeSlug)->first()
            ?? $packages->first();
    }

    private function insertInvitation(int $userId, int $eventTypeId, ?object $package, ?int $themeId, string $slug, string $title, bool $isPaid): int
    {
        $now          = now();
        $durationDays = $package->duration_days ?? 90;

        return DB::table('invitations')->insertGetId([
            'user_id'              => $userId,
            'event_type_id'        => $eventTypeId,
            'package_id'           => $package->id ?? null,
            'theme_id'             => $themeId,
            'slug'                 => $slug,
            'invitation_code'      => strtoupper(Str::random(8)),
            'title'                => $title,
            'status'               => $isPaid ? 'active' : 'draft',
            'is_public'            => false,
            'requires_password'    => false,
            'allow_guest_comments' => true,
            'allow_guest_plus_one' => true,
            'max_guests_plus_one'  => 1,
            'activated_at'         => $isPaid ? $now : null,
            'expires_at'           => $isPaid ? $now->copy()->addDays($durationDays) : null,
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);
    }

    /**
     * Paid invitations become 'active' via the same transaction+payment pair
     * that Admin/TransactionController and Customer/PaymentController use to
     * activate one for real. Unpaid ones stay 'pending' so the admin
     * "menunggu konfirmasi" views have real data instead of an empty state.
     */
    private function insertTransaction(int $userId, int $invitationId, ?object $package, bool $isPaid): int
    {
        $now = now();

        return DB::table('transactions')->insertGetId([
            'user_id'          => $userId,
            'invitation_id'    => $invitationId,
            'package_id'       => $package->id ?? null,
            'invoice_number'   => 'INV-'.$now->format('Ymd').'-'.$userId.'-'.strtoupper(Str::random(6)),
            'invoice_amount'   => $package->price ?? 0,
            'invoice_currency' => 'IDR',
            'status'           => $isPaid ? 'paid' : 'pending',
            'due_date'         => $isPaid ? $now->toDateString() : $now->copy()->addDay()->toDateString(),
            'paid_at'          => $isPaid ? $now : null,
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);
    }

    /**
     * Matching gateway payment for the transaction above, so the admin
     * "Pembayaran Masuk" page has real rows instead of an empty state.
     */
    private function insertPayment(int $transactionId, ?object $package, bool $isPaid): void
    {
        $now = now();

        DB::table('payments')->insert([
            'transaction_id'       => $transactionId,
            'payment_gateway'      => 'xendit',
            'gateway_reference_id' => 'xnd-'.Str::uuid(),
            'gateway_order_id'     => $isPaid ? null : 'https://checkout.xendit.co/web/demo-'.Str::lower(Str::random(10)),
            'amount'               => $package->price ?? 0,
            'fee'                  => 0,
            'currency'             => 'IDR',
            'status'               => $isPaid ? 'success' : 'pending',
            'webhook_received_at'  => $isPaid ? $now : null,
            'webhook_verified_at'  => $isPaid ? $now : null,
            'created_at'           => $now,
            'updated_at'           => $now,
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
