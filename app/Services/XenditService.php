<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class XenditService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('xendit.api_key', '');
        $this->baseUrl = rtrim(config('xendit.base_url', 'https://api.xendit.co'), '/');
    }

    /**
     * Create a Xendit Invoice.
     *
     * @param  array{
     *   external_id: string,
     *   amount: float|int,
     *   payer_email: string,
     *   description: string,
     *   success_redirect_url: string,
     *   failure_redirect_url: string,
     *   currency?: string,
     * } $params
     */
    public function createInvoice(array $params): array
    {
        $params['currency'] ??= 'IDR';

        $response = Http::withBasicAuth($this->apiKey, '')
            ->acceptJson()
            ->post("{$this->baseUrl}/v2/invoices", $params);

        if ($response->failed()) {
            throw new RuntimeException(
                'Gagal membuat invoice Xendit: ' . ($response->json('message') ?? $response->body())
            );
        }

        return $response->json();
    }

    /**
     * Retrieve a Xendit Invoice by its ID.
     */
    public function getInvoice(string $invoiceId): array
    {
        $response = Http::withBasicAuth($this->apiKey, '')
            ->acceptJson()
            ->get("{$this->baseUrl}/v2/invoices/{$invoiceId}");

        if ($response->failed()) {
            throw new RuntimeException(
                'Gagal mengambil invoice Xendit: ' . ($response->json('message') ?? $response->body())
            );
        }

        return $response->json();
    }

    /**
     * Verify Xendit callback token from webhook header.
     */
    public function verifyWebhookToken(string $token): bool
    {
        $webhookToken = config('xendit.webhook_token', '');

        if ($webhookToken === '') {
            return true; // No token configured — allow (log a warning in production)
        }

        return hash_equals($webhookToken, $token);
    }
}
