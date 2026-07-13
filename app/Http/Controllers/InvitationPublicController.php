<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Guest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationPublicController extends Controller
{
    public function show(Request $request, string $code, ?string $visitor = null): Response
    {
        $visitor = $visitor
        ? urldecode($visitor)
        : ($request->query('visitor') ?? $request->query('tamu') ?? $request->query('guests'));
   

        $invitation = Invitation::with([
            'theme',
            'settings',
            'events'         => fn($q) => $q->orderBy('display_order')->orderBy('event_date'),
            'contents',
            'galleryPhotos'  => fn($q) => $q->whereIn('category', ['general', 'love_story'])->orderBy('category')->orderBy('display_order'),
            'stories'        => fn($q) => $q->where('story_type', 'love_story')->where('is_published', true)->orderBy('display_order'),
            'digitalWallets' => fn($q) => $q->wherePivot('is_displayed', true)->orderByPivot('display_order'),
        ])
            ->where('slug', $code)
            ->first();

        if (! $invitation) {
            $invitation = Invitation::with([
                'theme',
                'settings',
                'events'         => fn($q) => $q->orderBy('display_order')->orderBy('event_date'),
                'contents',
                'galleryPhotos'  => fn($q) => $q->whereIn('category', ['general', 'love_story'])->orderBy('category')->orderBy('display_order'),
                'stories'        => fn($q) => $q->where('story_type', 'love_story')->where('is_published', true)->orderBy('display_order'),
                'digitalWallets' => fn($q) => $q->wherePivot('is_displayed', true)->orderByPivot('display_order'),
            ])
                ->where('invitation_code', $code)
                ->firstOrFail();
        }
        // $invitation = Invitation::where('invitation_code', $code)
 
        // ->first();

        abort_if($invitation->isExpired(), 410, 'Undangan ini sudah tidak aktif.');

        $theme = $invitation->theme;
        abort_if(! $theme, 404, 'Tema undangan tidak tersedia.');

        $guest = Guest::where('invitation_id', $invitation->id)
            ->where('slug', $visitor)
            ->first();
            // dd($visitor);
        $data = $this->buildData($invitation, $theme->event_type, $guest ? $guest->name : ($visitor ?? ''));
        if ($guest) {
            if (! empty($guest->qr_code_data)) {
                $data['guestQrData'] = $guest->qr_code_data;
            }
            $data['guestSlug'] = $guest->slug;
        }
    // dd($theme);
        return Inertia::render('invitation/show', [
            'invitation' => $data,
            'themeSlug'  => $theme->slug,
            'visitor'    => $visitor,
            
        ]);
    }

    private function resolveContentUrl(Invitation $invitation, string $key): string
    {
        $record = $invitation->contents->firstWhere('content_key', $key);
        if (! $record) return '';
        if ($record->content_type === 'path') {
            return asset('storage/' . $record->content_value);
        }
        return (string) $record->content_value;
    }

    private function buildData(Invitation $invitation, string $eventType, string $guestName = ''): array
    {
        
        $contents = $invitation->contents->pluck('content_value', 'content_key');
        $events   = $invitation->events;

        $countdownEvent    = $events->firstWhere('is_countdown', true) ?? $events->first();
        $firstEvent        = $events->first();
        $countdownDate     = $countdownEvent && $countdownEvent->event_date ? Carbon::parse($countdownEvent->event_date) : null;
        $mainDate          = $firstEvent && $firstEvent->event_date ? Carbon::parse($firstEvent->event_date) : null;
        $mainDateFormatted = $countdownDate ? $this->formatDateId($countdownDate) : ($mainDate ? $this->formatDateId($mainDate) : '');
        $countdownDatetime = $countdownDate
            ? $countdownDate->format('Y-m-d') . 'T' . ($countdownEvent->event_time ?? '08:00:00')
            : '';

        $eventsJs = $events->map(fn($e) => [
            'name'          => $e->event_name ?? '',
            'date'          => $e->event_date ? Carbon::parse($e->event_date)->format('Y-m-d') : '',
            'dateFormatted' => $e->event_date ? $this->formatDateId(Carbon::parse($e->event_date)) : '',
            'time'          => $e->event_time ?? '',
            'timeEnd'       => $e->time_end ?? '',
            'locationName'  => $e->location_name ?? '',
            'location'      => $e->location ?? '',
            'locationUrl'   => $e->location_url ?? '',
            'mapsEmbed'     => $e->maps_embed ?? '',
            'mapsLat'       => $e->maps_lat ?? '',
            'mapsLng'       => $e->maps_lng ?? '',
            'isCountdown'   => (bool) $e->is_countdown,
        ])->values()->all();

        $wallets = $invitation->digitalWallets->map(fn($w) => [
            'provider'      => $w->provider ?? '',
            'label'         => $w->provider_label ?? '',
            'accountNumber' => $w->account_number ?? '',
            'accountName'   => $w->account_name ?? '',
            'logoUrl'       => $w->logo_path    ? asset('storage/' . $w->logo_path)    : '',
            'qrisQrUrl'     => $w->qris_qr_path ? asset('storage/' . $w->qris_qr_path) : null,
        ])->all();

        $bankAccounts = json_decode($contents->get('bank_accounts', '[]'), true) ?? [];

        // Gallery — from GalleryPhoto model (general category)
        $gallery = $invitation->galleryPhotos->where('category', 'general')->map(fn($p) => [
            'url'      => asset('storage/' . $p->file_path),
            'category' => $p->category ?? 'general',
            'label'    => $p->title ?? '',
        ])->values()->all();

        $storyPhotos = $invitation->galleryPhotos
            ->where('category', 'love_story')
            ->keyBy('display_order');

        $loveStory = $invitation->stories->map(function ($story) use ($storyPhotos) {
            $photo = $storyPhotos->get($story->display_order);

            return [
                'title' => $story->title,
                'desc'  => $story->content,
                'date'  => $story->story_period ?: ($story->story_date?->format('Y') ?? ''),
                'photo' => $photo ? asset('storage/' . $photo->file_path) : '',
            ];
        })->values()->all();

        // Settings from invitation_settings table
        $settings      = $invitation->settings;
        $featuresRaw   = $settings?->features ?? [];
        $features      = ! empty($featuresRaw) ? $featuresRaw : null;

        // Music — stored in invitation_settings; music_url may be a storage path
        $rawMusicUrl   = $settings?->music_url ?? '';
        $musicUrl      = $rawMusicUrl
            ? (str_starts_with($rawMusicUrl, 'http') ? $rawMusicUrl : asset('storage/' . $rawMusicUrl))
            : '';
        $musicEnabled  = (bool) ($settings?->music_enabled ?? false);
        $musicAutoplay = (bool) ($settings?->music_autoplay ?? true);
        $musicLoop     = (bool) ($settings?->music_loop ?? true);

        // Greeting / cover page settings
        $greeting = [
            'title'       => $settings?->greeting_title       ?? 'Kepada Yth.',
            'message'     => $settings?->greeting_message      ?? null,
            'guestLabel'  => $settings?->greeting_guest_label  ?? 'Tamu Undangan',
            'buttonText'  => $settings?->greeting_button_text  ?? 'Buka Undangan',
        ];

        // Individual feature toggles
        $featureToggles = [
            'rsvp'             => (bool) ($settings?->feature_rsvp             ?? true),
            'giftWishlist'     => (bool) ($settings?->feature_gift_wishlist     ?? false),
            'genderPoll'       => (bool) ($settings?->feature_gender_poll       ?? false),
            'liveStream'       => (bool) ($settings?->feature_live_stream       ?? false),
            'interactiveGames' => (bool) ($settings?->feature_interactive_games ?? false),
            'dressCode'        => (bool) ($settings?->feature_dress_code        ?? false),
            'amplopDigital'    => (bool) ($settings?->feature_amplop_digital    ?? false),
            'instagramFilter'  => (bool) ($settings?->feature_instagram_filter  ?? false),
            'analytics'        => (bool) ($settings?->feature_analytics         ?? false),
            'pageBuilder'      => (bool) ($settings?->feature_page_builder      ?? false),
            'customDomain'     => (bool) ($settings?->feature_custom_domain     ?? false),
        ];

        $base = [
            'type'              => $eventType,
            'code'              => $invitation->invitation_code ?: $invitation->slug,
            'slug'              => $invitation->slug,
            'title'             => $invitation->title ?? '',
            'guestName'         => $guestName,
            'countdownDate'     => $countdownDatetime,
            'countdownLabel'    => $settings?->countdown_label ?? 'Hitung Mundur',
            'showGuestCount'    => (bool) ($settings?->show_guest_count ?? true),
            'mainDateFormatted' => $mainDateFormatted,
            'events'            => $eventsJs,
            'gallery'           => $gallery,
            'coupleVideoUrl'     => (string) $contents->get('couple_video_url', ''),
            'bankAccounts'      => $bankAccounts,
            'digitalWallets'    => $wallets,
            'allowComments'     => (bool) $invitation->allow_guest_comments,
            'greeting'          => $greeting,
            'featureToggles'    => $featureToggles,
            'rsvpEndpoint'      => url("/api/inv/" . ($invitation->invitation_code ?: $invitation->slug) . "/rsvp"),
            'wishesEndpoint'    => url("/api/inv/" . ($invitation->invitation_code ?: $invitation->slug) . "/wishes"),
        ];

        if ($features !== null) {
            $base['features'] = $features;
        }
        if ($musicEnabled && $musicUrl) {
            $base['music'] = [
                'url'      => $musicUrl,
                'autoplay' => $musicAutoplay,
                'loop'     => $musicLoop,
            ];
        }

        if ($eventType === 'wedding') {
            $groomNick = $contents->get('groom_nickname', '');
            $brideNick = $contents->get('bride_nickname', '');
            $groomFull = $contents->get('groom_full_name', 'Mempelai Pria');
            $brideFull = $contents->get('bride_full_name', 'Mempelai Wanita');
// dd($base);
            return array_merge($base, [
                'pageTitle'        => $invitation->title ?: "The Wedding of {$groomFull} & {$brideFull}",
                'groomFullName'    => $groomFull,
                'groomNickname'    => $groomNick,
                'groomInitials'    => $contents->get('groom_initials', strtoupper(substr($groomNick ?: $groomFull, 0, 1))),
                'groomChildOrder'  => $contents->get('groom_child_order', ''),
                'groomFather'      => $contents->get('groom_father', ''),
                'groomMother'      => $contents->get('groom_mother', ''),
                'groomBio'         => $contents->get('groom_bio', ''),
                'groomPhoto'       => $this->resolveContentUrl($invitation, 'groom_photo'),
                'couplePhoto'      => $this->resolveContentUrl($invitation, 'couple_photo'),
                'brideFullName'    => $brideFull,
                'brideNickname'    => $brideNick,
                'brideInitials'    => $contents->get('bride_initials', strtoupper(substr($brideNick ?: $brideFull, 0, 1))),
                'brideChildOrder'  => $contents->get('bride_child_order', ''),
                'brideFather'      => $contents->get('bride_father', ''),
                'brideMother'      => $contents->get('bride_mother', ''),
                'brideBio'         => $contents->get('bride_bio', ''),
                'bridePhoto'       => $this->resolveContentUrl($invitation, 'bride_photo'),
                'loveStory'        => $loveStory,
                'dressCodes'       => json_decode($contents->get('dress_code_colors', '[]'), true) ?? [],
                'rsvpDeadline'     => $contents->get('rsvp_deadline', ''),
                'openingQuote'     => $contents->get('opening_quote', ''),
            ]);
        }

        if ($eventType === 'birthday') {
            $celebrantName = $contents->get('child_name', '');
            $celebrantNick = $contents->get('child_nickname', $celebrantName);
            $fatherName    = $contents->get('father_name', '');
            $motherName    = $contents->get('mother_name', '');

            return array_merge($base, [
                'pageTitle'         => $invitation->title ?: "Birthday Invitation - {$celebrantName}",
                'celebrantName'     => $celebrantName,
                'celebrantNickname' => $celebrantNick,
                'celebrantAge'      => $contents->get('child_age', ''),
                'celebrantBio'      => $contents->get('opening_message', ''),
                'celebrantPhoto'    => $this->resolveContentUrl($invitation, 'child_photo'),
                'parentName'        => trim(implode(' & ', array_filter([$fatherName, $motherName]))),
                'lifeJourney'       => $loveStory,
            ]);
        }

        return array_merge($base, ['pageTitle' => $invitation->title ?? '']);
    }

    private function formatDateId(Carbon $date): string
    {
        $days   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $months = [
            '',
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember'
        ];

        return $days[$date->dayOfWeek] . ', ' . $date->day . ' ' . $months[$date->month] . ' ' . $date->year;
    }
}
