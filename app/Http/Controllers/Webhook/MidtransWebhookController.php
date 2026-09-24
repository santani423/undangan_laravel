<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class MidtransWebhookController extends Controller
{
    public function __construct(private readonly MidtransService $midtrans) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        if (! $this->midtrans->verifySignature($payload)) {
            Log::warning('Midtrans webhook: invalid signature', ['order_id' => $payload['order_id'] ?? null]);

            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $orderId = $payload['order_id'] ?? null;
        $txStatusRaw = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? null;

        Log::info('Midtrans webhook received', ['order_id' => $orderId, 'status' => $txStatusRaw]);

        // order_id is the transaction's invoice_number (see Customer\PaymentController::pay).
        $transaction = Transaction::where('invoice_number', $orderId)->first();

        if (! $transaction) {
            // Stale order from a superseded attempt — acknowledge so Midtrans stops retrying.
            Log::warning('Midtrans webhook: transaction not found', ['order_id' => $orderId]);

            return response()->json(['message' => 'Ignored']);
        }

        $payment = $transaction->payments()->where('payment_gateway', 'midtrans')->latest()->first();

        [$txStatus, $payStatus] = match ($txStatusRaw) {
            'capture'    => $fraudStatus === 'accept' || $fraudStatus === null ? ['paid', 'success'] : ['pending', 'processing'],
            'settlement' => ['paid', 'success'],
            'expire'     => ['expired', 'cancelled'],
            'cancel'     => ['cancelled', 'cancelled'],
            'deny', 'failure' => ['failed', 'failed'],
            default      => ['pending', 'pending'],
        };

        // Never let a late/out-of-order notification downgrade an already paid transaction.
        if ($transaction->status === 'paid' && $txStatus !== 'paid') {
            return response()->json(['message' => 'Already paid']);
        }

        try {
            DB::transaction(function () use ($payload, $transaction, $payment, $txStatus, $payStatus) {
                $payment?->update([
                    'status'              => $payStatus,
                    'webhook_received_at' => now(),
                    'webhook_verified_at' => now(),
                    'webhook_payload'     => $payload,
                ]);

                $transactionData = ['status' => $txStatus];
                if ($txStatus === 'paid') {
                    $transactionData['paid_at'] = now();
                }
                $transaction->update($transactionData);

                if ($txStatus === 'paid' && $transaction->invitation) {
                    $days = $transaction->package?->duration_days ?? 365;

                    $transaction->invitation->update([
                        'status'       => 'active',
                        'activated_at' => now(),
                        'expires_at'   => now()->addDays($days),
                    ]);
                }
            });
        } catch (Throwable $e) {
            Log::error('Midtrans webhook processing error', ['error' => $e->getMessage(), 'order_id' => $orderId]);

            return response()->json(['message' => 'Processing error'], 500);
        }

        return response()->json(['message' => 'OK']);
    }
}
