<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class XenditWebhookController extends Controller
{
    public function __construct(private readonly XenditService $xendit) {}

    public function handle(Request $request): JsonResponse
    {
        // ── Verify callback token ─────────────────────────────────────────
        $token = $request->header('x-callback-token', '');

        if (! $this->xendit->verifyWebhookToken($token)) {
            Log::warning('Xendit webhook: invalid callback token');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->all();

        Log::info('Xendit webhook received', [
            'external_id' => $payload['external_id'] ?? null,
            'status'      => $payload['status'] ?? null,
        ]);

        // ── Find transaction by invoice number (external_id) ──────────────
        $externalId = $payload['external_id'] ?? null;
        if (! $externalId) {
            return response()->json(['message' => 'Missing external_id'], 422);
        }

        $transaction = Transaction::where('invoice_number', $externalId)->first();

        if (! $transaction) {
            Log::warning('Xendit webhook: transaction not found', ['external_id' => $externalId]);
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // ── Find payment by Xendit invoice ID ─────────────────────────────
        $xenditInvoiceId = $payload['id'] ?? null;
        $payment = $xenditInvoiceId
            ? Payment::where('gateway_reference_id', $xenditInvoiceId)->first()
            : $transaction->payments()->where('payment_gateway', 'xendit')->latest()->first();

        try {
            DB::transaction(function () use ($payload, $transaction, $payment) {
                $xenditStatus = strtoupper($payload['status'] ?? '');

                [$txStatus, $payStatus] = match ($xenditStatus) {
                    'PAID', 'SETTLED'                       => ['paid', 'success'],
                    'EXPIRED'                               => ['expired', 'cancelled'],
                    'FAILED'                                => ['failed', 'failed'],
                    default                                 => ['pending', 'pending'],
                };

                // Update payment record
                if ($payment) {
                    $payment->update([
                        'status'               => $payStatus,
                        'amount'               => $payload['paid_amount'] ?? $payment->amount,
                        'webhook_received_at'  => now(),
                        'webhook_verified_at'  => now(),
                        'webhook_payload'      => $payload,
                    ]);
                }

                // Update transaction
                $transactionData = ['status' => $txStatus];
                if (in_array($xenditStatus, ['PAID', 'SETTLED'])) {
                    $transactionData['paid_at'] = now();
                }
                $transaction->update($transactionData);

                // Activate invitation on successful payment
                if (in_array($xenditStatus, ['PAID', 'SETTLED']) && $transaction->invitation) {
                    $invitation = $transaction->invitation;
                    $package    = $transaction->package;
                    $days       = $package?->duration_days ?? 365;

                    $invitation->update([
                        'status'       => 'active',
                        'activated_at' => now(),
                        'expires_at'   => now()->addDays($days),
                    ]);
                }
            });

        } catch (Throwable $e) {
            Log::error('Xendit webhook processing error', [
                'error'       => $e->getMessage(),
                'external_id' => $externalId,
            ]);
            return response()->json(['message' => 'Processing error'], 500);
        }

        return response()->json(['message' => 'OK']);
    }
}
