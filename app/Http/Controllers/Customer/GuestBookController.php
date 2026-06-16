<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
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
            ],
            'guests'  => $guests->through(fn ($g) => [
                'id'               => $g->id,
                'name'             => $g->name,
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
            'filters' => $request->only(['search', 'rsvp_status', 'checked_in']),
        ]);
    }

    public function store(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'gender'       => 'nullable|in:male,female',
            'category'     => 'nullable|string|max:100',
            'notes'        => 'nullable|string|max:500',
        ]);

        $invitation->guests()->create([
            'name'         => $request->name,
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

        $data = $request->only(['name', 'email', 'phone_number', 'gender', 'category', 'notes', 'rsvp_status', 'rsvp_headcount']);

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

        $guests = $invitation->guests()->orderBy('name')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"buku-tamu-{$invitation->slug}.csv\"",
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
}
