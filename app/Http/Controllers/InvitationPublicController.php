<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationPublicController extends Controller
{
    public function show(Request $request, string $code): Response
    {   
        $invitation = Invitation::with([
            'theme',
            'events'         => fn ($q) => $q->orderBy('display_order')->orderBy('event_date'),
            'contents',
            'digitalWallets' => fn ($q) => $q->wherePivot('is_displayed', true)->orderByPivot('display_order'),
        ])
        ->where('invitation_code', $code)
        ->active()
        ->firstOrFail();

        abort_if($invitation->isExpired(), 410, 'Undangan ini sudah tidak aktif.');

        $theme = $invitation->theme;
        abort_if(! $theme, 404, 'Tema undangan tidak tersedia.');

        $guestName = trim((string) $request->query('to', ''));
        $data      = $this->buildData($invitation, $guestName, $theme->event_type);

        return Inertia::render('invitation/show', [
            'invitation' => $data,
            'themeSlug'  => $theme->slug,
        ]);
    }

    private function buildData(Invitation $invitation, string $guestName, string $eventType): array
    {
        $contents = $invitation->contents->pluck('content_value', 'content_key');
        $events   = $invitation->events;

        $firstEvent        = $events->first();
        $mainDate          = $firstEvent && $firstEvent->event_date ? Carbon::parse($firstEvent->event_date) : null;
        $mainDateFormatted = $mainDate ? $this->formatDateId($mainDate) : '';
        $countdownDatetime = $mainDate
            ? $mainDate->format('Y-m-d') . 'T' . ($firstEvent->event_time ?? '08:00:00')
            : '';

        $eventsJs = $events->map(fn ($e) => [
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
        ])->values()->all();

        $wallets = $invitation->digitalWallets->map(fn ($w) => [
            'provider'      => $w->provider ?? '',
            'label'         => $w->provider_label ?? '',
            'accountNumber' => $w->account_number ?? '',
            'accountName'   => $w->account_name ?? '',
            'logoUrl'       => $w->logo_path ? asset('storage/' . $w->logo_path) : '',
        ])->all();

        $bankAccounts = json_decode($contents->get('bank_accounts', '[]'), true) ?? [];
        $gallery      = json_decode($contents->get('gallery', '[]'), true) ?? [];
        $loveStory    = json_decode($contents->get('love_story', '[]'), true) ?? [];
        $lifeJourney  = json_decode($contents->get('life_journey', '[]'), true) ?? [];

        // Feature flags from invitation settings
        $featuresRaw = json_decode($contents->get('features', '{}'), true) ?? [];
        $features    = ! empty($featuresRaw) ? $featuresRaw : null;

        // Music settings
        $musicUrl     = $contents->get('music_url', '');
        $musicAutoplay= (bool) ($contents->get('music_autoplay', false));
        $musicLoop    = (bool) ($contents->get('music_loop', true));

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
        if ($musicUrl) {
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
                'groomPhoto'       => $contents->has('groom_photo') ? asset('storage/' . $contents->get('groom_photo')) : '',
                'brideFullName'    => $brideFull,
                'brideNickname'    => $brideNick,
                'brideInitials'    => $contents->get('bride_initials', strtoupper(substr($brideNick ?: $brideFull, 0, 1))),
                'brideChildOrder'  => $contents->get('bride_child_order', ''),
                'brideFather'      => $contents->get('bride_father', ''),
                'brideMother'      => $contents->get('bride_mother', ''),
                'brideBio'         => $contents->get('bride_bio', ''),
                'bridePhoto'       => $contents->has('bride_photo') ? asset('storage/' . $contents->get('bride_photo')) : '',
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
                'celebrantPhoto'    => $contents->has('celebrant_photo') ? asset('storage/' . $contents->get('celebrant_photo')) : '',
                'parentName'        => $contents->get('parent_name', ''),
                'lifeJourney'       => $lifeJourney,
            ]);
        }

        return array_merge($base, ['pageTitle' => $invitation->title ?? '']);
    }

    private function formatDateId(Carbon $date): string
    {
        $days   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        return $days[$date->dayOfWeek] . ', ' . $date->day . ' ' . $months[$date->month] . ' ' . $date->year;
    }
}
