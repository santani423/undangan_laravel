<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvitationPublicController extends Controller
{
    /** Mapping theme event_type → public/themes sub-directory */
    private const THEME_FOLDERS = [
        'wedding'   => 'Pernikahan',
        'birthday'  => 'ulang_tahun',
        'khitan'    => 'khitanan',
        'aqiqah'    => 'aqiqah',
        'selamatan' => 'selamatan',
        'event'     => 'event',
    ];

    public function show(Request $request, string $code): Response
    {
        $invitation = Invitation::with([
            'theme',
            'events'        => fn ($q) => $q->orderBy('display_order')->orderBy('event_date'),
            'contents',
            'digitalWallets'=> fn ($q) => $q->wherePivot('is_displayed', true)->orderByPivot('display_order'),
        ])
            ->where('invitation_code', $code)
            ->where('status', 'active')
            ->first();

        if (! $invitation) {
            abort(404, 'Undangan tidak ditemukan atau sudah tidak aktif.');
        }

        $theme = $invitation->theme;
        if (! $theme) {
            abort(404, 'Tema undangan tidak tersedia.');
        }

        $folder = self::THEME_FOLDERS[$theme->event_type] ?? null;
        if (! $folder) {
            abort(404, 'Jenis tema tidak dikenali.');
        }

        $themePath = public_path("themes/{$folder}/{$theme->slug}/index.html");
        if (! file_exists($themePath)) {
            abort(404, 'File tema tidak ditemukan di server.');
        }

        $guestName = trim((string) $request->query('to', ''));
        $data      = $this->buildData($invitation, $guestName, $theme->event_type);

        $html = file_get_contents($themePath);
        $html = $this->injectData($html, $data, $theme->event_type);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function buildData(Invitation $invitation, string $guestName, string $eventType): array
    {
        $contents = $invitation->contents->pluck('content_value', 'content_key');
        $events   = $invitation->events;

        $firstEvent         = $events->first();
        $mainDate           = $firstEvent && $firstEvent->event_date ? Carbon::parse($firstEvent->event_date) : null;
        $mainDateFormatted  = $mainDate ? $this->formatDateId($mainDate) : '';
        $countdownDatetime  = $mainDate
            ? $mainDate->format('Y-m-d') . 'T' . ($firstEvent->event_time ?? '08:00:00')
            : '';

        // Events for JS
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

        // Digital wallets from pivot
        $wallets = $invitation->digitalWallets->map(fn ($w) => [
            'provider'      => $w->provider ?? '',
            'label'         => $w->provider_label ?? '',
            'accountNumber' => $w->account_number ?? '',
            'accountName'   => $w->account_name ?? '',
            'logoUrl'       => $w->logo_path ? asset('storage/' . $w->logo_path) : '',
        ])->all();

        // Bank accounts stored as JSON in invitation_contents
        $bankAccounts = json_decode($contents->get('bank_accounts', '[]'), true) ?? [];

        // Gallery & love story / life journey from invitation_contents
        $gallery     = json_decode($contents->get('gallery', '[]'), true) ?? [];
        $loveStory   = json_decode($contents->get('love_story', '[]'), true) ?? [];
        $lifeJourney = json_decode($contents->get('life_journey', '[]'), true) ?? [];

        $base = [
            'type'           => $eventType,
            'code'           => $invitation->invitation_code,
            'slug'           => $invitation->slug,
            'title'          => $invitation->title ?? '',
            'guestName'      => $guestName,
            'countdownDate'  => $countdownDatetime,
            'events'         => $eventsJs,
            'gallery'        => $gallery,
            'bankAccounts'   => $bankAccounts,
            'digitalWallets' => $wallets,
            'allowComments'  => (bool) $invitation->allow_guest_comments,
            'rsvpEndpoint'   => url("/api/inv/{$invitation->invitation_code}/rsvp"),
            'wishesEndpoint' => url("/api/inv/{$invitation->invitation_code}/wishes"),
        ];

        if ($eventType === 'wedding') {
            $groomNick = $contents->get('groom_nickname', '');
            $brideNick = $contents->get('bride_nickname', '');
            $groomFull = $contents->get('groom_full_name', 'Mempelai Pria');
            $brideFull = $contents->get('bride_full_name', 'Mempelai Wanita');

            return array_merge($base, [
                'pageTitle'        => $invitation->title ?: "The Wedding of {$groomFull} & {$brideFull}",
                'mainDateFormatted'=> $mainDateFormatted,
                'groomFullName'    => $groomFull,
                'groomNickname'    => $groomNick,
                'groomInitials'    => $contents->get('groom_initials', strtoupper(substr($groomNick, 0, 1))),
                'groomChildOrder'  => $contents->get('groom_child_order', ''),
                'groomFather'      => $contents->get('groom_father', ''),
                'groomMother'      => $contents->get('groom_mother', ''),
                'groomBio'         => $contents->get('groom_bio', ''),
                'groomPhoto'       => $contents->has('groom_photo') ? asset('storage/' . $contents->get('groom_photo')) : '',
                'brideFullName'    => $brideFull,
                'brideNickname'    => $brideNick,
                'brideInitials'    => $contents->get('bride_initials', strtoupper(substr($brideNick, 0, 1))),
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
                'pageTitle'          => $invitation->title ?: "Birthday Invitation - {$celebrantName}",
                'mainDateFormatted'  => $mainDateFormatted,
                'celebrantName'      => $celebrantName,
                'celebrantNickname'  => $celebrantNick,
                'celebrantAge'       => $contents->get('celebrant_age', ''),
                'celebrantBio'       => $contents->get('celebrant_bio', ''),
                'celebrantPhoto'     => $contents->has('celebrant_photo') ? asset('storage/' . $contents->get('celebrant_photo')) : '',
                'parentName'         => $contents->get('parent_name', ''),
                'lifeJourney'        => $lifeJourney,
            ]);
        }

        return array_merge($base, ['pageTitle' => $invitation->title ?? '']);
    }

    private function injectData(string $html, array $data, string $eventType): string
    {
        // 1. Inject window.__INVITATION__ JSON before </head>
        $json   = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $script = "\n<script>window.__INVITATION__ = {$json};</script>\n";
        $html   = str_replace('</head>', $script . '</head>', $html);

        // 2. Static string placeholders
        $ph = [
            '{{PAGE_TITLE}}'      => htmlspecialchars($data['pageTitle']    ?? '', ENT_QUOTES),
            '{{GUEST_NAME}}'      => htmlspecialchars($data['guestName']    ?? '', ENT_QUOTES),
            '{{MAIN_EVENT_DATE}}' => htmlspecialchars($data['mainDateFormatted'] ?? '', ENT_QUOTES),
            '{{OVERLAY_DATE}}'    => htmlspecialchars($data['mainDateFormatted'] ?? '', ENT_QUOTES),
        ];

        if ($eventType === 'wedding') {
            $ph += [
                '{{GROOM_FULL_NAME}}'    => htmlspecialchars($data['groomFullName']   ?? '', ENT_QUOTES),
                '{{GROOM_NICKNAME}}'     => htmlspecialchars($data['groomNickname']   ?? '', ENT_QUOTES),
                '{{GROOM_INITIALS}}'     => htmlspecialchars($data['groomInitials']   ?? '', ENT_QUOTES),
                '{{GROOM_CHILD_ORDER}}'  => htmlspecialchars($data['groomChildOrder'] ?? '', ENT_QUOTES),
                '{{GROOM_FATHER}}'       => htmlspecialchars($data['groomFather']     ?? '', ENT_QUOTES),
                '{{GROOM_MOTHER}}'       => htmlspecialchars($data['groomMother']     ?? '', ENT_QUOTES),
                '{{GROOM_BIO}}'          => htmlspecialchars($data['groomBio']        ?? '', ENT_QUOTES),
                '{{BRIDE_FULL_NAME}}'    => htmlspecialchars($data['brideFullName']   ?? '', ENT_QUOTES),
                '{{BRIDE_NICKNAME}}'     => htmlspecialchars($data['brideNickname']   ?? '', ENT_QUOTES),
                '{{BRIDE_INITIALS}}'     => htmlspecialchars($data['brideInitials']   ?? '', ENT_QUOTES),
                '{{BRIDE_CHILD_ORDER}}'  => htmlspecialchars($data['brideChildOrder'] ?? '', ENT_QUOTES),
                '{{BRIDE_FATHER}}'       => htmlspecialchars($data['brideFather']     ?? '', ENT_QUOTES),
                '{{BRIDE_MOTHER}}'       => htmlspecialchars($data['brideMother']     ?? '', ENT_QUOTES),
                '{{BRIDE_BIO}}'          => htmlspecialchars($data['brideBio']        ?? '', ENT_QUOTES),
                '{{CLOSING_GROOM}}'      => htmlspecialchars($data['groomNickname']   ?? '', ENT_QUOTES),
                '{{CLOSING_BRIDE}}'      => htmlspecialchars($data['brideNickname']   ?? '', ENT_QUOTES),
                '{{GROOM_FAMILY}}'       => htmlspecialchars(
                    trim(($data['groomFather'] ?? '') . ' & ' . ($data['groomMother'] ?? ''), ' &'), ENT_QUOTES
                ),
                '{{BRIDE_FAMILY}}'       => htmlspecialchars(
                    trim(($data['brideFather'] ?? '') . ' & ' . ($data['brideMother'] ?? ''), ' &'), ENT_QUOTES
                ),
            ];
        }

        if ($eventType === 'birthday') {
            $ph += [
                '{{CELEBRANT_NAME}}'     => htmlspecialchars($data['celebrantName']     ?? '', ENT_QUOTES),
                '{{CELEBRANT_NICKNAME}}' => htmlspecialchars($data['celebrantNickname'] ?? '', ENT_QUOTES),
                '{{CELEBRANT_AGE}}'      => htmlspecialchars($data['celebrantAge']      ?? '', ENT_QUOTES),
                '{{PARENT_NAME}}'        => htmlspecialchars($data['parentName']         ?? '', ENT_QUOTES),
            ];
        }

        return str_replace(array_keys($ph), array_values($ph), $html);
    }

    private function formatDateId(Carbon $date): string
    {
        $days   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        return $days[$date->dayOfWeek] . ', ' . $date->day . ' ' . $months[$date->month] . ' ' . $date->year;
    }
}
