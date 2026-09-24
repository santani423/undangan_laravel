<?php

namespace App\Services;

use App\Models\PaymentGatewayConfig;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MidtransService
{
    private string $serverKey;
    private bool $isSandbox;

    public function __construct()
    {
        // Credentials come from the admin-managed gateway config (DB), same as XenditService.
        $gateway = PaymentGatewayConfig::where('gateway_name', 'midtrans')->first();
        $values  = $gateway?->configExtraSafe()['values'] ?? [];

        $this->serverKey = trim($values['server_key'] ?? '');
        $this->isSandbox = $gateway?->is_test_mode ?? true;
    }

    public function isConfigured(): bool
    {
        return $this->serverKey !== '';
    }

    private function snapBaseUrl(): string
    {
        return $this->isSandbox ? 'https://app.sandbox.midtrans.com' : 'https://app.midtrans.com';
    }

    /**
     * Create a Snap transaction. Returns ['token' => ..., 'redirect_url' => ...].
     *
     * @param  array{
     *   order_id: string,
     *   gross_amount: int,
     *   customer: array{first_name: string, email: string},
     *   item_name: string,
     *   enabled_payments: string[],
     *   finish_url: string,
     *   notification_url: string,
     * } $params
     */
    public function createSnapTransaction(array $params): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException(
                'Server Key Midtrans belum dikonfigurasi. Silakan isi di Admin → Settings → Pembayaran.'
            );
        }

        $body = [
            'transaction_details' => [
                'order_id'     => $params['order_id'],
                'gross_amount' => $params['gross_amount'],
            ],
            'item_details' => [[
                'id'       => 'PKG',
                'price'    => $params['gross_amount'],
                'quantity' => 1,
                // Midtrans rejects item names longer than 50 chars.
                'name'     => mb_substr($params['item_name'], 0, 50),
            ]],
            'customer_details' => $params['customer'],
            'callbacks'        => ['finish' => $params['finish_url']],
            'expiry'           => ['unit' => 'day', 'duration' => 1],
        ];

        if (! empty($params['enabled_payments'])) {
            $body['enabled_payments'] = array_values($params['enabled_payments']);
        }

        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            // Points notifications at this app regardless of what's set in the Midtrans dashboard.
            ->withHeaders(['X-Override-Notification' => $params['notification_url']])
            ->post($this->snapBaseUrl().'/snap/v1/transactions', $body);

        if ($response->failed()) {
            $messages = $response->json('error_messages');

            throw new RuntimeException(
                'Gagal membuat transaksi Midtrans: '.(is_array($messages) ? implode('; ', $messages) : $response->body())
            );
        }

        return $response->json();
    }

    /**
     * Verify a notification's signature_key: sha512(order_id + status_code + gross_amount + server_key).
     */
    public function verifySignature(array $payload): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        $expected = hash('sha512',
            ($payload['order_id'] ?? '').($payload['status_code'] ?? '').($payload['gross_amount'] ?? '').$this->serverKey
        );

        return hash_equals($expected, (string) ($payload['signature_key'] ?? ''));
    }
}
