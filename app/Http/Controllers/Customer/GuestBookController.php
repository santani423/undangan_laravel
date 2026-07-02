<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\SliderPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GuestBookController extends Controller
{
    public function index(Request $request, Invitation $invitation): InertiaResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $query = $invitation->guests()->with('rsvp');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter status kehadiran
        if ($status = $request->input('rsvp_status')) {
            $query->where('rsvp_status', $status);
        }

        // Filter check-in
        if ($request->input('checked_in') === 'yes') {
            $query->whereNotNull('checked_in_at');
        } elseif ($request->input('checked_in') === 'no') {
            $query->whereNull('checked_in_at');
        }

        $guests = $query->latest()->paginate(25)->withQueryString();

        // Statistik
        $stats = $this->buildStats($invitation);

        return Inertia::render('customer/invitations/guest-book/index', [
            'invitation' => [
                'id'    => $invitation->id,
                'slug'  => $invitation->slug,
                'title' => $invitation->title,
                'max_gallery_uploads' => $invitation->package?->max_gallery_uploads,
            ],
            'guests'  => $guests->through(fn ($g) => [
                'id'               => $g->id,
                'name'             => $g->name,
                'slug'             => $g->slug,
                'email'            => $g->email,
                'phone_number'     => $g->phone_number,
                'gender'           => $g->gender,
                'category'         => $g->category,
                'rsvp_status'      => $g->rsvp_status,
                'rsvp_headcount'   => $g->rsvp_headcount,
                'rsvp_notes'       => $g->rsvp_notes,
                'rsvp_submitted_at'=> $g->rsvp_submitted_at?->toDateTimeString(),
                'checked_in_at'    => $g->checked_in_at?->toDateTimeString(),
                'notes'            => $g->notes,
            ]),
            'stats'   => $stats,
            'displaySettings' => $this->displaySettings($invitation),
            'sliderImages' => $invitation->sliderPhotos()
                ->orderBy('display_order')
                ->get()
                ->map(fn (SliderPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->file_path ? Storage::disk('public')->url($photo->file_path) : ($photo->thumbnail_url ?? ''),
                    'display_order' => $photo->display_order,
                ]),
            'filters' => $request->only(['search', 'rsvp_status', 'checked_in']),
        ]);
    }

    public function updateDisplaySettings(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $data = $request->validate([
            'slider_images' => 'nullable|array',
            'slider_images.*.id' => 'nullable|integer',
            'slider_images.*.preview' => 'nullable|string',
            'background_image' => 'nullable|string',
            'background_color' => 'nullable|string|max:20',
            'overlay_color' => 'nullable|string|max:20',
            'overlay_opacity' => 'nullable|numeric|min:0|max:1',
            'slider_enabled' => 'nullable|boolean',
        ]);

        $max = $invitation->package?->max_gallery_uploads;
        $submitted = collect($data['slider_images'] ?? [])->values();
        if ($max !== null && $max > 0) {
            $submitted = $submitted->take($max);
        }

        $existingIds = $submitted
            ->pluck('id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();

        $invitation->sliderPhotos()
            ->when($existingIds, fn ($q) => $q->whereNotIn('id', $existingIds))
            ->delete();

        foreach ($submitted as $index => $item) {
            if (! empty($item['id'])) {
                $invitation->sliderPhotos()
                    ->where('id', (int) $item['id'])
                    ->update(['display_order' => $index, 'is_approved' => true, 'approved_at' => now()]);
                continue;
            }

            $preview = (string) ($item['preview'] ?? '');
            if (str_starts_with($preview, 'data:image/')) {
                SliderPhoto::create([
                    'invitation_id' => $invitation->id,
                    'file_path' => \App\Services\UploadService::uploadBase64Image($preview, "invitations/{$invitation->id}/guest-book/sliders"),
                    'display_order' => $index,
                    'is_approved' => true,
                    'approved_at' => now(),
                ]);
            }
        }

        $backgroundImage = (string) ($data['background_image'] ?? '');
        $oldBackgroundImage = $invitation->contents()->where('content_key', 'guestbook_background_image')->value('content_value');
        if (str_starts_with($backgroundImage, 'data:image/')) {
            $backgroundImage = \App\Services\UploadService::uploadBase64Image($backgroundImage, "invitations/{$invitation->id}/guest-book", $oldBackgroundImage);
        } elseif (str_starts_with($backgroundImage, '/storage/')) {
            $backgroundImage = ltrim(str_replace('/storage/', '', $backgroundImage), '/');
        }

        $settings = [
            'guestbook_background_image' => $backgroundImage,
            'guestbook_background_color' => $data['background_color'] ?? '#f8fafc',
            'guestbook_overlay_color' => $data['overlay_color'] ?? '#000000',
            'guestbook_overlay_opacity' => (string) ($data['overlay_opacity'] ?? '0.35'),
            'guestbook_slider_enabled' => ($data['slider_enabled'] ?? true) ? '1' : '0',
        ];

        foreach ($settings as $key => $value) {
            $invitation->contents()->updateOrCreate(
                ['content_key' => $key],
                ['content_value' => $value, 'content_type' => str_ends_with($key, '_image') ? 'path' : 'text'],
            );
        }

        return back()->with('success', 'Pengaturan Buku Tamu berhasil disimpan.');
    }

    public function operator(Request $request, Invitation $invitation): InertiaResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $status = $request->query('status', '');
        $guests = $invitation->guests()
            ->when($status === 'checked_in', fn ($q) => $q->whereNotNull('checked_in_at'))
            ->when($status === 'not_checked_in', fn ($q) => $q->whereNull('checked_in_at'))
            ->orderByRaw('checked_in_at IS NULL')
            ->orderByDesc('checked_in_at')
            ->orderBy('name')
            ->get();

        return Inertia::render('customer/invitations/guest-book/operator', [
            'invitation' => [
                'id' => $invitation->id,
                'slug' => $invitation->slug,
                'title' => $invitation->title,
            ],
            'stats' => $this->buildStats($invitation),
            'dailyStats' => $this->dailyStats($invitation),
            'guests' => $guests->map(fn (Guest $guest) => $this->guestPayload($guest)),
            'recentScans' => $invitation->guests()
                ->whereNotNull('checked_in_at')
                ->latest('checked_in_at')
                ->limit(10)
                ->get()
                ->map(fn (Guest $guest) => $this->guestPayload($guest)),
            'displaySettings' => $this->displaySettings($invitation),
            'sliderImages' => $invitation->sliderPhotos()
                ->approved()
                ->orderBy('display_order')
                ->get()
                ->map(fn (SliderPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->file_path ? Storage::disk('public')->url($photo->file_path) : ($photo->thumbnail_url ?? ''),
                ]),
            'filters' => ['status' => $status],
        ]);
    }

    public function search(Request $request, Invitation $invitation): JsonResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $search = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', '');
        $phoneSearch = preg_replace('/\D+/', '', $search) ?? '';

        $guests = $invitation->guests()
            ->when($status === 'checked_in', fn ($query) => $query->whereNotNull('checked_in_at'))
            ->when($status === 'not_checked_in', fn ($query) => $query->whereNull('checked_in_at'))
            ->when($search !== '' || $phoneSearch !== '', function ($query) use ($search, $phoneSearch) {
                $query->where(function ($q) use ($search, $phoneSearch) {
                    if ($search !== '') {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('phone_number', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('qr_code_data', 'like', "%{$search}%");
                    }

                    if ($phoneSearch !== '') {
                        $q->orWhereRaw(
                            "REPLACE(REPLACE(REPLACE(REPLACE(phone_number, ' ', ''), '-', ''), '+', ''), '.', '') LIKE ?",
                            ["%{$phoneSearch}%"],
                        );
                    }
                });
            })
            ->orderBy('name')
            ->limit(50)
            ->get()
            ->map(fn (Guest $guest) => $this->guestPayload($guest));

        return response()->json(['guests' => $guests]);
    }

    public function scan(Request $request, Invitation $invitation): JsonResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $data = $request->validate([
            'code' => 'required|string|max:1000',
        ]);

        $code = trim($data['code']);
        $guest = $this->findGuestByCode($invitation, $code);

        if (! $guest) {
            return response()->json(['status' => 'not_found', 'message' => 'QR Code tidak dikenali untuk undangan ini.'], 404);
        }

        if ($guest->checked_in_at) {
            return response()->json([
                'status' => 'already_checked_in',
                'message' => 'Tamu ini sudah check-in sebelumnya.',
                'guest' => $this->guestPayload($guest),
            ], 409);
        }

        $guest->update([
            'checked_in_at' => now(),
            'rsvp_status' => $guest->rsvp_status === 'pending' ? 'attending' : $guest->rsvp_status,
        ]);

        return response()->json([
            'status' => 'checked_in',
            'message' => 'Check-in berhasil.',
            'guest' => $this->guestPayload($guest->fresh()),
            'stats' => $this->buildStats($invitation),
        ]);
    }

    public function manualCheckIn(Invitation $invitation, Guest $guest): JsonResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($guest->invitation_id !== $invitation->id, 404);

        if ($guest->checked_in_at) {
            return response()->json([
                'status' => 'already_checked_in',
                'message' => 'Tamu ini sudah check-in sebelumnya.',
                'guest' => $this->guestPayload($guest),
            ], 409);
        }

        $guest->update([
            'checked_in_at' => now(),
            'rsvp_status' => $guest->rsvp_status === 'pending' ? 'attending' : $guest->rsvp_status,
        ]);

        return response()->json([
            'status' => 'checked_in',
            'message' => 'Check-in manual berhasil.',
            'guest' => $this->guestPayload($guest->fresh()),
            'stats' => $this->buildStats($invitation),
        ]);
    }

    public function checkSlug(Request $request, Invitation $invitation): JsonResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $slug      = $request->query('slug', '');
        $excludeId = $request->query('exclude_id');

        $exists = $invitation->guests()
            ->where('slug', $slug)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->exists();

        return response()->json(['available' => ! $exists]);
    }

    public function store(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $slug = Str::slug($request->input('slug', '')) ?: Str::slug($request->input('name', ''));

        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'gender'       => 'nullable|in:male,female',
            'category'     => 'nullable|string|max:100',
            'notes'        => 'nullable|string|max:500',
        ]);

        if ($slug && $invitation->guests()->where('slug', $slug)->exists()) {
            return back()->withErrors(['slug' => 'Slug sudah digunakan pada undangan ini.'])->withInput();
        }

        $invitation->guests()->create([
            'name'         => $request->name,
            'slug'         => $slug ?: null,
            'email'        => $request->email,
            'phone_number' => $request->phone_number,
            'gender'       => $request->gender,
            'category'     => $request->category,
            'notes'        => $request->notes,
            'rsvp_status'  => 'pending',
        ]);

        return back()->with('success', 'Tamu berhasil ditambahkan.');
    }

    public function update(Request $request, Invitation $invitation, Guest $guest): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($guest->invitation_id !== $invitation->id, 404);

        $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'email'          => 'nullable|email|max:255',
            'phone_number'   => 'nullable|string|max:20',
            'gender'         => 'nullable|in:male,female',
            'category'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:500',
            'rsvp_status'    => 'sometimes|in:pending,attending,not_attending,maybe',
            'rsvp_headcount' => 'nullable|integer|min:0|max:100',
            'checked_in_at'  => 'nullable|date',
        ]);

        if ($request->has('slug')) {
            $slug = Str::slug($request->input('slug', ''));
            if ($slug && $invitation->guests()->where('slug', $slug)->where('id', '!=', $guest->id)->exists()) {
                return back()->withErrors(['slug' => 'Slug sudah digunakan pada undangan ini.'])->withInput();
            }
        }

        $data = $request->only(['name', 'email', 'phone_number', 'gender', 'category', 'notes', 'rsvp_status', 'rsvp_headcount']);

        if ($request->has('slug')) {
            $data['slug'] = Str::slug($request->input('slug', '')) ?: null;
        }

        if ($request->has('checked_in_at')) {
            $data['checked_in_at'] = $request->checked_in_at ? now() : null;
        }

        $guest->update($data);

        return back()->with('success', 'Data tamu berhasil diperbarui.');
    }

    public function checkIn(Invitation $invitation, Guest $guest): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($guest->invitation_id !== $invitation->id, 404);

        $guest->update(['checked_in_at' => $guest->checked_in_at ? null : now()]);

        $msg = $guest->checked_in_at ? 'Tamu berhasil di-check in.' : 'Check-in tamu dibatalkan.';

        return back()->with('success', $msg);
    }

    public function destroy(Invitation $invitation, Guest $guest): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($guest->invitation_id !== $invitation->id, 404);

        $guest->delete();

        return back()->with('success', 'Tamu berhasil dihapus.');
    }

    public function export(Invitation $invitation): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        return $this->exportSpreadsheet($invitation, 'csv');
    }

    public function exportExcel(Request $request, Invitation $invitation): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        return $this->exportSpreadsheet($invitation, 'xls', $request->query('status', ''));
    }

    public function exportPdf(Request $request, Invitation $invitation): \Illuminate\Http\Response
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $status = $request->query('status', '');
        $guests = $this->attendanceQuery($invitation, $status)->orderBy('name')->get();

        $rows = $guests->map(fn (Guest $guest, int $i) => sprintf(
            '<tr><td>%d</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
            $i + 1,
            e($guest->name),
            e($guest->phone_number ?? ''),
            e($guest->slug ?? ''),
            e((string) ($guest->rsvp_headcount ?? 1)),
            e($guest->checked_in_at?->format('d/m/Y H:i') ?? 'Belum hadir'),
        ))->implode('');

        $html = '<!doctype html><html><head><meta charset="utf-8"><title>Laporan Buku Tamu</title>'
            . '<style>body{font-family:Arial,sans-serif;color:#111827;padding:28px}h1{margin:0 0 6px;font-size:22px}p{margin:0 0 18px;color:#6b7280}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#f3f4f6}.print{margin-bottom:18px}@media print{.print{display:none}}</style>'
            . '</head><body><button class="print" onclick="window.print()">Print / Save PDF</button>'
            . '<h1>Laporan Buku Tamu</h1><p>' . e($invitation->title) . ' - ' . now()->format('d/m/Y H:i') . '</p>'
            . '<table><thead><tr><th>No</th><th>Nama</th><th>WhatsApp</th><th>Kode</th><th>Jumlah</th><th>Check-in</th></tr></thead><tbody>'
            . $rows
            . '</tbody></table></body></html>';

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    private function exportSpreadsheet(Invitation $invitation, string $format, string $status = ''): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $guests = $this->attendanceQuery($invitation, $status)->orderBy('name')->get();

        $headers = [
            'Content-Type'        => $format === 'xls' ? 'application/vnd.ms-excel; charset=UTF-8' : 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"buku-tamu-{$invitation->slug}.{$format}\"",
        ];

        $callback = function () use ($guests) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['No', 'Nama', 'Email', 'No HP', 'Jenis Kelamin', 'Kategori', 'Status RSVP', 'Jumlah Tamu', 'Catatan RSVP', 'Check-in', 'Catatan']);

            $statusMap = [
                'pending'          => 'Belum Konfirmasi',
                'attending'        => 'Hadir',
                'not_attending'    => 'Tidak Hadir',
                'maybe'            => 'Masih Ragu',
            ];

            foreach ($guests as $i => $guest) {
                fputcsv($handle, [
                    $i + 1,
                    $guest->name,
                    $guest->email ?? '',
                    $guest->phone_number ?? '',
                    $guest->gender === 'male' ? 'Laki-laki' : ($guest->gender === 'female' ? 'Perempuan' : ''),
                    $guest->category ?? '',
                    $statusMap[$guest->rsvp_status] ?? $guest->rsvp_status,
                    $guest->rsvp_headcount ?? 1,
                    $guest->rsvp_notes ?? '',
                    $guest->checked_in_at ? $guest->checked_in_at->format('d/m/Y H:i') : '',
                    $guest->notes ?? '',
                ]);
            }

            fclose($handle);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function attendanceQuery(Invitation $invitation, string $status = '')
    {
        return $invitation->guests()
            ->when($status === 'checked_in', fn ($q) => $q->whereNotNull('checked_in_at'))
            ->when($status === 'not_checked_in', fn ($q) => $q->whereNull('checked_in_at'));
    }

    private function buildStats(Invitation $invitation): array
    {
        $guests = $invitation->guests;

        $total       = $guests->count();
        $attending   = $guests->where('rsvp_status', 'attending')->count();
        $notAttending= $guests->where('rsvp_status', 'not_attending')->count();
        $maybe       = $guests->where('rsvp_status', 'maybe')->count();
        $pending     = $guests->where('rsvp_status', 'pending')->count();
        $checkedIn   = $guests->whereNotNull('checked_in_at')->count();
        $totalHeads  = $guests->where('rsvp_status', 'attending')->sum('rsvp_headcount') ?: $attending;

        return compact('total', 'attending', 'notAttending', 'maybe', 'pending', 'checkedIn', 'totalHeads');
    }

    private function dailyStats(Invitation $invitation): array
    {
        return $invitation->guests()
            ->whereNotNull('checked_in_at')
            ->orderBy('checked_in_at')
            ->get()
            ->groupBy(fn (Guest $guest) => $guest->checked_in_at?->format('Y-m-d') ?? '-')
            ->map(fn ($rows, $date) => [
                'date' => $date,
                'label' => $date === '-' ? '-' : \Carbon\Carbon::parse($date)->translatedFormat('d M Y'),
                'count' => $rows->count(),
                'heads' => $rows->sum(fn (Guest $guest) => $guest->rsvp_headcount ?? 1),
            ])
            ->values()
            ->all();
    }

    private function guestPayload(Guest $guest): array
    {
        return [
            'id' => $guest->id,
            'name' => $guest->name,
            'slug' => $guest->slug,
            'phone_number' => $guest->phone_number,
            'category' => $guest->category,
            'rsvp_status' => $guest->rsvp_status,
            'rsvp_headcount' => $guest->rsvp_headcount ?? 1,
            'checked_in_at' => $guest->checked_in_at?->toDateTimeString(),
            'qr_code_data' => $guest->qr_code_data,
            'notes' => $guest->notes,
        ];
    }

    private function displaySettings(Invitation $invitation): array
    {
        $contents = $invitation->contents()->whereIn('content_key', [
            'guestbook_background_image',
            'guestbook_background_color',
            'guestbook_overlay_color',
            'guestbook_overlay_opacity',
            'guestbook_slider_enabled',
        ])->get()->keyBy('content_key');

        $background = $contents->get('guestbook_background_image')?->content_value ?? '';

        return [
            'background_image' => $background ? Storage::disk('public')->url($background) : '',
            'background_color' => $contents->get('guestbook_background_color')?->content_value ?? '#f8fafc',
            'overlay_color' => $contents->get('guestbook_overlay_color')?->content_value ?? '#000000',
            'overlay_opacity' => (float) ($contents->get('guestbook_overlay_opacity')?->content_value ?? 0.35),
            'slider_enabled' => ($contents->get('guestbook_slider_enabled')?->content_value ?? '1') !== '0',
        ];
    }

    private function findGuestByCode(Invitation $invitation, string $code): ?Guest
    {
        $parts = parse_url($code);
        if (! empty($parts['path'])) {
            $segments = array_values(array_filter(explode('/', $parts['path'])));
            $code = end($segments) ?: $code;
        }

        return $invitation->guests()
            ->where(function ($query) use ($code) {
                $query->where('qr_code_data', $code)
                    ->orWhere('slug', $code)
                    ->orWhere('qr_code_url', $code);
            })
            ->first();
    }


}
