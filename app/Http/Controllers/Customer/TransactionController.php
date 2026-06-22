<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        $transactions = Transaction::with(['invitation', 'package'])
            ->withCount('payments')
            ->where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn ($t) => [
                'id'               => $t->id,
                'invoice_number'   => $t->invoice_number,
                'invoice_amount'   => $t->invoice_amount,
                'invoice_currency' => $t->invoice_currency,
                'status'           => $t->status,
                'due_date'         => $t->due_date?->toDateString(),
                'paid_at'          => $t->paid_at?->toDateTimeString(),
                'created_at'       => $t->created_at->toDateTimeString(),
                'invitation'       => $t->invitation ? [
                    'slug'  => $t->invitation->slug,
                    'title' => $t->invitation->title,
                ] : null,
                'package' => $t->package ? [
                    'label' => $t->package->label,
                ] : null,
                'payment_url'  => $this->getPendingPaymentUrl($t),
            ]);

        return Inertia::render('customer/transactions/index', [
            'transactions' => $transactions,
        ]);
    }

    public function show(Transaction $transaction): Response
    {
        abort_if($transaction->user_id !== auth()->id(), 403);

        $transaction->load(['invitation', 'package', 'payments']);

        $payments = $transaction->payments->map(fn ($p) => [
            'id'                   => $p->id,
            'payment_gateway'      => $p->payment_gateway,
            'gateway_reference_id' => $p->gateway_reference_id,
            'gateway_order_id'     => $p->gateway_order_id,
            'amount'               => $p->amount,
            'fee'                  => $p->fee,
            'currency'             => $p->currency,
            'status'               => $p->status,
            'error_code'           => $p->error_code,
            'error_message'        => $p->error_message,
            'webhook_received_at'  => $p->webhook_received_at?->toDateTimeString(),
            'created_at'           => $p->created_at->toDateTimeString(),
        ])->values()->toArray();

        return Inertia::render('customer/transactions/show', [
            'transaction' => [
                'id'               => $transaction->id,
                'invoice_number'   => $transaction->invoice_number,
                'invoice_amount'   => $transaction->invoice_amount,
                'invoice_currency' => $transaction->invoice_currency,
                'status'           => $transaction->status,
                'due_date'         => $transaction->due_date?->toDateString(),
                'paid_at'          => $transaction->paid_at?->toDateTimeString(),
                'notes'            => $transaction->notes,
                'created_at'       => $transaction->created_at->toDateTimeString(),
                'invitation'       => $transaction->invitation ? [
                    'id'     => $transaction->invitation->id,
                    'slug'   => $transaction->invitation->slug,
                    'title'  => $transaction->invitation->title,
                    'status' => $transaction->invitation->status,
                ] : null,
                'package' => $transaction->package ? [
                    'id'          => $transaction->package->id,
                    'label'       => $transaction->package->label,
                    'description' => $transaction->package->description,
                ] : null,
                'payments'    => $payments,
                'payment_url' => $this->getPendingPaymentUrl($transaction),
            ],
        ]);
    }

    private function getPendingPaymentUrl(Transaction $transaction): ?string
    {
        if ($transaction->status !== 'pending') {
            return null;
        }
        return $transaction->payments()->where('status', 'pending')->latest()->value('gateway_order_id');
    }
}
