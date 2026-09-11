<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use App\Services\LandingPageService;
use App\Support\WhatsAppLink;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * A customer with zero invitations gets a focused "start creating" empty
     * state instead of the full account-management dashboard — the two are
     * intentionally different UIs (see customer/onboarding vs
     * customer/dashboard), not the same page with different data.
     */
    public function index(): Response
    {
        $invitations = Invitation::where('user_id', Auth::id())
            ->with(['eventType', 'events'])
            ->withCount('guests')
            ->latest()
            ->get();

        if ($invitations->isEmpty()) {
            return Inertia::render('customer/onboarding', [
                'whatsappHelpLink' => WhatsAppLink::build(
                    LandingPageService::adminWhatsappNumber(),
                    'Halo Admin, saya ingin membuat undangan digital tetapi masih bingung mulai dari mana. Bisa bantu?'
                ),
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        $activeCount = $invitations->where('status', 'active')->count();
        $guestsTotal = $invitations->sum('guests_count');
        $transactionsCount = $user->transactions()->count();

        return Inertia::render('customer/dashboard', [
            'stats' => [
                'invitations_total' => $invitations->count(),
                'invitations_active' => $activeCount,
                'guests_total' => $guestsTotal,
                'transactions_total' => $transactionsCount,
            ],
            'recentInvitations' => $invitations->take(5)->map(fn (Invitation $inv) => [
                'id' => $inv->id,
                'slug' => $inv->slug,
                'title' => $inv->title,
                'status' => $inv->status,
                'event_type_label' => $inv->eventType?->label,
                'first_event_date' => $inv->events->first()?->event_date?->toDateString(),
            ])->values(),
        ]);
    }
}
