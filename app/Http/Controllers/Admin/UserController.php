<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Invitation;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->withTrashed()
            ->with('roles:id,name')
            ->withCount(['invitations', 'transactions'])
            ->latest()
            ->get();

        $items = $users->map(fn (User $user) => [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'phone_number'      => $user->phone_number,
            'is_active'         => (bool) $user->is_active,
            'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
            'deleted_at'        => $user->deleted_at?->toDateTimeString(),
            'created_at'        => $user->created_at->toDateTimeString(),
            'roles'             => $user->roles->pluck('name')->values(),
            'invitations_count' => (int) $user->invitations_count,
            'transactions_count' => (int) $user->transactions_count,
        ])->values();

        return Inertia::render('admin/users/index', [
            'users'   => $items,
            'summary' => [
                'total'      => $items->count(),
                'active'     => $items->where('is_active', true)->where('deleted_at', null)->count(),
                'inactive'   => $items->where('is_active', false)->where('deleted_at', null)->count(),
                'suspended'  => $items->whereNotNull('deleted_at')->count(),
                'unverified' => $items->whereNull('email_verified_at')->count(),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->loadMissing('roles:id,name', 'profile');

        $invitations = $user->invitations()
            ->withTrashed()
            ->with([
                'eventType:id,name,label',
                'package:id,name,label',
                'theme:id,name',
            ])
            ->withCount(['guests', 'rsvps', 'comments'])
            ->latest()
            ->get()
            ->map(fn (Invitation $invitation) => [
                'id'                    => $invitation->id,
                'slug'                  => $invitation->slug,
                'invitation_code'       => $invitation->invitation_code,
                'title'                 => $invitation->title,
                'description'           => $invitation->description,
                'status'                => $invitation->status,
                'is_public'             => (bool) $invitation->is_public,
                'requires_password'     => (bool) $invitation->requires_password,
                'custom_domain'         => $invitation->custom_domain,
                'allow_guest_comments'  => (bool) $invitation->allow_guest_comments,
                'allow_guest_plus_one'  => (bool) $invitation->allow_guest_plus_one,
                'max_guests_plus_one'   => (int) $invitation->max_guests_plus_one,
                'activated_at' => $invitation->activated_at?->toDateTimeString(),
                'expires_at'   => $invitation->expires_at?->toDateTimeString(),
                'created_at'   => $invitation->created_at->toDateTimeString(),
                'updated_at'   => $invitation->updated_at->toDateTimeString(),
                'deleted_at'   => $invitation->deleted_at?->toDateTimeString(),
                'event_type'   => $invitation->eventType?->label ?? $invitation->eventType?->name,
                'package'      => $invitation->package ? [
                    'name'  => $invitation->package->name,
                    'label' => $invitation->package->label,
                ] : null,
                'theme'        => $invitation->theme?->name,
                'guests_count'   => (int) $invitation->guests_count,
                'rsvps_count'    => (int) $invitation->rsvps_count,
                'comments_count' => (int) $invitation->comments_count,
            ])
            ->values();

        $transactions = $user->transactions()
            ->with([
                'invitation:id,slug,title',
                'package:id,name,label',
            ])
            ->withCount('payments')
            ->latest()
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id'               => $transaction->id,
                'invoice_number'   => $transaction->invoice_number,
                'invoice_amount'   => (float) $transaction->invoice_amount,
                'invoice_currency' => $transaction->invoice_currency,
                'status'           => $transaction->status,
                'due_date'         => $transaction->due_date?->toDateString(),
                'paid_at'          => $transaction->paid_at?->toDateTimeString(),
                'created_at'       => $transaction->created_at->toDateTimeString(),
                'payments_count'   => (int) $transaction->payments_count,
                'invitation'       => $transaction->invitation ? [
                    'slug'  => $transaction->invitation->slug,
                    'title' => $transaction->invitation->title,
                ] : null,
                'package'          => $transaction->package ? [
                    'name'  => $transaction->package->name,
                    'label' => $transaction->package->label,
                ] : null,
            ])
            ->values();

        $activityLogs = $user->activityLogs()
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id'         => $log->id,
                'action'     => $log->action,
                'model_type' => $log->model_type,
                'model_id'   => $log->model_id,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('admin/users/show', [
            'user' => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'phone_number'      => $user->phone_number,
                'is_active'         => (bool) $user->is_active,
                'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
                'deleted_at'        => $user->deleted_at?->toDateTimeString(),
                'created_at'        => $user->created_at->toDateTimeString(),
                'updated_at'        => $user->updated_at->toDateTimeString(),
                'roles'             => $user->roles->pluck('name')->values(),
                'profile'           => $user->profile ? [
                    'language'          => $user->profile->language,
                    'timezone'          => $user->profile->timezone,
                    'bio'               => $user->profile->bio,
                    'profile_photo_url' => $user->profile->profile_photo_url,
                ] : null,
            ],
            'invitations' => $invitations,
            'transactions' => $transactions,
            'activityLogs' => $activityLogs,
            'summary' => [
                'invitations_total'  => $invitations->count(),
                'invitations_active' => $invitations->where('status', 'active')->count(),
                'transactions_total' => $transactions->count(),
                'transactions_paid_amount' => $transactions->where('status', 'paid')->sum('invoice_amount'),
                'activity_logs_total' => $activityLogs->count(),
            ],
        ]);
    }
}
