<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationPublicApiController extends Controller
{
    private function findActive(string $code): Invitation
    {
        $inv = Invitation::where('invitation_code', $code)
            ->where('status', 'active')
            ->first();

        abort_if(! $inv, 404, 'Undangan tidak ditemukan.');

        return $inv;
    }

    /** POST /api/inv/{code}/rsvp */
    public function rsvp(Request $request, string $code): JsonResponse
    {
        $invitation = $this->findActive($code);

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'phone_number'     => 'nullable|string|max:30',
            'number_of_guests' => 'nullable|integer|min:1|max:50',
            'rsvp_status'      => 'nullable|in:attending,not_attending,maybe',
            'message'          => 'nullable|string|max:1000',
            'guest_slug'       => 'nullable|string|max:255',
        ]);

        // If guest_slug provided, update the existing guest record
        $guest = null;
        if (! empty($data['guest_slug'])) {
            $guest = Guest::where('invitation_id', $invitation->id)
                ->where('slug', $data['guest_slug'])
                ->first();
        }

        if ($guest) {
            $guest->update([
                'phone_number'      => $data['phone_number'] ?? $guest->phone_number,
                'rsvp_headcount'    => $data['number_of_guests'] ?? $guest->rsvp_headcount,
                'rsvp_status'       => $data['rsvp_status'] ?? 'attending',
                'message'        => $data['message'] ?? null,
                'rsvp_submitted_at' => now(),
            ]);
        } else {
            $guest = Guest::create([
                'invitation_id'     => $invitation->id,
                'name'              => $data['name'],
                'phone_number'      => $data['phone_number'] ?? null,
                'rsvp_headcount'    => $data['number_of_guests'] ?? 1,
                'rsvp_status'       => $data['rsvp_status'] ?? 'attending',
                'message'        => $data['message'] ?? null,
                'rsvp_submitted_at' => now(),
            ]);
        }

        if (! empty($data['message']) && $invitation->allow_guest_comments) {
            Comment::create([
                'invitation_id' => $invitation->id,
                'guest_name'    => $data['name'],
                'comment_text'  => $data['message'],
                'status'        => 'pending',
            ]);
        }

        return response()->json(['success' => true, 'guest_id' => $guest->id], 201);
    }

    /**
     * GET /api/inv/{code}/wishes
     *
     * Supports pagination via ?page= query param (10 items per page).
     */
    public function wishes(Request $request, string $code): JsonResponse
    {
        $invitation = $this->findActive($code);
        $page       = max(1, (int) $request->query('page', 1));
        $perPage    = 10;

        $comments = Comment::where('invitation_id', $invitation->id)
            ->where('status', 'approved')
            ->orderByDesc('approved_at')
            ->paginate($perPage, ['id', 'guest_name', 'comment_text', 'approved_at'], 'page', $page);

        $wishes = collect($comments->items())->map(fn ($c) => [
            'name'    => $c->guest_name,
            'message' => $c->comment_text,
            'date'    => $c->approved_at ? $c->approved_at->diffForHumans() : '',
        ]);

        return response()->json([
            'wishes'       => $wishes,
            'current_page' => $comments->currentPage(),
            'last_page'    => $comments->lastPage(),
            'total'        => $comments->total(),
        ]);
    }

    /** POST /api/inv/{code}/wishes */
    public function submitWish(Request $request, string $code): JsonResponse
    {
        $invitation = $this->findActive($code);

        abort_if(! $invitation->allow_guest_comments, 403, 'Ucapan tidak diaktifkan untuk undangan ini.');

        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        Comment::create([
            'invitation_id' => $invitation->id,
            'guest_name'    => $data['name'],
            'comment_text'  => $data['message'],
            'status'        => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ucapan berhasil dikirim dan menunggu persetujuan.',
        ], 201);
    }
}
