<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $payments = Payment::query()
            ->with([
                'transaction.user' => fn ($query) => $query->withTrashed()->select('id', 'name', 'email', 'phone_number'),
                'transaction.invitation:id,user_id,slug,title,status',
                'transaction.package:id,name,label',
            ])
            ->latest()
            ->get();

        $items = $payments->map(fn (Payment $payment) => [
            'id'                   => $payment->id,
            'payment_gateway'      => $payment->payment_gateway,
            'gateway_reference_id' => $payment->gateway_reference_id,
            'amount'               => (float) $payment->amount,
            'fee'                  => (float) $payment->fee,
            'currency'             => $payment->currency,
            'status'               => $payment->status,
            'error_message'        => $payment->error_message,
            'webhook_received_at'  => $payment->webhook_received_at?->toDateTimeString(),
            'webhook_verified_at'  => $payment->webhook_verified_at?->toDateTimeString(),
            'created_at'           => $payment->created_at->toDateTimeString(),
            'transaction'          => $payment->transaction ? [
                'id'             => $payment->transaction->id,
                'invoice_number' => $payment->transaction->invoice_number,
                'status'         => $payment->transaction->status,
            ] : null,
            'customer' => $payment->transaction?->user ? [
                'id'           => $payment->transaction->user->id,
                'name'         => $payment->transaction->user->name,
                'email'        => $payment->transaction->user->email,
                'phone_number' => $payment->transaction->user->phone_number,
            ] : null,
            'invitation' => $payment->transaction?->invitation ? [
                'id'     => $payment->transaction->invitation->id,
                'slug'   => $payment->transaction->invitation->slug,
                'title'  => $payment->transaction->invitation->title,
                'status' => $payment->transaction->invitation->status,
            ] : null,
            'package' => $payment->transaction?->package ? [
                'name'  => $payment->transaction->package->name,
                'label' => $payment->transaction->package->label,
            ] : null,
        ])->values();

        return Inertia::render('admin/transactions/payments', [
            'payments' => $items,
            'summary'  => [
                'total'         => $items->count(),
                'pending'       => $items->whereIn('status', ['pending', 'processing'])->count(),
                'success'       => $items->where('status', 'success')->count(),
                'failed'        => $items->whereIn('status', ['failed', 'cancelled'])->count(),
                'gross_success' => $items->where('status', 'success')->sum('amount'),
            ],
        ]);
    }

    /**
     * Manually confirm a pending/processing payment — for gateway webhooks
     * that never arrived, or manual bank-transfer payments. Mirrors the
     * cascade in Admin\TransactionController::approve().
     */
    public function confirm(Payment $payment): RedirectResponse
    {
        $payment->load('transaction.invitation', 'transaction.package');

        if (! in_array($payment->status, ['pending', 'processing'], true)) {
            return back()->with('error', 'Pembayaran ini sudah final dan tidak bisa dikonfirmasi ulang.');
        }

        DB::transaction(function () use ($payment) {
            $now = now();

            $payment->update([
                'status'              => 'success',
                'webhook_verified_at' => $now,
            ]);

            $transaction = $payment->transaction;
            if (! $transaction) {
                return;
            }

            if ($transaction->status !== 'paid') {
                $transaction->update([
                    'status'  => 'paid',
                    'paid_at' => $transaction->paid_at ?? $now,
                ]);
            }

            if ($transaction->invitation && $transaction->invitation->status !== 'active') {
                $days = $transaction->package?->duration_days ?? 365;

                $transaction->invitation->update([
                    'status'       => 'active',
                    'activated_at' => $now,
                    'expires_at'   => $now->copy()->addDays($days),
                ]);
            }
        });

        return back()->with('success', "Pembayaran #{$payment->id} dikonfirmasi, transaksi & undangan terkait diaktifkan.");
    }
}
