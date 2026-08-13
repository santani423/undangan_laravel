<?php

namespace App\Http\Controllers\Admin\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    private const STATUS_LABELS = [
        'pending' => 'Menunggu Pembayaran',
        'paid' => 'Lunas',
        'failed' => 'Gagal',
        'cancelled' => 'Dibatalkan',
        'expired' => 'Kadaluarsa',
    ];

    private const TYPE_LABELS = [
        'pernikahan' => 'Pernikahan',
        'ulang_tahun' => 'Ulang Tahun',
        'khitanan' => 'Khitanan',
        'aqiqah' => 'Aqiqah',
        'gender_reveal' => 'Gender Reveal',
        'syukuran' => 'Syukuran',
    ];

    public function index(Request $request): Response
    {
        return $this->renderIndex($request);
    }

    public function payments(Request $request): Response
    {
        return $this->renderPayments($request);
    }

    public function show(Transaction $transaction, Request $request): Response
    {
        return $this->renderIndex($request, $transaction->id);
    }

    public function approve(Transaction $transaction, Request $request): RedirectResponse
    {
        if ($transaction->status !== 'pending') {
            return redirect()
                ->route('admin.transactions.show', array_merge(['transaction' => $transaction], $request->query()))
                ->with('error', 'Hanya transaksi pending yang bisa dikonfirmasi.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->loadMissing(['invitation', 'package', 'payments']);

            $this->syncPayment(
                transaction: $transaction,
                status: 'success',
            );

            $transaction->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $this->activateInvitation($transaction);
        });

        return redirect()
            ->route('admin.transactions.show', array_merge(['transaction' => $transaction], $request->query()))
            ->with('success', "Transaksi {$transaction->invoice_number} berhasil dikonfirmasi.");
    }

    public function reject(Transaction $transaction, Request $request): RedirectResponse
    {
        if ($transaction->status !== 'pending') {
            return redirect()
                ->route('admin.transactions.show', array_merge(['transaction' => $transaction], $request->query()))
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
                'status' => 'failed',
                'paid_at' => null,
            ]);
        });

        return redirect()
            ->route('admin.transactions.show', array_merge(['transaction' => $transaction], $request->query()))
            ->with('success', "Transaksi {$transaction->invoice_number} ditolak secara manual.");
    }

    private function renderIndex(Request $request, ?int $selectedTransactionId = null): Response
    {
        $payload = $this->buildPayload($request, $selectedTransactionId, true);

        return Inertia::render('admin/transactions/index', $payload);
    }

    private function renderPayments(Request $request): Response
    {
        $payload = $this->buildPayload($request, null, false);

        return Inertia::render('admin/transactions/payments', $payload);
    }

    private function buildPayload(Request $request, ?int $selectedTransactionId = null, bool $applyFilters = true): array
    {
        $filters = $applyFilters ? $this->extractFilters($request) : $this->emptyFilters();

        $query = Transaction::with([
            'user:id,name,email',
            'invitation:id,slug,title,status',
            'package:id,label,description,duration_days,invitation_type',
            'payments' => fn ($query) => $query->orderByDesc('created_at'),
        ]);

        if ($applyFilters) {
            $this->applyFilters($query, $filters);
        }

        $summaryTransactions = (clone $query)->get();
        $transactions = (clone $query)
            ->orderByDesc('created_at')
            ->get();

        $transactionsData = $transactions->map(fn (Transaction $transaction) => $this->mapTransaction($transaction))->values();
        $pendingTransactions = $transactionsData->where('status', 'pending')->values();
        $selectedTransaction = null;

        $selectedTransactionId ??= data_get($pendingTransactions->first() ?? $transactionsData->first(), 'id');

        if ($selectedTransactionId) {
            $selectedTransaction = $transactions->firstWhere('id', $selectedTransactionId);

            if (! $selectedTransaction) {
                $selectedTransaction = Transaction::with([
                    'user:id,name,email',
                    'invitation:id,slug,title,status',
                    'package:id,label,description,duration_days,invitation_type',
                    'payments' => fn ($query) => $query->orderByDesc('created_at'),
                ])->find($selectedTransactionId);
            }
        }

        return [
            'transactions' => $transactionsData,
            'pendingTransactions' => $pendingTransactions,
            'summary' => [
                'total' => $summaryTransactions->count(),
                'pending' => $summaryTransactions->where('status', 'pending')->count(),
                'pending_amount' => (float) $summaryTransactions->where('status', 'pending')->sum('invoice_amount'),
                'paid' => $summaryTransactions->where('status', 'paid')->count(),
                'rejected' => $summaryTransactions->whereIn('status', ['failed', 'cancelled', 'expired'])->count(),
                'revenue' => (float) $summaryTransactions->where('status', 'paid')->sum('invoice_amount'),
            ],
            'selectedTransactionId' => $selectedTransactionId ? (int) $selectedTransactionId : null,
            'selectedTransaction' => $selectedTransaction ? $this->mapTransaction($selectedTransaction) : null,
            'filters' => $filters,
            'filterOptions' => $this->buildFilterOptions(),
        ];
    }

    private function emptyFilters(): array
    {
        return [
            'status' => '',
            'invitation_type' => '',
            'customer' => '',
            'date_from' => '',
            'date_to' => '',
        ];
    }

    private function extractFilters(Request $request): array
    {
        return [
            'status' => $this->normalizeFilterValue($request->query('status')),
            'invitation_type' => $this->normalizeFilterValue($request->query('invitation_type')),
            'customer' => $this->normalizeFilterValue($request->query('customer')),
            'date_from' => $this->normalizeFilterValue($request->query('date_from')),
            'date_to' => $this->normalizeFilterValue($request->query('date_to')),
        ];
    }

    private function normalizeFilterValue(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['status'] !== '' && isset(self::STATUS_LABELS[$filters['status']])) {
            $query->where('status', $filters['status']);
        }

        if ($filters['invitation_type'] !== '' && isset(self::TYPE_LABELS[$filters['invitation_type']])) {
            $query->whereHas('package', function (Builder $packageQuery) use ($filters): void {
                $packageQuery->where('invitation_type', $filters['invitation_type']);
            });
        }

        if ($filters['customer'] !== '' && ctype_digit($filters['customer'])) {
            $query->where('user_id', (int) $filters['customer']);
        }

        if ($dateFrom = $this->parseFilterDate($filters['date_from'])) {
            $query->where('created_at', '>=', $dateFrom->copy()->startOfDay());
        }

        if ($dateTo = $this->parseFilterDate($filters['date_to'])) {
            $query->where('created_at', '<=', $dateTo->copy()->endOfDay());
        }
    }

    private function parseFilterDate(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::createFromFormat('Y-m-d', $value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function buildFilterOptions(): array
    {
        return [
            'statuses' => collect(self::STATUS_LABELS)->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all(),
            'types' => collect(self::TYPE_LABELS)->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all(),
            'customers' => User::query()
                ->select(['id', 'name', 'email'])
                ->whereHas('transactions')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'value' => (string) $user->id,
                    'label' => "{$user->name} ({$user->email})",
                ])
                ->values()
                ->all(),
        ];
    }

    private function mapTransaction(Transaction $transaction): array
    {
        $payments = $transaction->payments->map(fn (Payment $payment) => [
            'id' => $payment->id,
            'payment_gateway' => $payment->payment_gateway,
            'gateway_reference_id' => $payment->gateway_reference_id,
            'gateway_order_id' => $payment->gateway_order_id,
            'amount' => (string) $payment->amount,
            'fee' => $payment->fee !== null ? (string) $payment->fee : null,
            'currency' => $payment->currency,
            'status' => $payment->status,
            'error_code' => $payment->error_code,
            'error_message' => $payment->error_message,
            'webhook_received_at' => $payment->webhook_received_at?->toDateTimeString(),
            'webhook_verified_at' => $payment->webhook_verified_at?->toDateTimeString(),
            'proof_file_url' => $payment->proof_file_path ? Storage::disk('public')->url($payment->proof_file_path) : null,
            'proof_is_pdf' => $payment->proof_file_path ? str_ends_with(strtolower($payment->proof_file_path), '.pdf') : false,
            'proof_uploaded_at' => $payment->proof_uploaded_at?->toDateTimeString(),
            'created_at' => $payment->created_at->toDateTimeString(),
        ])->values()->all();

        return [
            'id' => $transaction->id,
            'invoice_number' => $transaction->invoice_number,
            'invoice_amount' => (string) $transaction->invoice_amount,
            'invoice_currency' => $transaction->invoice_currency,
            'status' => $transaction->status,
            'due_date' => $transaction->due_date?->toDateString(),
            'paid_at' => $transaction->paid_at?->toDateTimeString(),
            'notes' => $transaction->notes,
            'created_at' => $transaction->created_at->toDateTimeString(),
            'updated_at' => $transaction->updated_at->toDateTimeString(),
            'payment_count' => count($payments),
            'latest_payment' => $payments[0] ?? null,
            'payment_url' => $this->getPendingPaymentUrl($transaction),
            'user' => $transaction->user ? [
                'id' => $transaction->user->id,
                'name' => $transaction->user->name,
                'email' => $transaction->user->email,
            ] : null,
            'invitation' => $transaction->invitation ? [
                'id' => $transaction->invitation->id,
                'slug' => $transaction->invitation->slug,
                'title' => $transaction->invitation->title,
                'status' => $transaction->invitation->status,
            ] : null,
            'package' => $transaction->package ? [
                'id' => $transaction->package->id,
                'label' => $transaction->package->label,
                'description' => $transaction->package->description,
                'duration_days' => $transaction->package->duration_days,
                'invitation_type' => $transaction->package->invitation_type,
            ] : null,
            'payments' => $payments,
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
                'status' => $status,
                'webhook_received_at' => $payment->webhook_received_at ?? now(),
                'webhook_verified_at' => now(),
                'error_code' => $errorCode,
                'error_message' => $errorMessage,
            ];

            if ($status === 'success') {
                $payload['error_code'] = null;
                $payload['error_message'] = null;
            }

            $payment->update($payload);

            return $payment;
        }

        return Payment::create([
            'transaction_id' => $transaction->id,
            'payment_gateway' => 'manual',
            'gateway_reference_id' => 'manual-'.Str::uuid(),
            'gateway_order_id' => null,
            'amount' => $transaction->invoice_amount,
            'fee' => 0,
            'currency' => $transaction->invoice_currency,
            'status' => $status,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'webhook_received_at' => now(),
            'webhook_verified_at' => now(),
            'webhook_payload' => [
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
            'status' => 'active',
            'activated_at' => now(),
            'expires_at' => now()->addDays($days),
        ]);
    }
}
