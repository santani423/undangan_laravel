<?php

namespace App\Services;

use App\Models\GalleryPhoto;
use App\Models\Invitation;
use App\Models\InvitationContent;
use App\Models\InvitationEvent;
use App\Models\Package;
use App\Models\Story;
use App\Models\Theme;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Loading and saving an invitation's editable content — shared by the
 * customer editor (owner only) and the admin editor (any invitation).
 * Callers are responsible for authorization; this service never checks
 * who is acting.
 */
class InvitationEditorService
{
    public function __construct(private InvitationSlugService $slugs)
    {
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * Props for the invitation editor's content, theme and settings tabs.
     */
    public function editorProps(Invitation $invitation): array
    {
        $invitation->load([
            'eventType.fields',
            'theme',
            'package.features',
            'settings',
            'events'       => fn ($q) => $q->orderBy('display_order'),
            'contents',
            'galleryPhotos' => fn ($q) => $q->where('category', 'general')->orderBy('display_order'),
            'stories'      => fn ($q) => $q->where('story_type', 'love_story')->orderBy('display_order'),
        ]);

        // Field values — convert stored paths to public URLs
        $fieldValues = [];
        $additionalInfo = [];
        $dressCodeColors = [];
        foreach ($invitation->contents as $content) {
            if (str_starts_with($content->content_key, 'love_story_')) {
                continue;
            }
            if ($content->content_key === 'additional_info_items') {
                $additionalInfo = collect(json_decode($content->content_value ?? '[]', true) ?: [])
                    ->values()
                    ->map(fn ($item, $i) => [
                        'id'    => $i,
                        'label' => $item['label'] ?? '',
                        'value' => $item['value'] ?? '',
                    ])
                    ->all();
                continue;
            }
            if ($content->content_key === 'dress_code_colors') {
                $dressCodeColors = collect(json_decode($content->content_value ?? '[]', true) ?: [])
                    ->values()
                    ->map(fn ($item) => [
                        'name' => $item['name'] ?? '',
                        'hex'  => $item['hex'] ?? '',
                    ])
                    ->all();
                continue;
            }
            $value = $content->content_value;
            if ($content->content_type === 'path') {
                $value = Storage::disk('public')->url($value);
            }
            $fieldValues[$content->content_key] = $value;
        }

        // Acara events
        $acaraEvents = $invitation->events->map(fn ($ev) => [
            'id'               => $ev->id,
            'name'             => $ev->event_name,
            'date'             => $ev->event_date?->toDateString() ?? '',
            'time_start'       => $ev->event_time ?? '',
            'time_end'         => $ev->time_end ?? '',
            'location_name'    => $ev->location_name ?? '',
            'location_address' => $ev->location ?? '',
            'maps_embed'       => $ev->maps_embed ?? '',
            'maps_url'         => $ev->location_url ?? '',
            'maps_lat'         => $ev->maps_lat ?? '',
            'maps_lng'         => $ev->maps_lng ?? '',
            'maps_full_address' => $ev->location ?? '',
            'is_countdown'     => (bool) $ev->is_countdown,
        ])->values()->toArray();

        // Gallery
        $galleryItems = $invitation->galleryPhotos->map(fn ($photo) => [
            'dbId'    => $photo->id,
            'preview' => Storage::disk('public')->url($photo->file_path),
            'caption' => $photo->title ?? '',
        ])->values()->toArray();

        // Love story — match photos by display_order
        $storyPhotos = $invitation->galleryPhotos()
            ->where('category', 'love_story')
            ->orderBy('display_order')
            ->get()
            ->keyBy('display_order');

        $loveStory = $invitation->stories->map(fn ($story) => [
            'dbId'  => $story->id,
            'year'  => $story->story_period ?: ($story->story_date?->format('Y') ?? ''),
            'title' => $story->title,
            'story' => $story->content,
            'photo' => isset($storyPhotos[$story->display_order])
                ? Storage::disk('public')->url($storyPhotos[$story->display_order]->file_path)
                : '',
        ])->values()->toArray();

        // ── Themes available for this event type ──────────────────────────────
        $availableThemes = Theme::active()
            ->where('event_type', $invitation->eventType->name)
            ->select(['id', 'name', 'slug', 'category', 'description', 'thumbnail_url', 'preview_image_url',
                   'color_primary', 'color_secondary', 'is_premium', 'is_exclusive', 'price', 'usage_count'])
            ->withExists('sampleInvitation')
            ->ordered()
            ->get()
            ->map(fn ($t) => [
                'id'                => $t->id,
                'name'              => $t->name,
                'slug'              => $t->slug,
                'category'          => $t->category,
                'description'       => $t->description,
                'thumbnail_url'     => $t->thumbnail_url,
                'preview_image_url' => $t->preview_image_url,
                'color_primary'     => $t->color_primary,
                'color_secondary'   => $t->color_secondary,
                'is_premium'        => $t->is_premium,
                'is_exclusive'      => $t->is_exclusive,
                'price'             => $t->price,
                'usage_count'       => $t->usage_count,
                'sample_url'        => $t->sampleUrl($t->sample_invitation_exists),
            ]);

        // Invitation settings
        $settings = $invitation->settings;
        $invitationSettings = $settings ? [
            'greeting_title'       => $settings->greeting_title       ?? 'Kepada Yth.',
            'greeting_message'     => $settings->greeting_message     ?? 'Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara kami.',
            'greeting_guest_label' => $settings->greeting_guest_label ?? 'Tamu Undangan',
            'greeting_button_text' => $settings->greeting_button_text ?? 'Buka Undangan',
            'invitation_code'      => $invitation->invitation_code    ?? $invitation->slug,
            'music_enabled'        => (bool) ($settings->music_enabled  ?? false),
            'music_autoplay'       => (bool) ($settings->music_autoplay ?? true),
            'music_loop'           => (bool) ($settings->music_loop     ?? true),
            'music_source'         => $settings->music_source         ?? '',
            'music_library_id'     => $settings->music_library_id     ?? '',
            'music_url'            => $settings->music_url            ?? '',
            'features'             => $settings->features             ?? [],
        ] : null;

        return [
            'invitation'   => [
                'id'     => $invitation->id,
                'slug'   => $invitation->slug,
                'title'  => $invitation->title,
                'status' => $invitation->status,
            ],
            'eventType'          => $invitation->eventType,
            'theme'              => $invitation->theme,
            'package'            => $invitation->package,
            'fieldValues'        => $fieldValues,
            'additionalInfo'     => $additionalInfo,
            'dressCodeColors'    => $dressCodeColors,
            'acaraEvents'        => $acaraEvents,
            'galleryItems'       => $galleryItems,
            'loveStory'          => $loveStory,
            'availableThemes'    => $availableThemes,
            'invitationSettings' => $invitationSettings,
            'availableMusic'     => [],
        ];
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * Save the content tabs (fields, events, gallery, love story, extras).
     * Input is validated by UpdateInvitationRequest.
     */
    public function update(Invitation $invitation, Request $request): void
    {
        try {
            DB::transaction(function () use ($request, $invitation) {
            // ── Status ────────────────────────────────────────────────────
            if ($request->filled('status')) {
                $invitation->update(['status' => $request->input('status')]);
            }

            if ($request->has('field_values.groom_child_order')) {
                $invitation->update(['groom_child_order' => $request->filled('field_values.groom_child_order') ? (int) $request->input('field_values.groom_child_order') : null]);
            }

            if ($request->has('field_values.bride_child_order')) {
                $invitation->update(['bride_child_order' => $request->filled('field_values.bride_child_order') ? (int) $request->input('field_values.bride_child_order') : null]);
            }

            // ── Field values ──────────────────────────────────────────────
            foreach ($request->input('field_values', []) as $key => $value) {
                if ($value === null || $value === '') {
                    $invitation->contents()->where('content_key', $key)->delete();
                    continue;
                }

                $contentType = 'text';
                $storedValue = $value;

                if (str_starts_with((string) $value, 'data:image/')) {
                    $oldContent = $invitation->contents()->where('content_key', $key)->value('content_value');
                    $storedValue = UploadService::uploadBase64Image($value, "invitations/{$invitation->id}/content", $oldContent);
                    $contentType = 'path';
                } elseif (str_contains((string) $value, '/storage/')) {
                    // Existing URL (relative "/storage/..." or absolute via APP_URL) — strip to storage path
                    $storedValue = ltrim(Str::after((string) $value, '/storage/'), '/');
                    $contentType = 'path';
                }

                $invitation->contents()->updateOrCreate(
                    ['content_key'   => $key],
                    ['content_value' => $storedValue, 'content_type' => $contentType],
                );
            }

            // ── Additional info — replace ───────────────────────────────
            $additionalInfo = $this->normalizedAdditionalInfo($request->input('additional_info', []));
            if ($additionalInfo->isEmpty()) {
                $invitation->contents()->where('content_key', 'additional_info_items')->delete();
            } else {
                $invitation->contents()->updateOrCreate(
                    ['content_key' => 'additional_info_items'],
                    ['content_value' => $additionalInfo->toJson(), 'content_type' => 'json'],
                );
            }

            // ── Dress code colors — replace ─────────────────────────────
            $dressCodeColors = $this->normalizedDressCodeColors($request->input('dress_code_colors', []));
            if ($dressCodeColors->isEmpty()) {
                $invitation->contents()->where('content_key', 'dress_code_colors')->delete();
            } else {
                $invitation->contents()->updateOrCreate(
                    ['content_key' => 'dress_code_colors'],
                    ['content_value' => $dressCodeColors->toJson(), 'content_type' => 'json'],
                );
            }

            if ($request->has('field_values')) {
                $title = $this->slugs->resolveTitle(
                    $invitation->eventType?->name ?? '',
                    $request->input('field_values', []),
                    $invitation->title
                );
                if ($title !== $invitation->title) {
                    $invitation->update(['title' => $title]);
                }
            }

            // ── Acara events — replace all ────────────────────────────────
            $invitation->events()->delete();
            $acaraInputs  = $request->input('acara_events', []);
            $hasCountdown = collect($acaraInputs)->contains(fn ($ev) => !empty($ev['is_countdown']));
            foreach ($acaraInputs as $i => $ev) {
                if (empty($ev['name']) || empty($ev['date'])) {
                    continue;
                }
                InvitationEvent::create([
                    'invitation_id' => $invitation->id,
                    'event_name'    => $ev['name'],
                    'event_date'    => $ev['date'],
                    'event_time'    => $ev['time_start'] ?: null,
                    'time_end'      => $ev['time_end'] ?: null,
                    'location'      => $ev['location_address'] ?: null,
                    'location_name' => $ev['location_name'] ?: null,
                    'location_url'  => $ev['maps_url'] ?: null,
                    'maps_embed'    => $ev['maps_embed'] ?: null,
                    'maps_lat'      => $ev['maps_lat'] ?: null,
                    'maps_lng'      => $ev['maps_lng'] ?: null,
                    'display_order' => $i,
                    'is_countdown'  => $hasCountdown ? !empty($ev['is_countdown']) : ($i === 0),
                ]);
            }

            // ── Gallery — keep existing, add new, delete removed ──────────
            $submittedDbIds = collect($request->input('gallery_items', []))
                ->filter(fn ($item) => isset($item['dbId']))
                ->pluck('dbId')
                ->map(fn ($v) => (int) $v)
                ->toArray();

            $invitation->galleryPhotos()
                ->where('category', 'general')
                ->when($submittedDbIds, fn ($q) => $q->whereNotIn('id', $submittedDbIds))
                ->delete();

            $pkg       = Package::find($invitation->package_id);
            $maxGallery = $pkg?->max_gallery_uploads;
            $newCount   = $invitation->galleryPhotos()->where('category', 'general')->count();

            foreach ($request->input('gallery_items', []) as $i => $item) {
                if (isset($item['dbId'])) {
                    $invitation->galleryPhotos()
                        ->where('id', (int) $item['dbId'])
                        ->update(['title' => $item['caption'] ?? null, 'display_order' => $i]);
                } elseif (!empty($item['preview']) && str_starts_with($item['preview'], 'data:image/')) {
                    if ($maxGallery !== null && $newCount >= $maxGallery) {
                        continue;
                    }
                    $path = UploadService::uploadBase64Image($item['preview'], "invitations/{$invitation->id}/gallery");
                    GalleryPhoto::create([
                        'invitation_id' => $invitation->id,
                        'file_path'     => $path,
                        'media_type'    => 'photo',
                        'mime_type'     => UploadService::mimeTypeForPath($path),
                        'title'         => $item['caption'] ?? null,
                        'category'      => 'general',
                        'display_order' => $i,
                    ]);
                    $newCount++;
                }
            }

            // ── Love story — replace all ──────────────────────────────────
            $invitation->stories()->where('story_type', 'love_story')->delete();
            $invitation->galleryPhotos()->where('category', 'love_story')->delete();
            $invitation->contents()->where('content_key', 'LIKE', 'love_story_%_photo')->delete();

            foreach ($request->input('love_story', []) as $i => $entry) {
                if (empty($entry['title']) && empty($entry['story'])) {
                    continue;
                }
                [$storyDate, $storyPeriod] = $this->resolveStoryDateAndPeriod($entry['year'] ?? '');
                $story = Story::create([
                    'invitation_id' => $invitation->id,
                    'title'         => $entry['title'] ?? '',
                    'content'       => $entry['story'] ?? '',
                    'story_type'    => 'love_story',
                    'story_date'    => $storyDate,
                    'story_period'  => $storyPeriod,
                    'display_order' => $i,
                ]);

                $photoVal = $entry['photo'] ?? '';
                if (!empty($photoVal) && str_starts_with($photoVal, 'data:image/')) {
                    $photoPath = UploadService::uploadBase64Image($photoVal, "invitations/{$invitation->id}/stories");
                    GalleryPhoto::create([
                        'invitation_id' => $invitation->id,
                        'file_path'     => $photoPath,
                        'media_type'    => 'photo',
                        'mime_type'     => UploadService::mimeTypeForPath($photoPath),
                        'category'      => 'love_story',
                        'display_order' => $i,
                    ]);
                    InvitationContent::create([
                        'invitation_id' => $invitation->id,
                        'content_key'   => "love_story_{$story->id}_photo",
                        'content_value' => $photoPath,
                        'content_type'  => 'path',
                    ]);
                } elseif (!empty($photoVal) && str_contains($photoVal, '/storage/')) {
                    // Existing photo — re-save reference (photoVal may be a relative
                    // "/storage/..." path or an absolute URL built from APP_URL)
                    $storedPath = ltrim(Str::after($photoVal, '/storage/'), '/');
                    GalleryPhoto::create([
                        'invitation_id' => $invitation->id,
                        'file_path'     => $storedPath,
                        'media_type'    => 'photo',
                        'mime_type'     => UploadService::mimeTypeForPath($storedPath),
                        'category'      => 'love_story',
                        'display_order' => $i,
                    ]);
                    InvitationContent::create([
                        'invitation_id' => $invitation->id,
                        'content_key'   => "love_story_{$story->id}_photo",
                        'content_value' => $storedPath,
                        'content_type'  => 'path',
                    ]);
                }
            }
            });
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'field_values' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Save the settings tab: greeting, slug, invitation code, music, features.
     */
    public function updateSettings(Invitation $invitation, Request $request): void
    {
        $request->validate([
            'greeting_title'       => 'nullable|string|max:100',
            'greeting_message'     => 'nullable|string|max:1000',
            'greeting_guest_label' => 'nullable|string|max:100',
            'greeting_button_text' => 'nullable|string|max:100',
            'invitation_code'      => 'nullable|string|max:100|unique:invitations,invitation_code,' . $invitation->id,
            'slug'                 => 'nullable|string|max:255',
            'music_enabled'        => 'boolean',
            'music_autoplay'       => 'boolean',
            'music_loop'           => 'boolean',
            'music_source'         => 'nullable|string|in:library,upload,',
            'music_library_id'     => 'nullable|string|max:100',
            'music_url'            => 'nullable|string|max:2000',
            'features'             => 'nullable|array',
        ]);

        try {
            DB::transaction(function () use ($request, $invitation) {
                $newSlug = $this->slugs->resolveCandidate(
                    $request->input('slug', $invitation->slug),
                    $invitation->eventType?->name ?? 'undangan',
                    $request->input('field_values', []),
                    $invitation->title
                );

                if ($newSlug !== $invitation->slug) {
                    $this->ensureSlugIsAvailable($newSlug, $invitation->id);
                    $invitation->slug = $newSlug;
                }

                // Update invitation_code on invitations table
                if ($request->filled('invitation_code')) {
                    $invitation->invitation_code = $request->input('invitation_code');
                }

                $invitation->save();

                // Update or create invitation settings
                $invitation->settings()->updateOrCreate(
                    ['invitation_id' => $invitation->id],
                    [
                        'greeting_title'       => $request->input('greeting_title', 'Kepada Yth.'),
                        'greeting_message'     => $request->input('greeting_message'),
                        'greeting_guest_label' => $request->input('greeting_guest_label', 'Tamu Undangan'),
                        'greeting_button_text' => $request->input('greeting_button_text', 'Buka Undangan'),
                        'music_enabled'        => $request->boolean('music_enabled'),
                        'music_autoplay'       => $request->boolean('music_autoplay'),
                        'music_loop'           => $request->boolean('music_loop'),
                        'music_source'         => $request->input('music_source') ?: null,
                        'music_library_id'     => $request->input('music_library_id') ?: null,
                        'music_url'            => $request->input('music_url') ?: null,
                        'features'             => $request->input('features') ?: null,
                    ]
                );
            });
        } catch (QueryException $e) {
            $this->rethrowUniqueViolation($e);
        }
    }

    /**
     * Switch the invitation's theme, keeping theme usage counts in sync.
     */
    public function updateTheme(Invitation $invitation, Request $request): Theme
    {
        $request->validate([
            'theme_id' => 'required|exists:themes,id',
        ]);

        $theme = Theme::active()->findOrFail($request->theme_id);

        // Pastikan tema kompatibel dengan jenis acara undangan
        if ($theme->event_type && $invitation->eventType) {
            abort_if($theme->event_type !== $invitation->eventType->name, 422, 'Tema tidak kompatibel dengan jenis acara ini.');
        }

        if ($invitation->package) {
            $this->ensureThemeMatchesPackageTier($theme, $invitation->package);
        }

        $oldThemeId = $invitation->theme_id;

        $invitation->update(['theme_id' => $theme->id]);

        // Sesuaikan usage_count
        if ($oldThemeId && $oldThemeId !== $theme->id) {
            Theme::where('id', $oldThemeId)->where('usage_count', '>', 0)->decrement('usage_count');
        }
        if ($oldThemeId !== $theme->id) {
            Theme::where('id', $theme->id)->increment('usage_count');
        }

        return $theme;
    }

    public function uploadMusic(Invitation $invitation, Request $request): JsonResponse
    {
        $maxMb  = $invitation->package?->max_music_upload_mb ?? 10;

        if ($maxMb === 0) {
            return response()->json(['message' => 'Paket Anda tidak mengizinkan upload musik.'], 403);
        }

        $maxKb = $maxMb * 1024;
        $request->validate([
            'music_file' => "required|file|mimes:mp3,mpeg,ogg,aac,wav|max:{$maxKb}",
        ], [
            'music_file.max'   => "Ukuran file terlalu besar. Maksimal {$maxMb} MB.",
            'music_file.mimes' => 'Format file tidak didukung. Gunakan MP3, WAV, OGG, atau AAC.',
        ]);

        $file = $request->file('music_file');
        $path = UploadService::uploadDocument($file, "invitations/{$invitation->id}/music");

        return response()->json([
            'url'    => Storage::disk('public')->url($path),
            'max_mb' => $maxMb,
        ]);
    }

    public function checkSlug(Request $request): JsonResponse
    {
        $slug = $this->slugs->normalize((string) $request->query('slug', ''));
        $ignoreInvitationId = $request->integer('exclude_id') ?: null;

        if ($slug === '') {
            return response()->json([
                'slug'        => '',
                'available'   => false,
                'suggestions' => [],
            ]);
        }

        $available = $this->slugs->isAvailable($slug, $ignoreInvitationId);

        return response()->json([
            'slug'        => $slug,
            'available'   => $available,
            'suggestions' => $available ? [] : $this->slugs->suggestions($slug, $ignoreInvitationId),
        ]);
    }

    // ── Helpers (also used by invitation creation) ───────────────────────────

    public function normalizedAdditionalInfo(array $items): Collection
    {
        return collect($items)
            ->map(fn ($item) => [
                'label' => trim((string) ($item['label'] ?? '')),
                'value' => trim((string) ($item['value'] ?? '')),
            ])
            ->filter(fn ($item) => $item['label'] !== '' || $item['value'] !== '')
            ->values();
    }

    public function normalizedDressCodeColors(array $items): Collection
    {
        return collect($items)
            ->map(fn ($item) => [
                'name' => trim((string) ($item['name'] ?? '')),
                'hex'  => trim((string) ($item['hex'] ?? '')),
            ])
            ->filter(fn ($item) => $item['name'] !== '' || $item['hex'] !== '')
            ->values();
    }

    // ── Theme/package tier compatibility ────────────────────────────────────
    // A theme's tier is its is_premium/is_exclusive flags; a package's tier is
    // parsed from its "{invitation_type}_{tier}" name (the same convention
    // OnboardingContextResolver and selectTheme() already rely on). A package
    // unlocks its own tier and everything below it — e.g. an exclusive
    // package includes premium and basic themes.

    public function packageTier(Package $package): string
    {
        $tier = Str::afterLast($package->name, '_');

        return in_array($tier, ['basic', 'premium', 'exclusive'], true) ? $tier : 'basic';
    }

    private function tierRank(string $tier): int
    {
        return match ($tier) {
            'exclusive' => 2,
            'premium'   => 1,
            default     => 0,
        };
    }

    private function themeTierRank(Theme $theme): int
    {
        return $theme->is_exclusive ? 2 : ($theme->is_premium ? 1 : 0);
    }

    public function ensureThemeMatchesPackageTier(Theme $theme, Package $package): void
    {
        if ($this->themeTierRank($theme) > $this->tierRank($this->packageTier($package))) {
            throw ValidationException::withMessages([
                'theme_id' => 'Tema yang dipilih memerlukan paket yang lebih tinggi. Silakan pilih paket yang sesuai atau ganti tema.',
            ]);
        }
    }

    public function ensureSlugIsAvailable(string $slug, ?int $ignoreInvitationId = null): void
    {
        if (! $this->slugs->isAvailable($slug, $ignoreInvitationId)) {
            throw ValidationException::withMessages([
                'slug' => 'Slug sudah digunakan oleh undangan lain. Silakan gunakan slug yang berbeda.',
            ]);
        }
    }

    /**
     * Turn a slug / invitation_code unique-index violation (a race past the
     * availability check) into a validation error; rethrow anything else.
     */
    public function rethrowUniqueViolation(QueryException $exception): never
    {
        $message = $exception->getMessage();

        if (str_contains($message, 'invitations.slug')
            || str_contains($message, 'slug_unique')
            || (str_contains($message, 'UNIQUE constraint failed') && str_contains($message, 'slug'))) {
            throw ValidationException::withMessages([
                'slug' => 'Slug sudah digunakan oleh undangan lain. Silakan gunakan slug yang berbeda.',
            ]);
        }

        if (str_contains($message, 'invitations.invitation_code')
            || str_contains($message, 'invitation_code_unique')
            || (str_contains($message, 'UNIQUE constraint failed') && str_contains($message, 'invitation_code'))) {
            throw ValidationException::withMessages([
                'invitation_code' => 'Kode undangan sudah digunakan oleh undangan lain. Silakan gunakan kode yang berbeda.',
            ]);
        }

        throw $exception;
    }

    /**
     * The "Tahun / Periode" field accepts free text (e.g. "2020 - Usia 2 Tahun"),
     * not just a bare year, so it's kept verbatim in story_period. story_date is
     * best-effort, derived from the first 4-digit run, purely for chronological sorting.
     */
    public function resolveStoryDateAndPeriod(string $rawPeriod): array
    {
        $period = trim($rawPeriod);
        if ($period === '') {
            return [null, null];
        }

        $storyDate = null;
        if (preg_match('/\d{4}/', $period, $matches)) {
            $storyDate = "{$matches[0]}-01-01";
        }

        return [$storyDate, mb_substr($period, 0, 100)];
    }
}
