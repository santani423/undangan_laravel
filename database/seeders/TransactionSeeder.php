<?php

namespace Database\Seeders;

use App\Models\Invitation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    private const SAMPLE_CUSTOMER_EMAILS = [
        'budi@example.com',
        'siti@example.com',
        'ahmad@example.com',
        'dewi@example.com',
        'rizky@example.com',
    ];

    private const TYPE_SCENARIOS = [
        'pernikahan' => [
            'status' => 'pending',
            'gateway' => 'xendit',
        ],
        'ulang_tahun' => [
            'status' => 'paid',
            'gateway' => 'xendit',
        ],
        'khitanan' => [
            'status' => 'failed',
            'gateway' => 'midtrans',
        ],
        'aqiqah' => [
            'status' => 'expired',
            'gateway' => 'xendit',
        ],
        'gender_reveal' => [
            'status' => 'cancelled',
            'gateway' => 'manual',
        ],
        'syukuran' => [
            'status' => 'pending',
            'gateway' => 'midtrans',
        ],
    ];

    private const TYPE_CODES = [
        'pernikahan' => 'PER',
        'ulang_tahun' => 'ULT',
        'khitanan' => 'KHI',
        'aqiqah' => 'AQI',
        'gender_reveal' => 'GEN',
        'syukuran' => 'SYU',
    ];

    public function run(): void
    {
        $invitations = Invitation::query()
            ->with([
                'user:id,name,email',
                'package:id,label,price,currency,duration_days,invitation_type',
            ])
            ->whereHas('user', function ($query): void {
                $query->whereIn('email', self::SAMPLE_CUSTOMER_EMAILS);
            })
            ->orderBy('user_id')
            ->orderBy('id')
            ->get();

        if ($invitations->isEmpty()) {
            $this->command?->warn('TransactionSeeder: tidak ada invitation sample yang ditemukan.');
            return;
        }

        $transactionCount = 0;
        $paymentCount = 0;
        $activatedCount = 0;

        foreach ($invitations as $index => $invitation) {
            $package = $invitation->package;

            if (! $package) {
                $this->command?->warn("TransactionSeeder: invitation #{$invitation->id} tidak punya package, skip.");
                continue;
            }

            $typeSlug = $package->invitation_type;
            $scenario = self::TYPE_SCENARIOS[$typeSlug] ?? null;

            if (! $scenario) {
                $this->command?->warn("TransactionSeeder: package type '{$typeSlug}' tidak dikenal, skip invitation #{$invitation->id}.");
                continue;
            }

            $seededAt = now()->subDays(($index * 2) + 1)->subHours($index % 6);
            $invoiceNumber = $this->invoiceNumber((int) $invitation->user_id, $typeSlug);
            $amount = (string) $package->price;
            $currency = $package->currency ?? 'IDR';
            $dueDate = $this->dueDateFor($seededAt, $scenario['status']);
            $paidAt = $scenario['status'] === 'paid' ? $seededAt->copy()->addHours(8) : null;
            $updatedAt = $paidAt?->copy() ?? $seededAt->copy()->addHours(1);

            DB::table('transactions')->updateOrInsert(
                ['invitation_id' => $invitation->id],
                [
                    'user_id' => $invitation->user_id,
                    'invitation_id' => $invitation->id,
                    'package_id' => $invitation->package_id,
                    'invoice_number' => $invoiceNumber,
                    'invoice_amount' => $amount,
                    'invoice_currency' => $currency,
                    'status' => $scenario['status'],
                    'due_date' => $dueDate?->toDateString(),
                    'paid_at' => $paidAt,
                    'notes' => $this->notesFor($invitation->title, $scenario['status']),
                    'created_at' => $seededAt,
                    'updated_at' => $updatedAt,
                ]
            );

            $transactionId = DB::table('transactions')
                ->where('invoice_number', $invoiceNumber)
                ->value('id');

            if (! $transactionId) {
                $this->command?->warn("TransactionSeeder: gagal mengambil transaction id untuk invoice {$invoiceNumber}.");
                continue;
            }

            if ($scenario['status'] === 'paid') {
                DB::table('invitations')->where('id', $invitation->id)->update([
                    'status' => 'active',
                    'activated_at' => $paidAt,
                    'expires_at' => $paidAt?->copy()->addDays((int) $package->duration_days),
                    'updated_at' => $updatedAt,
                ]);
                $activatedCount++;
            }

            $attempts = $this->buildPayments(
                transactionId: (int) $transactionId,
                invoiceNumber: $invoiceNumber,
                gateway: $scenario['gateway'],
                status: $scenario['status'],
                amount: $amount,
                currency: $currency,
                seededAt: $seededAt,
            );

            foreach ($attempts as $attempt) {
                DB::table('payments')->updateOrInsert(
                    ['gateway_reference_id' => $attempt['gateway_reference_id']],
                    $attempt
                );
                $paymentCount++;
            }

            $transactionCount++;
        }

        $this->command?->info("TransactionSeeder: {$transactionCount} transaksi sample dan {$paymentCount} payment record disiapkan.");

        if ($activatedCount > 0) {
            $this->command?->info("TransactionSeeder: {$activatedCount} invitation sample diaktifkan untuk transaksi paid.");
        }
    }

    private function invoiceNumber(int $userId, string $typeSlug): string
    {
        return 'INV-DEMO-' . $userId . '-' . (self::TYPE_CODES[$typeSlug] ?? 'GEN');
    }

    private function dueDateFor(Carbon $seededAt, string $status): ?Carbon
    {
        return match ($status) {
            'expired' => $seededAt->copy()->subDay(),
            'cancelled' => null,
            default => $seededAt->copy()->addDays(2),
        };
    }

    private function notesFor(string $title, string $status): string
    {
        return match ($status) {
            'paid' => "Pembayaran demo untuk {$title} sudah lunas.",
            'failed' => "Pembayaran demo untuk {$title} gagal diproses.",
            'expired' => "Invoice demo untuk {$title} sudah kedaluwarsa.",
            'cancelled' => "Invoice demo untuk {$title} dibatalkan.",
            default => "Invoice demo untuk {$title} masih menunggu pembayaran.",
        };
    }

    /**
     * Build payment rows for a seeded transaction.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildPayments(
        int $transactionId,
        string $invoiceNumber,
        string $gateway,
        string $status,
        string $amount,
        string $currency,
        Carbon $seededAt,
    ): array {
        $checkoutUrl = null;

        return match ($status) {
            'paid' => [
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: $gateway,
                    attempt: 'invoice',
                    status: 'pending',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(10),
                ),
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: $gateway,
                    attempt: 'settled',
                    status: 'success',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(55),
                    webhookReceivedAt: $seededAt->copy()->addMinutes(56),
                    webhookVerifiedAt: $seededAt->copy()->addMinutes(57),
                ),
            ],
            'failed' => [
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: $gateway,
                    attempt: 'failed',
                    status: 'failed',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(15),
                    webhookReceivedAt: $seededAt->copy()->addMinutes(16),
                    webhookVerifiedAt: $seededAt->copy()->addMinutes(17),
                    errorCode: 'PAYMENT_FAILED',
                    errorMessage: 'Pembayaran demo gagal diproses oleh gateway.',
                ),
            ],
            'expired' => [
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: $gateway,
                    attempt: 'expired',
                    status: 'failed',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(20),
                    webhookReceivedAt: $seededAt->copy()->addMinutes(21),
                    webhookVerifiedAt: $seededAt->copy()->addMinutes(22),
                    errorCode: 'INVOICE_EXPIRED',
                    errorMessage: 'Invoice demo sudah melewati batas pembayaran.',
                ),
            ],
            'cancelled' => [
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: 'manual',
                    attempt: 'cancelled',
                    status: 'cancelled',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(12),
                    webhookReceivedAt: $seededAt->copy()->addMinutes(13),
                    webhookVerifiedAt: $seededAt->copy()->addMinutes(14),
                    errorCode: 'CUSTOMER_CANCELLED',
                    errorMessage: 'Pembayaran dibatalkan pada data demo.',
                ),
            ],
            default => [
                $this->paymentRow(
                    transactionId: $transactionId,
                    invoiceNumber: $invoiceNumber,
                    gateway: $gateway,
                    attempt: 'pending',
                    status: 'pending',
                    amount: $amount,
                    currency: $currency,
                    checkoutUrl: $checkoutUrl,
                    createdAt: $seededAt->copy()->addMinutes(10),
                ),
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentRow(
        int $transactionId,
        string $invoiceNumber,
        string $gateway,
        string $attempt,
        string $status,
        string $amount,
        string $currency,
        ?string $checkoutUrl,
        Carbon $createdAt,
        ?Carbon $webhookReceivedAt = null,
        ?Carbon $webhookVerifiedAt = null,
        ?string $errorCode = null,
        ?string $errorMessage = null,
    ): array {
        $referenceId = 'DEMO-' . $invoiceNumber . '-' . Str::upper($attempt);

        return [
            'transaction_id' => $transactionId,
            'payment_gateway' => $gateway,
            'gateway_reference_id' => $referenceId,
            'gateway_order_id' => $checkoutUrl,
            'amount' => $amount,
            'fee' => '0.00',
            'currency' => $currency,
            'status' => $status,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'webhook_received_at' => $webhookReceivedAt,
            'webhook_verified_at' => $webhookVerifiedAt,
            'webhook_payload' => json_encode([
                'source' => 'database_seeder',
                'invoice_number' => $invoiceNumber,
                'attempt' => $attempt,
                'status' => $status,
                'gateway' => $gateway,
            ]),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
