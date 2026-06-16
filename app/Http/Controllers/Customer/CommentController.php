<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function index(Request $request, Invitation $invitation): Response
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $query = $invitation->comments()->with('guest');

        // Search nama
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('guest_name', 'like', "%{$search}%")
                  ->orWhere('guest_email', 'like', "%{$search}%")
                  ->orWhere('comment_text', 'like', "%{$search}%");
            });
        }

        // Filter status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter flagged
        if ($request->input('flagged') === 'yes') {
            $query->where('is_flagged', true);
        }

        // Filter tanggal
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $comments = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total'    => $invitation->comments()->count(),
            'approved' => $invitation->comments()->where('status', 'approved')->count(),
            'pending'  => $invitation->comments()->where('status', 'pending')->count(),
            'rejected' => $invitation->comments()->where('status', 'rejected')->count(),
            'flagged'  => $invitation->comments()->where('is_flagged', true)->count(),
        ];

        return Inertia::render('customer/invitations/comments/index', [
            'invitation' => [
                'id'    => $invitation->id,
                'slug'  => $invitation->slug,
                'title' => $invitation->title,
            ],
            'comments' => $comments->through(fn ($c) => [
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
            'stats'   => $stats,
            'filters' => $request->only(['search', 'status', 'flagged', 'date_from', 'date_to']),
        ]);
    }

    public function approve(Invitation $invitation, Comment $comment): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($comment->invitation_id !== $invitation->id, 404);

        $comment->update([
            'status'              => 'approved',
            'approved_at'         => now(),
            'approved_by_user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Komentar berhasil ditampilkan.');
    }

    public function reject(Invitation $invitation, Comment $comment): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($comment->invitation_id !== $invitation->id, 404);

        $comment->update([
            'status'      => 'rejected',
            'approved_at' => null,
        ]);

        return back()->with('success', 'Komentar berhasil disembunyikan.');
    }

    public function flag(Request $request, Invitation $invitation, Comment $comment): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($comment->invitation_id !== $invitation->id, 404);

        $request->validate(['reason' => 'nullable|string|max:255']);

        $comment->update([
            'is_flagged'  => !$comment->is_flagged,
            'flag_reason' => !$comment->is_flagged ? $request->reason : null,
        ]);

        return back()->with('success', $comment->is_flagged ? 'Komentar ditandai.' : 'Tanda komentar dihapus.');
    }

    public function destroy(Invitation $invitation, Comment $comment): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);
        abort_if($comment->invitation_id !== $invitation->id, 404);

        $comment->delete();

        return back()->with('success', 'Komentar berhasil dihapus.');
    }

    public function bulkAction(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $request->validate([
            'action' => 'required|in:approve,reject,delete',
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer',
        ]);

        $comments = $invitation->comments()->whereIn('id', $request->ids);

        match ($request->action) {
            'approve' => $comments->update(['status' => 'approved', 'approved_at' => now(), 'approved_by_user_id' => auth()->id()]),
            'reject'  => $comments->update(['status' => 'rejected', 'approved_at' => null]),
            'delete'  => $comments->delete(),
        };

        return back()->with('success', 'Aksi berhasil diterapkan pada ' . count($request->ids) . ' komentar.');
    }
}
