<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\DigitalWallet;
use App\Models\EventType;
use App\Models\GalleryPhoto;
use App\Models\GiftWishlistItem;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\InvitationContent;
use App\Models\InvitationEvent;
use App\Models\InvitationSetting;
use App\Models\Package;
use App\Models\Story;
use App\Models\Theme;
use App\Models\User;
use Database\Seeders\Data\SampleInvitationData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * One complete demo invitation per renderable theme, used by the
 * "Lihat Contoh" / theme preview buttons (route themes.sample).
 *
 * - Themes come from the themes table; a theme is seeded when it has a React
 *   renderer (Theme::rendererSlugs()) filed under the same invitation type.
 * - Samples are marked is_sample = true, owned by a dedicated inactive system
 *   account, and keyed by theme_id, so re-running never duplicates them and
 *   never touches customer invitations.
 * - Each run rewrites the sample's child rows (contents, events, gallery…)
 *   from SampleInvitationData, so the demo always reflects the latest data.
 */
class SampleInvitationSeeder extends Seeder
{
    private const OWNER_EMAIL = 'samples@undesia.id';

    /** Source assets (committed) → public disk directory they're published to. */
    private const ASSET_SOURCE = 'seeders/assets/sample-invitations';
    private const ASSET_DIR = 'sample-invitations';

    private const GALLERY_SIZE = 8;

    /** @var array<string, array<string, array<int, string>>> type → pool → public-disk paths */
    private array $pools = [];

    public function run(): void
    {
        $this->publishAssets();

        $owner      = $this->owner();
        $renderers  = Theme::rendererSlugs();
        $eventTypes = EventType::pluck('id', 'name');
        $today      = Carbon::today();

        $seededThemeIds = [];
        $counts = [];
        $skipped = [];
        $variants = [];

        foreach (Theme::query()->orderBy('event_type')->ordered()->get() as $theme) {
            $type = $theme->event_type;

            if (! isset($renderers[$theme->slug])) {
                $skipped[$type][] = $theme->slug;
                continue;
            }

            if ($renderers[$theme->slug] !== $type) {
                $this->command?->warn("  {$theme->slug}: renderer ada di folder '{$renderers[$theme->slug]}' tetapi tema bertipe '{$type}', dilewati.");
                $skipped[$type][] = $theme->slug;
                continue;
            }

            if (! isset($eventTypes[$type])) {
                $this->command?->warn("  {$theme->slug}: event type '{$type}' tidak ditemukan, dilewati.");
                continue;
            }

            $package = $this->package($type);
            if (! $package) {
                $this->command?->warn("  {$theme->slug}: tidak ada paket untuk '{$type}', dilewati.");
                continue;
            }

            $variant = $variants[$type] = ($variants[$type] ?? -1) + 1;
            $globalIndex = count($seededThemeIds);

            $seeded = DB::transaction(fn () => $this->seedSample(
                $theme, $owner, (int) $eventTypes[$type], $package, $variant, $globalIndex, $today,
            ));

            if ($seeded) {
                $seededThemeIds[] = $theme->id;
                $counts[$type] = ($counts[$type] ?? 0) + 1;
            }
        }

        $this->pruneStaleSamples($owner, $seededThemeIds);
        $this->report($counts, $skipped);
    }

    // ─── One sample ──────────────────────────────────────────────────────────

    private function seedSample(Theme $theme, User $owner, int $eventTypeId, Package $package, int $variant, int $globalIndex, Carbon $today): bool
    {
        $type = $theme->event_type;
        $data = SampleInvitationData::build($type, $variant, $today);
        $slug = 'contoh-'.Str::slug(str_replace('_', '-', $theme->slug));

        // Never take over a customer's slug/code.
        $clash = Invitation::withTrashed()
            ->where('is_sample', false)
            ->where(fn ($q) => $q->where('slug', $slug)->orWhere('invitation_code', $slug))
            ->exists();
        if ($clash) {
            $this->command?->warn("  {$theme->slug}: slug '{$slug}' sudah dipakai undangan customer, dilewati.");

            return false;
        }

        $invitation = Invitation::withTrashed()->firstOrNew(['theme_id' => $theme->id, 'is_sample' => true]);
        $invitation->fill([
            'user_id'              => $owner->id,
            'event_type_id'        => $eventTypeId,
            'package_id'           => $package->id,
            'slug'                 => $slug,
            'invitation_code'      => $slug,
            'title'                => app(\App\Services\InvitationSlugService::class)->resolveTitle($type, $data['fields'], 'Contoh Undangan'),
            'description'          => "Contoh undangan untuk tema {$theme->name}.",
            'status'               => 'active',
            'is_public'            => true,
            'requires_password'    => false,
            'activated_at'         => $invitation->activated_at ?? now(),
            'expires_at'           => null,
            'allow_guest_comments' => true,
            'allow_guest_plus_one' => true,
            'max_guests_plus_one'  => 2,
            'groom_child_order'    => $data['child_order']['groom'],
            'bride_child_order'    => $data['child_order']['bride'],
        ]);
        $invitation->deleted_at = null;
        $invitation->save();

        $this->resetChildren($invitation);

        $photos = $this->photoPicker($type, $variant);

        $this->seedSettings($invitation, $data);
        $this->seedContents($invitation, $data, $photos);
        $this->seedEvents($invitation, $data['events']);
        $this->seedGallery($invitation, $photos);
        $this->seedStories($invitation, $data['stories'], $photos);
        $this->seedGuestsAndWishes($invitation, $data['wishes'], $globalIndex);
        $this->seedWishlist($invitation, $data['wishlist']);
        $this->seedWallet($invitation, $owner, $data['wallet'], $globalIndex);

        return true;
    }

    /** Child rows are fully regenerated each run (only ever for is_sample rows). */
    private function resetChildren(Invitation $invitation): void
    {
        $invitation->contents()->delete();
        $invitation->events()->delete();
        $invitation->galleryPhotos()->delete();
        $invitation->stories()->delete();
        $invitation->comments()->delete();
        $invitation->guests()->delete();
        $invitation->giftWishlistItems()->delete();
        $invitation->digitalWallets()->detach();
    }

    private function seedSettings(Invitation $invitation, array $data): void
    {
        // Every feature key the editor exposes (INVITATION_FEATURES in edit.tsx)
        // switched on, so the preview shows everything a theme can render.
        $features = array_fill_keys([
            'cover', 'greeting', 'couple_profile', 'event_detail', 'countdown', 'location',
            'gallery', 'love_story', 'rsvp', 'guestbook', 'wishes',
            'digital_envelope', 'gift_wishlist', 'add_to_calendar', 'music', 'confetti', 'footer',
        ], true);
        // No stable, license-safe video to embed; keep the section hidden.
        $features['video'] = false;

        InvitationSetting::updateOrCreate(['invitation_id' => $invitation->id], [
            'feature_rsvp'           => true,
            'feature_gift_wishlist'  => ! empty($data['wishlist']),
            'feature_amplop_digital' => true,
            'feature_gender_poll'    => $invitation->eventType?->name === 'gender_reveal',
            'countdown_label'        => $data['countdown_label'],
            'show_guest_count'       => true,
            'greeting_title'         => 'Kepada Yth. Bapak/Ibu/Saudara/i',
            'greeting_message'       => $data['greeting'],
            'greeting_guest_label'   => 'Tamu Undangan',
            'greeting_button_text'   => 'Buka Undangan',
            'music_enabled'          => true,
            'music_autoplay'         => true,
            'music_loop'             => true,
            'music_source'           => 'upload',
            'music_library_id'       => null,
            'music_url'              => self::ASSET_DIR.'/music.mp3',
            'features'               => $features,
        ]);
    }

    private function seedContents(Invitation $invitation, array $data, \Closure $photos): void
    {
        $rows = [];

        foreach ($data['fields'] as $key => $value) {
            $rows[] = [$key, (string) $value, 'text'];
        }
        foreach ($data['photos'] as $key => $pool) {
            $rows[] = [$key, $photos($pool, 0), 'path'];
        }
        foreach ($data['json'] as $key => $value) {
            $rows[] = [$key, json_encode($value), 'json'];
        }
        $rows[] = ['bank_accounts', json_encode($data['bank_accounts']), 'json'];

        foreach ($rows as [$key, $value, $type]) {
            InvitationContent::create([
                'invitation_id' => $invitation->id,
                'content_key'   => $key,
                'content_value' => $value,
                'content_type'  => $type,
            ]);
        }
    }

    private function seedEvents(Invitation $invitation, array $events): void
    {
        foreach ($events as $i => $event) {
            InvitationEvent::create(array_merge($event['venue'], [
                'invitation_id' => $invitation->id,
                'event_name'    => $event['name'],
                'event_date'    => $event['date']->toDateString(),
                'event_time'    => $event['time'],
                'time_end'      => $event['time_end'],
                'display_order' => $i,
                'is_countdown'  => (bool) ($event['countdown'] ?? false),
            ]));
        }
    }

    private function seedGallery(Invitation $invitation, \Closure $photos): void
    {
        foreach ($photos('gallery', self::GALLERY_SIZE) as $i => $path) {
            $this->galleryPhoto($invitation, $path, 'general', $i);
        }
    }

    /**
     * Mirrors InvitationController@store: a story's photo is a love_story
     * gallery row with the same display_order, plus a content pointer.
     */
    private function seedStories(Invitation $invitation, array $stories, \Closure $photos): void
    {
        $storyPhotos = $photos('story', count($stories));

        foreach ($stories as $i => $entry) {
            $story = Story::create([
                'invitation_id' => $invitation->id,
                'title'         => $entry['title'],
                'content'       => $entry['content'],
                'story_type'    => 'love_story',
                'story_date'    => preg_match('/^\d{4}$/', $entry['period']) ? "{$entry['period']}-01-01" : null,
                'story_period'  => $entry['period'],
                'display_order' => $i,
                'is_published'  => true,
            ]);

            $path = $storyPhotos[$i];
            $this->galleryPhoto($invitation, $path, 'love_story', $i);
            InvitationContent::create([
                'invitation_id' => $invitation->id,
                'content_key'   => "love_story_{$story->id}_photo",
                'content_value' => $path,
                'content_type'  => 'path',
            ]);
        }
    }

    private function galleryPhoto(Invitation $invitation, string $path, string $category, int $order): void
    {
        GalleryPhoto::create([
            'invitation_id' => $invitation->id,
            'file_path'     => $path,
            'file_size'     => Storage::disk('public')->size($path),
            'media_type'    => 'photo',
            'mime_type'     => 'image/jpeg',
            'category'      => $category,
            'display_order' => $order,
        ]);
    }

    /** Guests with varied RSVP answers + approved wishes (shown by the wishes API). */
    private function seedGuestsAndWishes(Invitation $invitation, array $wishes, int $globalIndex): void
    {
        $statuses = ['attending', 'attending', 'maybe', 'attending', 'not_attending'];

        foreach ($wishes as $i => $wish) {
            $guest = Guest::create([
                'invitation_id'     => $invitation->id,
                'name'              => $wish['name'],
                'slug'              => Str::slug($wish['name']),
                'category'          => $i === 0 ? 'Keluarga' : 'Teman',
                'qr_code_data'      => sprintf('SAMPLE-%03d-%d', $globalIndex, $i),
                'rsvp_status'       => $statuses[$i % count($statuses)],
                'rsvp_headcount'    => $statuses[$i % count($statuses)] === 'not_attending' ? 0 : 1 + ($i % 3),
                'rsvp_submitted_at' => now()->subDays(5 - $i),
                'message'           => $wish['message'],
            ]);

            Comment::create([
                'invitation_id' => $invitation->id,
                'guest_id'      => $guest->id,
                'guest_name'    => $wish['name'],
                'comment_text'  => $wish['message'],
                'status'        => 'approved',
                'approved_at'   => now()->subDays(5 - $i)->subHours($i),
            ]);
        }
    }

    private function seedWishlist(Invitation $invitation, array $items): void
    {
        foreach ($items as $i => $item) {
            GiftWishlistItem::create([
                'invitation_id'    => $invitation->id,
                'item_name'        => $item['name'],
                'item_description' => $item['description'],
                'estimated_price'  => $item['price'],
                'currency'         => 'IDR',
                'category'         => $item['category'],
                'status'           => 'available',
                'display_order'    => $i,
            ]);
        }
    }

    private function seedWallet(Invitation $invitation, User $owner, array $wallet, int $globalIndex): void
    {
        $model = DigitalWallet::updateOrCreate(
            ['user_id' => $owner->id, 'account_number' => sprintf('0800%07d', 5500000 + $globalIndex)],
            [
                'provider'       => $wallet['provider'],
                'provider_label' => $wallet['label'],
                'account_name'   => $wallet['name'],
                'logo_path'      => null,
                'qris_qr_path'   => self::ASSET_DIR.'/qris-sample.png',
                'is_active'      => true,
            ],
        );

        $invitation->digitalWallets()->attach($model->id, ['is_displayed' => true, 'display_order' => 0]);
    }

    // ─── Supporting records ──────────────────────────────────────────────────

    /** Inactive system account with no role: it owns the samples but can't log in to a dashboard. */
    private function owner(): User
    {
        $user = User::withTrashed()->firstOrNew(['email' => self::OWNER_EMAIL]);

        if (! $user->exists) {
            $user->forceFill([
                'name'              => 'Undesia Contoh Undangan (sistem)',
                'password'          => Hash::make(Str::random(64)),
                'email_verified_at' => now(),
            ]);
        }
        $user->forceFill(['is_active' => false, 'deleted_at' => null])->save();

        return $user;
    }

    /** Highest tier for the type, so premium/exclusive themes are allowed. */
    private function package(string $type): ?Package
    {
        static $cache = [];

        $invitationType = EventType::INVITATION_TYPES[$type] ?? null;

        return $cache[$type] ??= Package::query()
            ->where('invitation_type', $invitationType)
            ->orderByRaw('CASE WHEN name LIKE ? THEN 0 ELSE 1 END', ['%exclusive'])
            ->orderByDesc('price')
            ->first();
    }

    /**
     * Copies the committed asset library to the public disk (skipping files
     * that are already identical) and indexes the photo pools per type.
     */
    private function publishAssets(): void
    {
        $source = database_path(self::ASSET_SOURCE);
        $disk = Storage::disk('public');

        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($source, \FilesystemIterator::SKIP_DOTS));
        foreach ($files as $file) {
            $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($source) + 1));
            if (str_ends_with($relative, '.md')) {
                continue;
            }

            $target = self::ASSET_DIR.'/'.$relative;
            if (! $disk->exists($target) || $disk->size($target) !== $file->getSize()) {
                $disk->put($target, file_get_contents($file->getPathname()));
            }

            // {type}/{pool}-{nn}.jpg
            if (preg_match('#^([a-z_]+)/([a-z]+)-\d+\.jpe?g$#', $relative, $m)) {
                $this->pools[$m[1]][$m[2]][] = $target;
            }
        }

        foreach ($this->pools as &$pools) {
            foreach ($pools as &$paths) {
                sort($paths);
            }
        }
    }

    /**
     * Deterministic photo selection for one sample. Profile pools rotate by
     * variant; gallery/story mix the type's "moment" pool with its profile
     * pools at different offsets so neighbouring samples look different.
     *
     * @return \Closure(string $pool, int $countOrIndex): (string|array<int, string>)
     */
    private function photoPicker(string $type, int $variant): \Closure
    {
        $pools = $this->pools[$type] ?? [];
        $moments = $pools['moment'] ?? [];
        $profiles = array_merge(...array_values(array_diff_key($pools, ['moment' => true, 'detail' => true])));
        // Wedding keeps couple/detail shots for the gallery; other types lean on "moment".
        $galleryPool = $type === 'wedding'
            ? array_merge($pools['couple'] ?? [], $pools['detail'] ?? [])
            : array_merge($moments, $profiles);

        $rotate = function (array $list, int $offset, int $count): array {
            $out = [];
            for ($i = 0; $i < min($count, count($list)); $i++) {
                $out[] = $list[($offset + $i) % count($list)];
            }

            return $out;
        };

        return function (string $pool, int $n) use ($pools, $galleryPool, $rotate, $variant, $type) {
            return match ($pool) {
                'gallery' => $rotate($galleryPool, $variant * 3, $n),
                'story'   => $rotate(
                    $type === 'wedding' ? array_merge($pools['detail'] ?? [], $pools['couple'] ?? []) : $galleryPool,
                    $variant * 5 + 7,
                    $n,
                ),
                // Single profile photo: rotate within its own pool.
                default   => ($pools[$pool] ?? throw new \RuntimeException("Pool foto '{$type}/{$pool}' kosong."))[$variant % count($pools[$pool])],
            };
        };
    }

    /**
     * Samples whose theme was deleted or lost its renderer. Only ever
     * touches is_sample rows of the system owner.
     */
    private function pruneStaleSamples(User $owner, array $seededThemeIds): void
    {
        $stale = Invitation::withTrashed()
            ->where('is_sample', true)
            ->where('user_id', $owner->id)
            ->where(fn ($q) => $q->whereNull('theme_id')->orWhereNotIn('theme_id', $seededThemeIds ?: [0]))
            ->get();

        foreach ($stale as $invitation) {
            $invitation->forceDelete();
        }

        // Wallets no longer attached to any sample.
        DigitalWallet::where('user_id', $owner->id)->whereDoesntHave('invitations')->delete();

        if ($stale->isNotEmpty()) {
            $this->command?->info("  {$stale->count()} contoh undangan usang dihapus.");
        }
    }

    private function report(array $counts, array $skipped): void
    {
        $this->command?->info('SampleInvitationSeeder: contoh undangan per tipe');
        foreach (array_keys(EventType::INVITATION_TYPES) as $type) {
            $n = $counts[$type] ?? 0;
            $s = count($skipped[$type] ?? []);
            $this->command?->info(sprintf('  %-14s %2d contoh%s', $type, $n, $s ? " ({$s} tema belum punya renderer)" : ''));
        }
        $this->command?->info('  Total: '.array_sum($counts));
    }
}
