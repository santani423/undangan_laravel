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
        ]);

        $guest = Guest::create([
            'invitation_id'    => $invitation->id,
            'name'             => $data['name'],
            'phone_number'     => $data['phone_number'] ?? null,
            'rsvp_headcount'   => $data['number_of_guests'] ?? 1,
            'rsvp_status'      => $data['rsvp_status'] ?? 'attending',
            'rsvp_notes'       => $data['message'] ?? null,
            'rsvp_submitted_at'=> now(),
        ]);

        // If message included, also save as a comment/wish
        if (! empty($data['message']) && $invitation->allow_guest_comments) {
            Comment::create([
                'invitation_id' => $invitation->id,
                'author_name'   => $data['name'],
                'content'       => $data['message'],
                'status'        => 'pending',
            ]);
        }

        return response()->json(['success' => true, 'guest_id' => $guest->id], 201);
    }

    /** GET /api/inv/{code}/wishes */
    public function wishes(string $code): JsonResponse
    {
        $invitation = $this->findActive($code);

        $comments = Comment::where('invitation_id', $invitation->id)
            ->where('status', 'approved')
            ->orderByDesc('approved_at')
            ->limit(50)
            ->get(['id', 'author_name', 'content', 'approved_at'])
            ->map(fn ($c) => [
                'name'    => $c->author_name,
                'message' => $c->content,
                'date'    => $c->approved_at ? $c->approved_at->diffForHumans() : '',
            ]);

        return response()->json(['wishes' => $comments]);
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
            'author_name'   => $data['name'],
            'content'       => $data['message'],
            'status'        => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Ucapan berhasil dikirim dan menunggu persetujuan.'], 201);
    }
}
