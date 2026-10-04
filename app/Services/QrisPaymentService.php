<?php

namespace App\Services;

use App\Http\Controllers\Admin\Settings\PaymentSettingController;
use App\Models\AppSetting;
use App\Models\Payment;
use App\Models\PaymentGatewayConfig;
use App\Models\Transaction;
use App\Support\QrisPayload;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Static-QRIS checkout: every payment gets a backend-generated random
 * discount (within the admin's range, unique among live QRIS payments) so
 * incoming transfers can be told apart, then PPN is applied on top and the
 * final total is baked into a dynamic QRIS payload.
 */
class QrisPaymentService
{
    public const GATEWAY = 'qris';

    public const TAX_RATE_PERCENT = 11;

    /** How long a generated QRIS (and its reserved discount) stays payable. */
    public const VALID_HOURS = 24;

    /** Up to this many candidates, pick from the exact set of free values; above it, random probing. */
    private const ENUMERATE_LIMIT = 100_000;

    private const RANDOM_ATTEMPTS = 50;

    public function config(): array
    {
        $row = PaymentGatewayConfig::where('gateway_name', self::GATEWAY)->first();
        $extra = $row?->configExtraSafe() ?? [];

        return [
            'is_active' => (bool) $row?->is_active,
            'base_payload' => (string) ($extra['values']['base_payload'] ?? ''),
            'merchant_name' => (string) ($extra['values']['merchant_name'] ?? ''),
            'discount_min' => (int) ($extra['discount_min'] ?? 0),
            'discount_max' => (int) ($extra['discount_max'] ?? 0),
            'configured_at' => $row?->configured_at,
        ];
    }

    /** Active on the gateway card, a base QRIS uploaded, and "QRIS" enabled globally. */
    public function isAvailable(): bool
    {
        $config = $this->config();
        $globalEnabled = AppSetting::get('payment_enabled_methods', PaymentSettingController::DEFAULT_ENABLED_METHODS);

        return $config['is_active']
            && $config['base_payload'] !== ''
            && in_array('qris', $globalEnabled, true);
    }

    /** The transaction's QRIS payment that can still be paid, if any. */
    public function activePayment(Transaction $transaction): ?Payment
    {
        return $transaction->payments()
            ->where('payment_gateway', self::GATEWAY)
            ->where('status', 'pending')
            ->where('qris_expires_at', '>', now())
            ->latest('id')
            ->first();
    }

    /**
     * subtotal = price − discount; PPN = 11% of subtotal (rounded half-up to
     * whole rupiah); total = subtotal + PPN.
     */
    public static function calculate(int $originalPrice, int $discount): array
    {
        $subtotal = $originalPrice - $discount;
        $tax = intdiv($subtotal * self::TAX_RATE_PERCENT + 50, 100);

        return [
            'original' => $originalPrice,
            'discount' => $discount,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $subtotal + $tax,
        ];
    }

    /**
     * Create a pending QRIS payment for the transaction. Everything happens
     * inside one lock + DB transaction, so a failure (e.g. every discount in
     * the range is taken) leaves no half-written payment behind.
     *
     * @throws RuntimeException with a user-facing message.
     */
    public function createPayment(Transaction $transaction, int $originalPrice): Payment
    {
        $config = $this->config();

        if ($config['base_payload'] === '') {
            throw new RuntimeException('QRIS belum dikonfigurasi oleh admin.');
        }

        try {
            return Cache::lock('qris-discount-generator', 15)->block(10, function () use ($transaction, $originalPrice, $config) {
                return DB::transaction(function () use ($transaction, $originalPrice, $config) {
                    $discount = $this->generateDiscount($originalPrice, $config['discount_min'], $config['discount_max']);
                    $amounts = self::calculate($originalPrice, $discount);

                    $transaction->payments()->where('status', 'pending')->update(['status' => 'cancelled']);

                    $transaction->update([
                        'invoice_amount' => $amounts['total'],
                        'status' => 'pending',
                        'due_date' => now()->addHours(self::VALID_HOURS),
                        'paid_at' => null,
                    ]);

                    return Payment::create([
                        'transaction_id' => $transaction->id,
                        'payment_gateway' => self::GATEWAY,
                        'gateway_reference_id' => 'qris-'.Str::uuid(),
                        'amount' => $amounts['total'],
                        'original_amount' => $amounts['original'],
                        'discount_amount' => $amounts['discount'],
                        'subtotal_amount' => $amounts['subtotal'],
                        'tax_rate' => self::TAX_RATE_PERCENT,
                        'tax_amount' => $amounts['tax'],
                        'qris_payload' => QrisPayload::withAmount($config['base_payload'], $amounts['total']),
                        'qris_expires_at' => now()->addHours(self::VALID_HOURS),
                        'currency' => $transaction->invoice_currency ?? 'IDR',
                        'status' => 'pending',
                    ]);
                });
            });
        } catch (LockTimeoutException) {
            throw new RuntimeException('Sistem sedang memproses pembayaran QRIS lain. Silakan coba lagi sebentar.');
        }
    }

    /**
     * Dry run of createPayment() for the admin "Test Generate" tool: same
     * discount rules and amount maths, but nothing is saved and the discount
     * is not reserved.
     *
     * @throws RuntimeException with a user-facing message.
     */
    public function preview(string $basePayload, int $originalPrice, int $min, int $max): array
    {
        $discount = $this->generateDiscount($originalPrice, $min, $max);
        $amounts = self::calculate($originalPrice, $discount);

        return $amounts + [
            'tax_rate' => self::TAX_RATE_PERCENT,
            'payload' => QrisPayload::withAmount($basePayload, $amounts['total']),
        ];
    }

    /**
     * Random discount in [min, max], capped below the price so the subtotal
     * stays positive, and not already held by another live QRIS payment.
     * Bounded: never loops forever, throws when the range is exhausted.
     */
    public function generateDiscount(int $originalPrice, int $min, int $max): int
    {
        $effectiveMax = min($max, $originalPrice - 1);

        if ($min < 0 || $effectiveMax < $min) {
            throw new RuntimeException(sprintf(
                'Range diskon QRIS (%s–%s) tidak valid untuk harga %s. Silakan hubungi admin.',
                self::rupiah($min), self::rupiah($max), self::rupiah($originalPrice),
            ));
        }

        $used = Payment::query()
            ->where('payment_gateway', self::GATEWAY)
            ->where('status', 'pending')
            ->where('qris_expires_at', '>', now())
            ->whereBetween('discount_amount', [$min, $effectiveMax])
            ->pluck('discount_amount')
            ->map(fn ($value) => (int) $value)
            ->flip();

        $candidates = $effectiveMax - $min + 1;

        if ($used->count() >= $candidates) {
            throw new RuntimeException(
                'Semua nominal diskon QRIS dalam range sedang dipakai transaksi lain. Silakan coba lagi nanti atau gunakan metode pembayaran lain.'
            );
        }

        if ($candidates <= self::ENUMERATE_LIMIT) {
            $free = array_values(array_diff(range($min, $effectiveMax), $used->keys()->all()));
            $discount = $free[random_int(0, count($free) - 1)];
        } else {
            // Huge range, few used values: random probing practically always hits a free value.
            $discount = null;
            for ($i = 0; $i < self::RANDOM_ATTEMPTS && $discount === null; $i++) {
                $candidate = random_int($min, $effectiveMax);
                $discount = $used->has($candidate) ? null : $candidate;
            }

            if ($discount === null) {
                throw new RuntimeException('Gagal membuat nominal diskon QRIS yang unik. Silakan coba lagi.');
            }
        }

        if ($discount < $min || $discount > $effectiveMax || $discount >= $originalPrice) {
            throw new RuntimeException('Nominal diskon QRIS di luar range yang diizinkan.');
        }

        return $discount;
    }

    public static function rupiah(int $amount): string
    {
        return 'Rp'.number_format($amount, 0, ',', '.');
    }
}
