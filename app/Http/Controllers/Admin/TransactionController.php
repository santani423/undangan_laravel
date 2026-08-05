<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        $transactions = Transaction::query()
            ->with([
                'user' => fn ($query) => $query->withTrashed()->select('id', 'name', 'email', 'phone_number'),
                'invitation:id,user_id,slug,title,status',
                'package:id,name,label',
            ])
            ->withCount('payments')
            ->latest()
            ->get();

        $items = $transactions->map(fn (Transaction $transaction) => [
            'id'               => $transaction->id,
            'invoice_number'   => $transaction->invoice_number,
            'invoice_amount'   => (float) $transaction->invoice_amount,
            'invoice_currency' => $transaction->invoice_currency,
            'status'           => $transaction->status,
            'due_date'         => $transaction->due_date?->toDateString(),
            'paid_at'          => $transaction->paid_at?->toDateTimeString(),
            'created_at'       => $transaction->created_at->toDateTimeString(),
            'payments_count'   => (int) $transaction->payments_count,
            'customer'         => $transaction->user ? [
                'id'           => $transaction->user->id,
                'name'         => $transaction->user->name,
                'email'        => $transaction->user->email,
                'phone_number' => $transaction->user->phone_number,
            ] : null,
            'invitation'       => $transaction->invitation ? [
                'id'     => $transaction->invitation->id,
                'slug'   => $transaction->invitation->slug,
                'title'  => $transaction->invitation->title,
                'status' => $transaction->invitation->status,
            ] : null,
            'package'          => $transaction->package ? [
                'id'    => $transaction->package->id,
                'name'  => $transaction->package->name,
                'label' => $transaction->package->label,
            ] : null,
        ])->values();

        return Inertia::render('admin/transactions/index', [
            'transactions' => $items,
            'summary'      => [
                'total'         => $items->count(),
                'pending'       => $items->where('status', 'pending')->count(),
                'paid'          => $items->where('status', 'paid')->count(),
                'failed'        => $items->whereIn('status', ['failed', 'cancelled', 'expired'])->count(),
                'customers'     => $items->pluck('customer.id')->filter()->unique()->count(),
                'paid_revenue'  => $items->where('status', 'paid')->sum('invoice_amount'),
            ],
        ]);
    }

    public function approve(Transaction $transaction): RedirectResponse
    {
        $transaction->load(['invitation', 'package']);

        if (! $transaction->invitation) {
            return back()->with('error', 'Transaksi ini tidak memiliki undangan yang bisa diaktifkan.');
        }

        DB::transaction(function () use ($transaction) {
            $now = now();

            $transaction->update([
                'status'  => 'paid',
                'paid_at' => $transaction->paid_at ?? $now,
            ]);

            $updatedPayments = $transaction->payments()
                ->whereIn('status', ['pending', 'processing'])
                ->update([
                    'status'              => 'success',
                    'webhook_verified_at' => $now,
                ]);

            if ($updatedPayments === 0 && ! $transaction->payments()->where('status', 'success')->exists()) {
                $transaction->payments()->firstOrCreate(
                    ['gateway_reference_id' => "manual-approve-{$transaction->id}"],
                    [
                        'payment_gateway' => 'manual',
                        'amount'          => $transaction->invoice_amount,
                        'currency'        => $transaction->invoice_currency,
                        'status'          => 'success',
                    ],
                );
            }

            if ($transaction->invitation->status !== 'active') {
                $days = $transaction->package?->duration_days ?? 365;

                $transaction->invitation->update([
                    'status'       => 'active',
                    'activated_at' => $now,
                    'expires_at'   => $now->copy()->addDays($days),
                ]);
            }
        });

        return back()->with('success', "Transaksi {$transaction->invoice_number} berhasil di-approve dan undangan diaktifkan.");
    }
}
