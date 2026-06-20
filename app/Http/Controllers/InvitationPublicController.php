<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationPublicController extends Controller
{
    public function show(Request $request, string $code, string $visitor = null): Response
    {

        $visitor = $visitor
            ? urldecode($visitor)
            : ($request->query('visitor') ?? $request->query('tamu'));

        $invitation = Invitation::with([
            'theme',
            'settings',
            'events'         => fn($q) => $q->orderBy('display_order')->orderBy('event_date'),
            'contents',
            'galleryPhotos'  => fn($q) => $q->where('category', 'general')->orderBy('display_order'),
            'digitalWallets' => fn($q) => $q->wherePivot('is_displayed', true)->orderByPivot('display_order'),
        ])
            ->where('invitation_code', $code)

            ->firstOrFail();
        // $invitation = Invitation::where('invitation_code', $code)

        // ->first();

        abort_if($invitation->isExpired(), 410, 'Undangan ini sudah tidak aktif.');

        $theme = $invitation->theme;
        abort_if(! $theme, 404, 'Tema undangan tidak tersedia.');

        $guestName = trim((string) $request->query('to', ''));
        $data      = $this->buildData($invitation, $guestName, $theme->event_type);
        // dd($visitor);
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

    private function buildData(Invitation $invitation, string $guestName, string $eventType): array
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
            'logoUrl'       => $w->logo_path ? asset('storage/' . $w->logo_path) : '',
        ])->all();

        $bankAccounts = json_decode($contents->get('bank_accounts', '[]'), true) ?? [];
        $loveStory    = json_decode($contents->get('love_story', '[]'), true) ?? [];
        $lifeJourney  = json_decode($contents->get('life_journey', '[]'), true) ?? [];

        // Gallery — from GalleryPhoto model (general category)
        $gallery = $invitation->galleryPhotos->map(fn($p) => [
            'url'      => asset('storage/' . $p->file_path),
            'category' => $p->category ?? 'general',
            'label'    => $p->title ?? '',
        ])->values()->all();

        // Feature flags & music from invitation_settings table
        $settings     = $invitation->settings;
        $featuresRaw  = $settings?->features ?? [];
        $features     = ! empty($featuresRaw) ? $featuresRaw : null;

        // Music — stored in invitation_settings; music_url may be a storage path
        $rawMusicUrl  = $settings?->music_url ?? '';
        $musicUrl     = $rawMusicUrl
            ? (str_starts_with($rawMusicUrl, 'http') ? $rawMusicUrl : asset('storage/' . $rawMusicUrl))
            : '';
        $musicEnabled  = (bool) ($settings?->music_enabled ?? false);
        $musicAutoplay = (bool) ($settings?->music_autoplay ?? true);
        $musicLoop     = (bool) ($settings?->music_loop ?? true);

        $base = [
            'type'           => $eventType,
            'code'           => $invitation->invitation_code,
            'slug'           => $invitation->slug,
            'title'          => $invitation->title ?? '',
            'guestName'      => $guestName,
            'countdownDate'  => $countdownDatetime,
            'mainDateFormatted' => $mainDateFormatted,
            'events'         => $eventsJs,
            'gallery'        => $gallery,
            'bankAccounts'   => $bankAccounts,
            'digitalWallets' => $wallets,
            'allowComments'  => (bool) $invitation->allow_guest_comments,
            'rsvpEndpoint'   => url("/api/inv/{$invitation->invitation_code}/rsvp"),
            'wishesEndpoint' => url("/api/inv/{$invitation->invitation_code}/wishes"),
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
            $celebrantName = $contents->get('celebrant_name', '');
            $celebrantNick = $contents->get('celebrant_nickname', $celebrantName);

            return array_merge($base, [
                'pageTitle'         => $invitation->title ?: "Birthday Invitation - {$celebrantName}",
                'celebrantName'     => $celebrantName,
                'celebrantNickname' => $celebrantNick,
                'celebrantAge'      => $contents->get('celebrant_age', ''),
                'celebrantBio'      => $contents->get('celebrant_bio', ''),
                'celebrantPhoto'    => $this->resolveContentUrl($invitation, 'celebrant_photo'),
                'parentName'        => $contents->get('parent_name', ''),
                'lifeJourney'       => $lifeJourney,
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
