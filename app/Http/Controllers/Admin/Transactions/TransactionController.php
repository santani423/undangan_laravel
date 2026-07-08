<?php

namespace App\Http\Controllers\Admin\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        return $this->renderIndex();
    }

    public function payments(): Response
    {
        return $this->renderPayments();
    }

    public function show(Transaction $transaction): Response
    {
        return $this->renderIndex($transaction->id);
    }

    public function approve(Transaction $transaction): RedirectResponse
    {
        if ($transaction->status !== 'pending') {
            return redirect()
                ->route('admin.transactions.show', $transaction)
                ->with('error', 'Hanya transaksi pending yang bisa dikonfirmasi.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->loadMissing(['invitation', 'package', 'payments']);

            $this->syncPayment(
                transaction: $transaction,
                status: 'success',
            );

            $transaction->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            $this->activateInvitation($transaction);
        });

        return redirect()
            ->route('admin.transactions.show', $transaction)
            ->with('success', "Transaksi {$transaction->invoice_number} berhasil dikonfirmasi.");
    }

    public function reject(Transaction $transaction): RedirectResponse
    {
        if ($transaction->status !== 'pending') {
            return redirect()
                ->route('admin.transactions.show', $transaction)
                ->with('error', 'Hanya transaksi pending yang bisa ditolak.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->loadMissing(['payments']);

            $this->syncPayment(
                transaction: $transaction,
                status: 'failed',
                errorCode: 'ADMIN_REJECTED',
                errorMessage: 'Ditolak manual oleh admin.',
            );

            $transaction->update([
                'status'  => 'failed',
                'paid_at' => null,
            ]);
        });

        return redirect()
            ->route('admin.transactions.show', $transaction)
            ->with('success', "Transaksi {$transaction->invoice_number} ditolak secara manual.");
    }

    private function renderIndex(?int $selectedTransactionId = null): Response
    {
        $payload = $this->buildPayload($selectedTransactionId);

        return Inertia::render('admin/transactions/index', $payload);
    }

    private function renderPayments(): Response
    {
        $payload = $this->buildPayload();

        return Inertia::render('admin/transactions/payments', $payload);
    }

    private function buildPayload(?int $selectedTransactionId = null): array
    {
        $transactions = Transaction::with([
            'user:id,name,email',
            'invitation:id,slug,title,status',
            'package:id,label,description,duration_days',
            'payments' => fn ($query) => $query->orderByDesc('created_at'),
        ])
            ->latest()
            ->get();

        $transactionsData = $transactions->map(fn (Transaction $transaction) => $this->mapTransaction($transaction))->values();
        $pendingTransactions = $transactionsData->where('status', 'pending')->values();

        $selectedTransactionId ??= data_get($pendingTransactions->first() ?? $transactionsData->first(), 'id');

        return [
            'transactions'          => $transactionsData,
            'pendingTransactions'   => $pendingTransactions,
            'summary'               => [
                'total'          => $transactions->count(),
                'pending'        => $transactions->where('status', 'pending')->count(),
                'pending_amount' => (float) $transactions->where('status', 'pending')->sum('invoice_amount'),
                'paid'           => $transactions->where('status', 'paid')->count(),
                'rejected'       => $transactions->whereIn('status', ['failed', 'cancelled', 'expired'])->count(),
                'revenue'        => (float) Transaction::where('status', 'paid')->sum('invoice_amount'),
            ],
            'selectedTransactionId' => $selectedTransactionId ? (int) $selectedTransactionId : null,
        ];
    }

    private function mapTransaction(Transaction $transaction): array
    {
        $payments = $transaction->payments->map(fn (Payment $payment) => [
            'id'                   => $payment->id,
            'payment_gateway'      => $payment->payment_gateway,
            'gateway_reference_id' => $payment->gateway_reference_id,
            'gateway_order_id'     => $payment->gateway_order_id,
            'amount'               => (string) $payment->amount,
            'fee'                  => $payment->fee !== null ? (string) $payment->fee : null,
            'currency'             => $payment->currency,
            'status'               => $payment->status,
            'error_code'           => $payment->error_code,
            'error_message'        => $payment->error_message,
            'webhook_received_at'  => $payment->webhook_received_at?->toDateTimeString(),
            'webhook_verified_at'  => $payment->webhook_verified_at?->toDateTimeString(),
            'created_at'           => $payment->created_at->toDateTimeString(),
        ])->values()->all();

        return [
            'id'               => $transaction->id,
            'invoice_number'   => $transaction->invoice_number,
            'invoice_amount'   => (string) $transaction->invoice_amount,
            'invoice_currency' => $transaction->invoice_currency,
            'status'           => $transaction->status,
            'due_date'         => $transaction->due_date?->toDateString(),
            'paid_at'          => $transaction->paid_at?->toDateTimeString(),
            'notes'            => $transaction->notes,
            'created_at'       => $transaction->created_at->toDateTimeString(),
            'updated_at'       => $transaction->updated_at->toDateTimeString(),
            'payment_count'    => count($payments),
            'latest_payment'   => $payments[0] ?? null,
            'payment_url'      => $this->getPendingPaymentUrl($transaction),
            'user'             => $transaction->user ? [
                'id'    => $transaction->user->id,
                'name'  => $transaction->user->name,
                'email' => $transaction->user->email,
            ] : null,
            'invitation'       => $transaction->invitation ? [
                'id'     => $transaction->invitation->id,
                'slug'   => $transaction->invitation->slug,
                'title'  => $transaction->invitation->title,
                'status' => $transaction->invitation->status,
            ] : null,
            'package'          => $transaction->package ? [
                'id'            => $transaction->package->id,
                'label'         => $transaction->package->label,
                'description'   => $transaction->package->description,
                'duration_days' => $transaction->package->duration_days,
            ] : null,
            'payments'         => $payments,
        ];
    }

    private function getPendingPaymentUrl(Transaction $transaction): ?string
    {
        if ($transaction->status !== 'pending') {
            return null;
        }

        return $transaction->payments()
            ->where('status', 'pending')
            ->latest()
            ->value('gateway_order_id')
            ?? $transaction->payments()->latest()->value('gateway_order_id');
    }

    private function syncPayment(
        Transaction $transaction,
        string $status,
        ?string $errorCode = null,
        ?string $errorMessage = null,
    ): Payment {
        $payment = $transaction->payments()
            ->where('status', 'pending')
            ->latest()
            ->first()
            ?? $transaction->payments()->latest()->first();

        if ($payment) {
            $payload = [
                'status'              => $status,
                'webhook_received_at' => $payment->webhook_received_at ?? now(),
                'webhook_verified_at' => now(),
                'error_code'          => $errorCode,
                'error_message'       => $errorMessage,
            ];

            if ($status === 'success') {
                $payload['error_code'] = null;
                $payload['error_message'] = null;
            }

            $payment->update($payload);

            return $payment;
        }

        return Payment::create([
            'transaction_id'       => $transaction->id,
            'payment_gateway'      => 'manual',
            'gateway_reference_id' => 'manual-' . Str::uuid(),
            'gateway_order_id'     => null,
            'amount'               => $transaction->invoice_amount,
            'fee'                  => 0,
            'currency'             => $transaction->invoice_currency,
            'status'               => $status,
            'error_code'           => $errorCode,
            'error_message'        => $errorMessage,
            'webhook_received_at'  => now(),
            'webhook_verified_at'  => now(),
            'webhook_payload'      => [
                'source' => 'admin_manual',
                'action' => $status === 'success' ? 'approved' : 'rejected',
            ],
        ]);
    }

    private function activateInvitation(Transaction $transaction): void
    {
        if (! $transaction->invitation) {
            return;
        }

        $days = $transaction->package?->duration_days ?? 365;

        $transaction->invitation->update([
            'status'       => 'active',
            'activated_at' => now(),
            'expires_at'   => now()->addDays($days),
        ]);
    }
}
