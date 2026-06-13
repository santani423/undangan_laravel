<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use App\Models\GalleryPhoto;
use App\Models\Invitation;
use App\Models\InvitationContent;
use App\Models\InvitationEvent;
use App\Models\InvitationSetting;
use App\Models\Package;
use App\Models\Story;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function create()
    {
        $eventTypes = EventType::active()->orderBy('id')->get(['id', 'name', 'label', 'description', 'icon_path']);

        return Inertia::render('customer/invitations/create', [
            'eventTypes' => $eventTypes,
        ]);
    }

    public function selectTheme(Request $request)
    {
        $eventTypeId = $request->query('event_type_id');

        $eventType = EventType::active()->findOrFail($eventTypeId, ['id', 'name', 'label']);

        $themes = Theme::active()
            ->where('event_type', $eventType->name)
            ->orderBy('is_premium')
            ->orderBy('usage_count', 'desc')
            ->get(['id', 'name', 'slug', 'description', 'thumbnail_url', 'preview_image_url', 'color_primary', 'color_secondary', 'is_premium', 'is_exclusive', 'price', 'tags', 'usage_count']);

        $packages = Package::active()
            ->where('invitation_type', $eventType->label)
            ->with('features')
            ->get(['id', 'name', 'label', 'description', 'price', 'currency', 'billing_period', 'duration_days', 'max_gallery_uploads']);

        return Inertia::render('customer/invitations/select-theme', [
            'eventType' => $eventType,
            'themes'    => $themes,
            'packages'  => $packages,
        ]);
    }

    public function createDetail(Request $request): Response
    {
        $eventType = EventType::active()
            ->with('fields')
            ->findOrFail($request->query('event_type_id'), ['id', 'name', 'label']);

        $theme = Theme::active()
            ->findOrFail($request->query('theme_id'), ['id', 'name', 'slug', 'thumbnail_url', 'color_primary', 'color_secondary', 'is_premium', 'is_exclusive']);

        $package = Package::active()
            ->with('features')
            ->findOrFail($request->query('package_id'), ['id', 'name', 'label', 'price', 'currency', 'billing_period', 'max_gallery_uploads']);

        return Inertia::render('customer/invitations/create-detail', [
            'eventType' => $eventType,
            'theme'     => $theme,
            'package'   => $package,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'event_type_id'                   => 'required|exists:event_types,id',
            'theme_id'                        => 'required|exists:themes,id',
            'package_id'                      => 'required|exists:packages,id',
            'field_values'                    => 'nullable|array',
            'acara_events'                    => 'nullable|array',
            'acara_events.*.name'             => 'required_with:acara_events|string|max:255',
            'acara_events.*.date'             => 'required_with:acara_events|date',
            'gallery_items'                   => 'nullable|array',
            'love_story'                      => 'nullable|array',
        ]);

        DB::transaction(function () use ($request) {
            // ── Derive title from couple names or fallback ────────────────
            $fields    = $request->input('field_values', []);
            $groomName = $fields['groom_name'] ?? '';
            $brideName = $fields['bride_name'] ?? '';
            $hostName  = $fields['host_name']  ?? '';
            $title = match (true) {
                $groomName && $brideName => "{$groomName} & {$brideName}",
                $hostName !== ''         => $hostName,
                default                  => 'Undangan',
            };

            // ── Generate unique slug ──────────────────────────────────────
            $base = Str::slug($title) ?: 'undangan';
            $slug = $base;
            $n    = 1;
            while (Invitation::where('slug', $slug)->exists()) {
                $slug = "{$base}-{$n}";
                $n++;
            }

            // ── 1. Create Invitation ──────────────────────────────────────
            $invitation = Invitation::create([
                'user_id'       => auth()->id(),
                'event_type_id' => $request->input('event_type_id'),
                'package_id'    => $request->input('package_id'),
                'theme_id'      => $request->input('theme_id'),
                'slug'          => $slug,
                'title'         => $title,
                'status'        => 'draft',
            ]);

            // ── 2. Default settings ───────────────────────────────────────
            InvitationSetting::create(['invitation_id' => $invitation->id]);

            // ── 3. Field values → InvitationContent ──────────────────────
            foreach ($fields as $key => $value) {
                if ($value === null || $value === '') {
                    continue;
                }
                $contentType  = 'text';
                $storedValue  = $value;

                if (str_starts_with((string) $value, 'data:image/')) {
                    $storedValue = $this->saveBase64Image($value, "invitations/{$invitation->id}/content");
                    $contentType = 'path';
                }

                InvitationContent::create([
                    'invitation_id' => $invitation->id,
                    'content_key'   => $key,
                    'content_value' => $storedValue,
                    'content_type'  => $contentType,
                ]);
            }

            // ── 4. Acara events ───────────────────────────────────────────
            foreach ($request->input('acara_events', []) as $i => $ev) {
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
                ]);
            }

            // ── 5. Gallery ────────────────────────────────────────────────
            $pkg         = Package::find($request->input('package_id'));
            $maxGallery  = $pkg?->max_gallery_uploads;
            $galleryItems = $request->input('gallery_items', []);
            if ($maxGallery !== null) {
                $galleryItems = array_slice($galleryItems, 0, $maxGallery);
            }
            foreach ($galleryItems as $i => $item) {
                if (empty($item['preview'])) {
                    continue;
                }
                $path = $this->saveBase64Image($item['preview'], "invitations/{$invitation->id}/gallery");
                GalleryPhoto::create([
                    'invitation_id' => $invitation->id,
                    'file_path'     => $path,
                    'media_type'    => 'photo',
                    'mime_type'     => 'image/jpeg',
                    'title'         => $item['caption'] ?? null,
                    'category'      => 'general',
                    'display_order' => $i,
                ]);
            }

            // ── 6. Love story ─────────────────────────────────────────────
            foreach ($request->input('love_story', []) as $i => $entry) {
                if (empty($entry['title']) && empty($entry['story'])) {
                    continue;
                }

                $storyDate = null;
                if (!empty($entry['year'])) {
                    $year = preg_replace('/\D/', '', (string) $entry['year']);
                    if (strlen($year) === 4) {
                        $storyDate = "{$year}-01-01";
                    }
                }

                $story = Story::create([
                    'invitation_id' => $invitation->id,
                    'title'         => $entry['title'] ?? '',
                    'content'       => $entry['story'] ?? '',
                    'story_type'    => 'love_story',
                    'story_date'    => $storyDate,
                    'display_order' => $i,
                ]);

                if (!empty($entry['photo']) && str_starts_with($entry['photo'], 'data:image/')) {
                    $photoPath = $this->saveBase64Image($entry['photo'], "invitations/{$invitation->id}/stories");
                    GalleryPhoto::create([
                        'invitation_id' => $invitation->id,
                        'file_path'     => $photoPath,
                        'media_type'    => 'photo',
                        'mime_type'     => 'image/jpeg',
                        'category'      => 'love_story',
                        'display_order' => $i,
                    ]);
                    // Link photo to its story via InvitationContent
                    InvitationContent::create([
                        'invitation_id' => $invitation->id,
                        'content_key'   => "love_story_{$story->id}_photo",
                        'content_value' => $photoPath,
                        'content_type'  => 'path',
                    ]);
                }
            }
        });

        return redirect()->route('customer.invitations.index')
            ->with('success', 'Undangan berhasil dibuat!');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function saveBase64Image(string $dataUrl, string $directory): string
    {
        $parts     = explode(',', $dataUrl, 2);
        $imageData = base64_decode($parts[1] ?? '');
        $filename  = Str::uuid() . '.jpg';
        $path      = "{$directory}/{$filename}";
        Storage::disk('public')->put($path, $imageData);
        return $path;
    }
}
