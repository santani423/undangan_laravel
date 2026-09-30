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
use App\Models\Transaction;
use App\Models\Story;
use App\Models\Theme;
use App\Services\InvitationEditorService;
use App\Services\InvitationSlugService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    // The photo that best represents each event type on the invitation list —
    // the couple for weddings, otherwise the child/central figure the event
    // is about. Tried in order; the first one actually uploaded wins.
    private const FEATURED_PHOTO_FIELD_KEYS = [
        'wedding'       => ['couple_photo', 'groom_photo', 'bride_photo'],
        'birthday'      => ['child_photo'],
        'khitanan'      => ['child_photo'],
        'aqiqah'        => ['baby_photo'],
        'gender_reveal' => ['parents_photo'],
        'syukuran'      => ['host_photo'],
    ];

    public function index(): Response
    {
        $invitations = Invitation::with(['theme', 'eventType', 'package', 'events', 'contents'])
            ->where('user_id', auth()->id())
            ->withCount('guests')
            ->latest()
            ->get()
            ->map(function ($inv) {
                $photoUrl = null;
                foreach (self::FEATURED_PHOTO_FIELD_KEYS[$inv->eventType?->name] ?? [] as $key) {
                    $content = $inv->contents->firstWhere('content_key', $key);
                    if ($content && $content->content_value) {
                        $photoUrl = $content->content_type === 'path'
                            ? Storage::disk('public')->url($content->content_value)
                            : $content->content_value;
                        break;
                    }
                }

                return [
                    'id'              => $inv->id,
                    'slug'            => $inv->slug,
                    'invitation_code' => $inv->invitation_code,
                    'title'           => $inv->title,
                    'status'          => $inv->status,
                    'is_public'       => $inv->is_public,
                    'created_at'      => $inv->created_at->toDateString(),
                    'expires_at'      => $inv->expires_at?->toDateString(),
                    'guests_count'    => $inv->guests_count,
                    'photo_url'       => $photoUrl,
                    'theme' => $inv->theme ? [
                        'name'            => $inv->theme->name,
                        'thumbnail_url'   => $inv->theme->thumbnail_url,
                        'color_primary'   => $inv->theme->color_primary,
                        'color_secondary' => $inv->theme->color_secondary,
                        'is_premium'      => $inv->theme->is_premium,
                        'is_exclusive'    => $inv->theme->is_exclusive,
                    ] : null,
                    'event_type' => $inv->eventType ? [
                        'name'  => $inv->eventType->name,
                        'label' => $inv->eventType->label,
                    ] : null,
                    'package' => $inv->package ? [
                        'label'          => $inv->package->label,
                        'billing_period' => $inv->package->billing_period,
                        'price'          => $inv->package->price,
                    ] : null,
                    'first_event_date' => $inv->events->first()?->event_date?->toDateString(),
                ];
            });

        return Inertia::render('customer/invitations/index', [
            'invitations' => $invitations,
        ]);
    }

    public function create(Request $request)
    {
        $eventTypes = EventType::active()->orderBy('id')->get(['id', 'name', 'label', 'description', 'icon_path']);

        $packageTier = $request->query('package_tier');

        return Inertia::render('customer/invitations/create', [
            'eventTypes' => $eventTypes,
            // Carried over from a package-tier CTA on the landing page (no
            // concrete event type chosen yet) so the next step can
            // pre-select a package within this tier once jenis is known.
            'packageTier' => in_array($packageTier, ['basic', 'premium', 'exclusive'], true) ? $packageTier : null,
        ]);
    }

    public function selectTheme(Request $request)
    {
        // Entry points A (theme card) and B (package card) land here without
        // an explicit event_type_id — it's derived from whichever of
        // theme_id/package_id/package_tier was picked before authentication,
        // re-validated the same way the post-auth redirect resolves it.
        $eventTypeId = $request->query('event_type_id');
        if (! $eventTypeId) {
            $derived = app(\App\Services\Onboarding\OnboardingContextResolver::class)->resolve(
                $request->integer('theme_id') ?: null,
                $request->integer('package_id') ?: null,
                $request->query('package_tier'),
            );
            $eventTypeId = $derived['event_type_id'];
        }

        $eventType = EventType::active()->findOrFail($eventTypeId, ['id', 'name', 'label']);

        $themes = Theme::active()
            ->where('event_type', $eventType->name)
            ->select(['id', 'name', 'slug', 'description', 'thumbnail_url', 'preview_image_url', 'color_primary', 'color_secondary', 'is_premium', 'is_exclusive', 'price', 'tags', 'usage_count'])
            ->withExists('sampleInvitation')
            ->ordered()
            ->get()
            ->each(fn (Theme $t) => $t->setAttribute('sample_url', $t->sampleUrl($t->sample_invitation_exists)));

        $packages = Package::active()
            ->where('invitation_type', $eventType->invitationType())
            ->with('features')
            ->get(['id', 'name', 'label', 'description', 'price', 'currency', 'billing_period', 'duration_days', 'max_gallery_uploads'])
            // A package's tier (basic/premium/exclusive) — parsed from its
            // "{invitation_type}_{tier}" name, same convention already used
            // by OnboardingContextResolver — tells the frontend which themes
            // (by is_premium/is_exclusive) that package unlocks.
            ->map(function (Package $pkg) {
                $pkg->tier = $this->packageTier($pkg);
                return $pkg;
            });

        // ── Preselection from an onboarding entry point (theme card, package
        // card, or a package tier picked pre-auth on the landing page) —
        // re-validated here against the themes/packages actually available
        // for this event type, never trusted blindly from the query string.
        $preselectedThemeId = $themes->firstWhere('id', $request->integer('theme_id'))?->id;
        $preselectedPackageId = $packages->firstWhere('id', $request->integer('package_id'))?->id;

        if (! $preselectedPackageId && in_array($request->query('package_tier'), ['basic', 'premium', 'exclusive'], true)) {
            $preselectedPackageId = $packages
                ->first(fn ($p) => Str::afterLast($p->name, '_') === $request->query('package_tier'))
                ?->id;
        }

        return Inertia::render('customer/invitations/select-theme', [
            'eventType' => $eventType,
            'themes'    => $themes,
            'packages'  => $packages,
            'preselectedThemeId' => $preselectedThemeId,
            'preselectedPackageId' => $preselectedPackageId,
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

    public function checkCode(Request $request): \Illuminate\Http\JsonResponse
    {
        $code   = trim((string) $request->query('code', ''));
        $exists = $code !== '' && Invitation::withTrashed()->where('invitation_code', $code)->exists();

        return response()->json(['available' => !$exists]);
    }

    public function checkSlug(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->editor()->checkSlug($request);
    }

    public function slugRecommendations(Request $request): \Illuminate\Http\JsonResponse
    {
        $slug = $this->slugService()->normalize((string) $request->query('slug', ''));
        $ignoreInvitationId = $request->integer('exclude_id') ?: null;

        return response()->json([
            'slug'        => $slug,
            'suggestions' => $this->slugService()->suggestions($slug, $ignoreInvitationId),
        ]);
    }

    public function store(\App\Http\Requests\StoreInvitationRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $pkg = Package::find($request->input('package_id'));
            $fields = $request->input('field_values', []);

            // ── Generate unique slug & derive title from event-type fields ─
            $eventType = EventType::findOrFail($request->input('event_type_id'));

            // Theme/package are only checked for existence by StoreInvitationRequest;
            // confirm here that both actually belong to the chosen event type, the
            // same way updateTheme() does — a client could otherwise submit a
            // mismatched theme_id/package_id (e.g. a Birthday theme under a
            // Wedding event type) and have it silently accepted.
            $theme = Theme::findOrFail($request->input('theme_id'));
            if ($theme->event_type !== $eventType->name) {
                throw ValidationException::withMessages([
                    'theme_id' => 'Tema yang dipilih tidak sesuai dengan jenis undangan ini.',
                ]);
            }

            // Matched via EventType::INVITATION_TYPES, not $eventType->label —
            // label is free-form display text (e.g. "Ulang Tahun") and isn't
            // guaranteed to equal invitation_type's slug ("ulang_tahun").
            if (! $pkg || ! $eventType->invitationType() || $pkg->invitation_type !== $eventType->invitationType()) {
                throw ValidationException::withMessages([
                    'package_id' => 'Paket yang dipilih tidak sesuai dengan jenis undangan ini.',
                ]);
            }

            $this->editor()->ensureThemeMatchesPackageTier($theme, $pkg);

            $title = $this->slugService()->resolveTitle($eventType->name, $fields);
            $slug = $this->resolveSlugForInvitation(
                $request->input('slug'),
                $eventType->name,
                $fields,
                $title
            );
            $this->editor()->ensureSlugIsAvailable($slug);

            // ── 1. Create Invitation ──────────────────────────────────────
            $rawCode        = $request->input('invitation_code', '');
            $invitationCode = $rawCode !== '' ? $rawCode : null;

            // Ensure uniqueness (fallback if client skipped check)
            if ($invitationCode && Invitation::where('invitation_code', $invitationCode)->exists()) {
                $invitationCode = null;
            }

            $invitation = Invitation::create([
                'user_id'          => auth()->id(),
                'event_type_id'    => $request->input('event_type_id'),
                'package_id'       => $request->input('package_id'),
                'theme_id'         => $request->input('theme_id'),
                'slug'             => $slug,
                'title'            => $title,
                'invitation_code'  => $invitationCode,
                'status'           => 'draft',
                'groom_child_order'=> $request->filled('field_values.groom_child_order') ? (int) $request->input('field_values.groom_child_order') : null,
                'bride_child_order'=> $request->filled('field_values.bride_child_order') ? (int) $request->input('field_values.bride_child_order') : null,
            ]);

            // ── 2. Default settings ───────────────────────────────────────
            InvitationSetting::create(['invitation_id' => $invitation->id]);
            if ($pkg && (float) $pkg->price > 0) {
                Transaction::create([
                    'user_id'          => auth()->id(),
                    'invitation_id'    => $invitation->id,
                    'package_id'       => $pkg->id,
                    'invoice_number'   => $this->generateInvoiceNumber(auth()->id()),
                    'invoice_amount'   => (float) $pkg->price,
                    'invoice_currency' => $pkg->currency ?? 'IDR',
                    'status'           => 'pending',
                    'due_date'         => now()->addDay(),
                ]);
            }

            // ── 3. Field values → InvitationContent ──────────────────────
            foreach ($fields as $key => $value) {
                if ($value === null || $value === '') {
                    continue;
                }
                $contentType  = 'text';
                $storedValue  = $value;

                if (str_starts_with((string) $value, 'data:image/')) {
                    $storedValue = \App\Services\UploadService::uploadBase64Image($value, "invitations/{$invitation->id}/content");
                    $contentType = 'path';
                }

                InvitationContent::create([
                    'invitation_id' => $invitation->id,
                    'content_key'   => $key,
                    'content_value' => $storedValue,
                    'content_type'  => $contentType,
                ]);
            }

            // ── 3b. Additional info ───────────────────────────────────────
            $additionalInfo = $this->editor()->normalizedAdditionalInfo($request->input('additional_info', []));
            if ($additionalInfo->isNotEmpty()) {
                InvitationContent::create([
                    'invitation_id' => $invitation->id,
                    'content_key'   => 'additional_info_items',
                    'content_value' => $additionalInfo->toJson(),
                    'content_type'  => 'json',
                ]);
            }

            // ── 4. Acara events ───────────────────────────────────────────
            $acaraInputs = $request->input('acara_events', []);
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

            // ── 5. Gallery ────────────────────────────────────────────────
            $maxGallery  = $pkg?->max_gallery_uploads;
            $galleryItems = $request->input('gallery_items', []);
            if ($maxGallery !== null) {
                $galleryItems = array_slice($galleryItems, 0, $maxGallery);
            }
            foreach ($galleryItems as $i => $item) {
                if (empty($item['preview'])) {
                    continue;
                }
                $path = \App\Services\UploadService::uploadBase64Image($item['preview'], "invitations/{$invitation->id}/gallery");
                GalleryPhoto::create([
                    'invitation_id' => $invitation->id,
                    'file_path'     => $path,
                    'media_type'    => 'photo',
                    'mime_type'     => \App\Services\UploadService::mimeTypeForPath($path),
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

                [$storyDate, $storyPeriod] = $this->editor()->resolveStoryDateAndPeriod($entry['year'] ?? '');

                $story = Story::create([
                    'invitation_id' => $invitation->id,
                    'title'         => $entry['title'] ?? '',
                    'content'       => $entry['story'] ?? '',
                    'story_type'    => 'love_story',
                    'story_date'    => $storyDate,
                    'story_period'  => $storyPeriod,
                    'display_order' => $i,
                ]);

                if (!empty($entry['photo']) && str_starts_with($entry['photo'], 'data:image/')) {
                    $photoPath = \App\Services\UploadService::uploadBase64Image($entry['photo'], "invitations/{$invitation->id}/stories");
                    GalleryPhoto::create([
                        'invitation_id' => $invitation->id,
                        'file_path'     => $photoPath,
                        'media_type'    => 'photo',
                        'mime_type'     => \App\Services\UploadService::mimeTypeForPath($photoPath),
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
        } catch (QueryException $e) {
            $this->editor()->rethrowUniqueViolation($e);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'field_values' => $e->getMessage(),
            ]);
        }

        return redirect()->route('customer.invitations.index')
            ->with('success', 'Undangan berhasil dibuat!');
    }

    public function edit(Request $request, $slug): Response
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();
        abort_if($invitation->user_id !== auth()->id(), 403);

        // ── Guests data ───────────────────────────────────────────────────────────
        $guestSearch    = $request->query('guest_search', '');
        $guestStatus    = $request->query('guest_status', '');
        $guestCheckedIn = $request->query('guest_checked_in', '');

        $guestQuery = $invitation->guests();
        if ($guestSearch) {
            $guestQuery->where(fn ($q) => $q
                ->where('name', 'like', "%{$guestSearch}%")
                ->orWhere('email', 'like', "%{$guestSearch}%")
                ->orWhere('phone_number', 'like', "%{$guestSearch}%"));
        }
        if ($guestStatus)    $guestQuery->where('rsvp_status', $guestStatus);
        if ($guestCheckedIn === 'yes') $guestQuery->whereNotNull('checked_in_at');
        elseif ($guestCheckedIn === 'no')  $guestQuery->whereNull('checked_in_at');

        $guestsPage = $guestQuery->latest()->paginate(20, ['*'], 'guest_page');

        $guestStatsRow = $invitation->guests()->selectRaw("
            COUNT(*) as total,
            SUM(rsvp_status = 'attending') as attending,
            SUM(rsvp_status = 'not_attending') as not_attending,
            SUM(rsvp_status = 'maybe') as maybe,
            SUM(rsvp_status = 'pending') as pending,
            SUM(checked_in_at IS NOT NULL) as checked_in,
            SUM(CASE WHEN rsvp_status = 'attending' THEN rsvp_headcount ELSE 0 END) as total_heads
        ")->first();

        $guestStats = [
            'total'        => (int) $guestStatsRow->total,
            'attending'    => (int) $guestStatsRow->attending,
            'notAttending' => (int) $guestStatsRow->not_attending,
            'maybe'        => (int) $guestStatsRow->maybe,
            'pending'      => (int) $guestStatsRow->pending,
            'checkedIn'    => (int) $guestStatsRow->checked_in,
            'totalHeads'   => (int) $guestStatsRow->total_heads,
        ];

        // ── Comments data ─────────────────────────────────────────────────────
        $commentSearch  = $request->query('comment_search', '');
        $commentStatus  = $request->query('comment_status', '');
        $commentFlagged = $request->query('comment_flagged', '');

        $commentQuery = $invitation->comments();
        if ($commentSearch) {
            $commentQuery->where(fn ($q) => $q
                ->where('guest_name', 'like', "%{$commentSearch}%")
                ->orWhere('comment_text', 'like', "%{$commentSearch}%"));
        }
        if ($commentStatus)  $commentQuery->where('status', $commentStatus);
        if ($commentFlagged === 'yes') $commentQuery->where('is_flagged', true);

        $commentsPage = $commentQuery->latest()->paginate(10, ['*'], 'comment_page');

        $commentStatsRow = $invitation->comments()->selectRaw("
            COUNT(*) as total,
            SUM(status = 'approved') as approved,
            SUM(status = 'pending') as pending,
            SUM(status = 'rejected') as rejected,
            SUM(is_flagged = 1) as flagged
        ")->first();

        $commentStats = [
            'total'    => (int) $commentStatsRow->total,
            'approved' => (int) $commentStatsRow->approved,
            'pending'  => (int) $commentStatsRow->pending,
            'rejected' => (int) $commentStatsRow->rejected,
            'flagged'  => (int) $commentStatsRow->flagged,
        ];

        // ── Digital wallets ───────────────────────────────────────────────────
        $myWallets = \App\Models\DigitalWallet::where('user_id', auth()->id())
            ->active()
            ->get(['id', 'provider', 'provider_label', 'account_number', 'account_name', 'logo_path', 'qris_qr_path']);

        $linkedWallets = $invitation->digitalWallets()
            ->get(['digital_wallets.id', 'invitation_digital_wallets.is_displayed', 'invitation_digital_wallets.display_order'])
            ->keyBy('id');

        $digitalWallets = $myWallets->map(fn ($w) => [
            'id'             => $w->id,
            'provider'       => $w->provider,
            'provider_label' => $w->provider_label,
            'account_number' => $w->account_number,
            'account_name'   => $w->account_name,
            'logo_url'       => $w->logo_url,
            'qris_qr_url'    => $w->qris_qr_url,
            'is_linked'      => $linkedWallets->has($w->id),
            'is_displayed'   => $linkedWallets->has($w->id) ? (bool) $linkedWallets[$w->id]->pivot->is_displayed : false,
            'display_order'  => $linkedWallets->has($w->id) ? (int) $linkedWallets[$w->id]->pivot->display_order : 99,
        ])->sortBy('display_order')->values()->toArray();

        return Inertia::render('customer/invitations/edit', [
            ...$this->editor()->editorProps($invitation),
            'digitalWallets'     => $digitalWallets,

            // Guests
            'guests'       => $guestsPage->through(fn ($g) => [
                'id'             => $g->id,
                'name'           => $g->name,
                'slug'           => $g->slug,
                'email'          => $g->email,
                'phone_number'   => $g->phone_number,
                'gender'         => $g->gender,
                'category'       => $g->category,
                'rsvp_status'    => $g->rsvp_status,
                'rsvp_headcount' => $g->rsvp_headcount,
                'rsvp_notes'     => $g->rsvp_notes,
                'checked_in_at'  => $g->checked_in_at?->toDateTimeString(),
                'notes'          => $g->notes,
            ]),
            'guestStats'    => $guestStats,
            'guestFilters'  => compact('guestSearch', 'guestStatus', 'guestCheckedIn'),

            // Comments
            'comments'      => $commentsPage->through(fn ($c) => [
                'id'           => $c->id,
                'guest_name'   => $c->guest_name,
                'guest_email'  => $c->guest_email,
                'comment_text' => $c->comment_text,
                'status'       => $c->status,
                'is_flagged'   => $c->is_flagged,
                'flag_reason'  => $c->flag_reason,
                'approved_at'  => $c->approved_at?->toDateTimeString(),
                'created_at'   => $c->created_at->toDateTimeString(),
            ]),
            'commentStats'   => $commentStats,
            'commentFilters' => compact('commentSearch', 'commentStatus', 'commentFlagged'),
        ]);
    }

    public function update(\App\Http\Requests\UpdateInvitationRequest $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $this->editor()->update($invitation, $request);

        return back()->with('success', 'Undangan berhasil diperbarui!');
    }

    public function updateSettings(Request $request, string $slug): RedirectResponse
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();
        abort_if($invitation->user_id !== auth()->id(), 403);

        $this->editor()->updateSettings($invitation, $request);

        return redirect()
            ->route('customer.invitations.settings', $invitation->slug)
            ->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function updateTheme(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $theme = $this->editor()->updateTheme($invitation, $request);

        return back()->with('success', "Tema berhasil diubah ke \"{$theme->name}\".");
    }

    public function uploadMusic(Request $request, string $slug): \Illuminate\Http\JsonResponse
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();
        abort_if($invitation->user_id !== auth()->id(), 403);

        return $this->editor()->uploadMusic($invitation, $request);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function editor(): InvitationEditorService
    {
        return app(InvitationEditorService::class);
    }

    private function packageTier(Package $package): string
    {
        return $this->editor()->packageTier($package);
    }

    private function slugService(): InvitationSlugService
    {
        return app(InvitationSlugService::class);
    }

    private function resolveSlugForInvitation(?string $requestedSlug, string $eventTypeName, array $fields = [], ?string $title = null): string
    {
        return $this->slugService()->resolveCandidate($requestedSlug, $eventTypeName, $fields, $title);
    }

    private function generateInvoiceNumber(int $userId): string
    {
        return 'INV-' . now()->format('Ymd') . '-' . $userId . '-' . strtoupper(Str::random(6));
    }
}
