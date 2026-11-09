<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Invitation;
use App\Models\User;
use App\Services\LandingPageService;
use App\Support\WhatsAppLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * A customer with zero invitations gets a focused "start creating" empty
     * state instead of the full account-management dashboard — the two are
     * intentionally different UIs (see customer/onboarding vs
     * customer/dashboard), not the same page with different data.
     */
    public function index(): JsonResponse
    {
        $invitations = Invitation::where('user_id', Auth::id())
            ->with(['eventType', 'events'])
            ->withCount('guests')
            ->latest()
            ->get();

        if ($invitations->isEmpty()) {
            return ApiResponse::ok([
                // Which SPA page to render: customer/onboarding or customer/dashboard.
                'view' => 'onboarding',
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

        return ApiResponse::ok([
            'view' => 'dashboard',
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
