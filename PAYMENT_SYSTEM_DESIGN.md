# UNDESIA — Rancangan Sistem Payment Gateway
## Dokumen Teknis: Multi-Gateway Payment System

> **Versi**: 1.0.0  
> **Tanggal**: 10 Juni 2026  
> **Berdasarkan**: SYSTEM_REDESIGN.md v1.0.0 + PLATFORM_FULL_DESIGN.md v2.0.0  
> **Tujuan**: Rancangan lengkap sistem pembayaran yang fleksibel, aman, dan mudah dikonfigurasi tanpa perubahan kode.

---

## Daftar Isi

1. [Arsitektur Sistem Payment](#1-arsitektur-sistem-payment)
2. [Rancangan Database](#2-rancangan-database)
3. [Implementasi Provider](#3-implementasi-provider)
4. [Sistem Amplop Digital](#4-sistem-amplop-digital)
5. [Rancangan UI/UX Admin](#5-rancangan-uiux-admin)
6. [Rancangan UI/UX Customer](#6-rancangan-uiux-customer)
7. [Keamanan & Enkripsi](#7-keamanan--enkripsi)
8. [Webhook & Callback](#8-webhook--callback)
9. [Dashboard Transaksi](#9-dashboard-transaksi)
10. [Roadmap Penambahan Provider Baru](#10-roadmap-penambahan-provider-baru)

---

## 1. Arsitektur Sistem Payment

### 1.1 Gambaran Umum

Sistem payment dirancang dengan **Strategy Pattern** dan **Abstract Factory**. Setiap payment gateway adalah sebuah *provider* yang mengimplementasikan interface yang sama. Alur transaksi utama tidak pernah berubah — hanya provider yang berganti.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ALUR TRANSAKSI UTAMA                           │
│                                                                     │
│   User Checkout                                                     │
│       │                                                             │
│       ▼                                                             │
│   TransactionService::create()                                      │
│       │                                                             │
│       ▼                                                             │
│   PaymentGatewayManager::driver('midtrans')                         │
│       │                                                             │
│       ├── driver('midtrans')  → MidtransProvider                   │
│       ├── driver('xendit')    → XenditProvider                     │
│       ├── driver('manual')    → ManualTransferProvider              │
│       ├── driver('tripay')    → TripayProvider     (masa depan)     │
│       ├── driver('duitku')    → DuitkuProvider     (masa depan)     │
│       └── driver('stripe')    → StripeProvider     (masa depan)     │
│                                                                     │
│   Setiap Provider mengimplementasikan:                              │
│   PaymentGatewayInterface                                           │
│       ├── createPayment(Transaction): PaymentResult                 │
│       ├── processWebhook(Request): WebhookResult                   │
│       ├── checkStatus(string $ref): PaymentStatus                  │
│       └── refund(Payment, float $amount): RefundResult             │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Dua Konteks Payment yang Berbeda

Platform ini memiliki **dua konteks payment yang berbeda** dan harus dipahami dengan jelas:

```
KONTEKS 1: PEMBAYARAN PAKET UNDANGAN
─────────────────────────────────────
User membayar kepada PLATFORM UNDESIA
untuk mengaktifkan paket undangan.

  User → [pilih paket] → [bayar ke Undesia] → [undangan aktif]

  Dicatat di: transactions + payments
  Dikelola di: Admin Panel > Transaksi


KONTEKS 2: AMPLOP DIGITAL
──────────────────────────
Tamu memberi hadiah/angpao kepada PEMILIK UNDANGAN
melalui undangan yang sudah aktif.

  Tamu → [buka undangan] → [kirim amplop] → [transfer ke rekening owner]

  Dicatat di: digital_envelope_transactions
  Dikelola di: Dashboard Owner > Amplop Digital

PENTING: Kedua konteks ini menggunakan provider yang SAMA
         tapi konfigurasi dan alur yang BERBEDA.
```

### 1.3 Komponen Utama

```
app/
├── Services/
│   ├── Payment/
│   │   ├── PaymentGatewayManager.php      ← Factory & registry provider
│   │   ├── PaymentGatewayConfig.php       ← Ambil config dari DB (cached)
│   │   ├── Contracts/
│   │   │   └── PaymentGatewayInterface.php← Interface wajib semua provider
│   │   ├── DTOs/
│   │   │   ├── PaymentResult.php          ← Return value createPayment()
│   │   │   ├── WebhookResult.php          ← Return value processWebhook()
│   │   │   └── PaymentStatus.php          ← Enum status dari gateway
│   │   └── Providers/
│   │       ├── MidtransProvider.php
│   │       ├── XenditProvider.php
│   │       ├── ManualTransferProvider.php
│   │       └── AbstractProvider.php       ← Base class shared logic
```

---

## 2. Rancangan Database

### 2.1 ERD Payment System

```
payment_gateway_configs (1) ─────── (many) payment_gateway_bank_accounts
    │
    │ (digunakan oleh)
    │
transactions (1) ─────────────────── (many) payments
    │                                            │
    └── belongs_to: invitations                  └── confirmed_by: admin_users
    └── belongs_to: packages
    └── belongs_to: users

invitations (1) ──────────────────── (many) digital_envelope_transactions
                                                 │
                                                 ├── gateway: payment_gateway_configs.driver
                                                 └── confirmed_by: admin_users (manual)

invitations (1) ──────────────────── (many) invitation_payment_methods
                                              [metode yang diaktifkan per undangan]

payment_gateway_configs (1) ──────── (many) payment_gateway_audit_logs
```

### 2.2 Skema Tabel Lengkap

#### `payment_gateway_configs` — Konfigurasi Gateway

```sql
CREATE TABLE payment_gateway_configs (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    driver          VARCHAR(50) NOT NULL UNIQUE,
    -- nilai: 'manual', 'midtrans', 'xendit', 'tripay', 'duitku', 'stripe'

    label           VARCHAR(100) NOT NULL,
    -- tampilan: 'Transfer Bank Manual', 'Midtrans', 'Xendit'

    icon_path       VARCHAR(500) NULL,
    description     TEXT NULL,

    is_active       BOOLEAN DEFAULT FALSE,
    -- master switch: apakah gateway ini boleh digunakan di platform

    environment     ENUM('sandbox', 'production') DEFAULT 'sandbox',
    -- berlaku untuk gateway yang punya environment (Midtrans, Xendit)

    credentials     TEXT NULL,
    -- JSON terenkripsi (AES-256): berisi API keys, secret keys, dll.
    -- Tidak pernah ditampilkan plaintext di UI, hanya di-set

    webhook_secret  VARCHAR(500) NULL,
    -- token verifikasi webhook, disimpan terenkripsi

    config_json     JSON NULL,
    -- konfigurasi non-sensitif: timeout, retry, dll.

    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

**Contoh data:**
```sql
INSERT INTO payment_gateway_configs VALUES
(1, 'manual',   'Transfer Bank Manual', '/icons/bank.svg',   NULL, TRUE,  'production', NULL, NULL, NULL, 0),
(2, 'midtrans', 'Midtrans',             '/icons/midtrans.svg',NULL, FALSE, 'sandbox',    '...encrypted...', '...', NULL, 1),
(3, 'xendit',   'Xendit',               '/icons/xendit.svg',  NULL, FALSE, 'sandbox',    '...encrypted...', '...', NULL, 2);
```

#### `payment_gateway_bank_accounts` — Rekening Transfer Manual

```sql
CREATE TABLE payment_gateway_bank_accounts (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    -- Rekening PLATFORM (bukan rekening tamu)
    -- Ini adalah rekening milik Undesia untuk menerima pembayaran paket

    bank_name       VARCHAR(100) NOT NULL,
    -- 'BCA', 'BRI', 'Mandiri', 'BNI', 'CIMB Niaga', dll.

    bank_code       VARCHAR(20) NULL,
    -- kode bank untuk keperluan validasi: '014', '002', dll.

    account_number  VARCHAR(50) NOT NULL,
    account_name    VARCHAR(255) NOT NULL,
    logo_path       VARCHAR(500) NULL,

    instructions    TEXT NULL,
    -- instruksi pembayaran yang ditampilkan ke user
    -- misal: "Transfer ke nomor rekening di atas, lalu konfirmasi via WA"

    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

#### `invitation_payment_methods` — Metode Aktif per Undangan

```sql
CREATE TABLE invitation_payment_methods (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    driver          VARCHAR(50) NOT NULL,
    -- merujuk ke payment_gateway_configs.driver

    is_active       BOOLEAN DEFAULT TRUE,
    -- owner bisa on/off per undangan

    config_override JSON NULL,
    -- jika owner ingin override config (misal: pakai akun Xendit sendiri)
    -- NULL = gunakan konfigurasi global platform

    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,

    UNIQUE KEY uq_inv_driver (invitation_id, driver),
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
```

#### `transactions` — Revisi dari SYSTEM_REDESIGN.md

```sql
-- Modifikasi tabel transactions (tambah kolom):
ALTER TABLE transactions ADD COLUMN
    gateway_driver  VARCHAR(50) NULL,
    -- driver yang dipilih user: 'midtrans', 'xendit', 'manual'

    payment_url     TEXT NULL,
    -- URL redirect ke halaman bayar (Midtrans/Xendit)

    payment_code    VARCHAR(255) NULL,
    -- kode VA, kode bayar, dll.

    snap_token      VARCHAR(500) NULL,
    -- khusus Midtrans: snap token untuk embedding

    xendit_invoice_id VARCHAR(255) NULL,
    -- khusus Xendit: invoice ID

    gateway_ref     VARCHAR(255) NULL;
    -- reference dari gateway (order_id, payment_id)
```

#### `payments` — Revisi dari SYSTEM_REDESIGN.md

```sql
-- Modifikasi tabel payments (gunakan VARCHAR bukan ENUM):
-- Alasan: ENUM membutuhkan ALTER TABLE setiap kali provider baru ditambahkan.
-- VARCHAR(50) tidak memerlukan perubahan skema untuk provider masa depan.
ALTER TABLE payments MODIFY COLUMN
    gateway VARCHAR(50) NOT NULL;

ALTER TABLE payments ADD COLUMN
    payment_channel VARCHAR(100) NULL;
    -- channel spesifik: 'BCA_VA', 'OVO', 'QRIS', 'INDOMARET', dll.
```

#### `digital_envelope_transactions` — Amplop Digital Tamu

```sql
CREATE TABLE digital_envelope_transactions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,

    -- Data pengirim
    sender_name     VARCHAR(255) NOT NULL,
    sender_phone    VARCHAR(20) NULL,
    sender_message  TEXT NULL,         -- ucapan sekalian

    -- Data pembayaran
    gateway_driver  VARCHAR(50) NOT NULL,
    -- 'manual', 'xendit', 'midtrans', 'qris_static'

    payment_channel VARCHAR(100) NULL,
    -- 'BCA', 'OVO', 'QRIS', dll.

    amount          DECIMAL(12,2) NOT NULL,
    gateway_ref     VARCHAR(255) NULL,
    payment_url     TEXT NULL,

    status          ENUM('pending','paid','failed','expired') DEFAULT 'pending',

    proof_image     VARCHAR(500) NULL,
    -- bukti transfer untuk pembayaran manual

    confirmed_by    BIGINT UNSIGNED NULL,
    -- admin_user_id jika dikonfirmasi manual

    confirmed_at    TIMESTAMP NULL,
    paid_at         TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,

    payload         JSON NULL,         -- raw callback data dari gateway

    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,

    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    INDEX idx_env_status (invitation_id, status),
    INDEX idx_env_gateway_ref (gateway_ref)
);
```

#### `payment_gateway_audit_logs` — Audit Trail Konfigurasi

```sql
CREATE TABLE payment_gateway_audit_logs (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id   BIGINT UNSIGNED NOT NULL,
    driver          VARCHAR(50) NOT NULL,
    action          VARCHAR(100) NOT NULL,
    -- 'credentials_updated', 'activated', 'deactivated',
    -- 'environment_changed', 'bank_account_added', 'bank_account_deleted'

    description     TEXT NULL,
    old_value       TEXT NULL,         -- tidak menyimpan credentials, hanya metadata
    new_value       TEXT NULL,
    ip_address      VARCHAR(45) NULL,
    user_agent      TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_driver (driver),
    INDEX idx_audit_admin (admin_user_id)
);
```

### 2.3 Relasi Lengkap Payment System

```
payment_gateway_configs
    │ (1:N)
    └── payment_gateway_bank_accounts   (rekening manual platform)
    │ (1:N)
    └── payment_gateway_audit_logs      (riwayat perubahan config)

invitations
    │ (1:N)
    ├── invitation_payment_methods      (metode aktif per undangan)
    │ (1:1)
    ├── transactions
    │       │ (1:N)
    │       └── payments                (attempt pembayaran)
    │ (1:N)
    └── digital_envelope_transactions   (amplop dari tamu)
```

---

## 3. Implementasi Provider

### 3.1 Interface Wajib Semua Provider

```php
<?php

namespace App\Services\Payment\Contracts;

use App\Models\{Transaction, Payment};
use App\Services\Payment\DTOs\{PaymentResult, WebhookResult, PaymentStatus};
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Buat payment request ke gateway.
     * Return: URL redirect, snap token, VA number, dll.
     */
    public function createPayment(Transaction $transaction): PaymentResult;

    /**
     * Proses incoming webhook/callback dari gateway.
     * Wajib verifikasi signature sebelum memproses.
     */
    public function processWebhook(Request $request): WebhookResult;

    /**
     * Cek status pembayaran langsung ke gateway (polling/manual check).
     */
    public function checkStatus(string $gatewayRef): PaymentStatus;

    /**
     * Proses refund untuk pembayaran yang sudah sukses.
     */
    public function refund(Payment $payment, float $amount, string $reason = ''): bool;

    /**
     * Validasi konfigurasi credentials saat admin menyimpan.
     * Lempar exception jika tidak valid.
     */
    public function validateCredentials(array $credentials): bool;

    /**
     * Nama driver untuk identifikasi.
     */
    public function getDriver(): string;

    /**
     * Apakah gateway ini mendukung refund otomatis.
     */
    public function supportsAutoRefund(): bool;
}
```

### 3.2 Abstract Base Provider

```php
<?php

namespace App\Services\Payment\Providers;

use App\Models\{Transaction, Payment};
use App\Models\PaymentGatewayConfig;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\DTOs\PaymentResult;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

abstract class AbstractProvider implements PaymentGatewayInterface
{
    protected array $credentials = [];
    protected array $config = [];
    protected string $environment = 'sandbox';

    public function __construct(protected PaymentGatewayConfig $gatewayConfig)
    {
        $this->environment = $gatewayConfig->environment;
        $this->config      = $gatewayConfig->config_json ?? [];

        // Decrypt credentials dari database
        if ($gatewayConfig->credentials) {
            $this->credentials = json_decode(
                Crypt::decryptString($gatewayConfig->credentials),
                true
            ) ?? [];
        }
    }

    /**
     * Apakah gateway dalam mode production.
     */
    protected function isProduction(): bool
    {
        return $this->environment === 'production';
    }

    /**
     * Ambil credential dengan fallback aman.
     */
    protected function credential(string $key, mixed $default = null): mixed
    {
        return $this->credentials[$key] ?? $default;
    }

    /**
     * Generate invoice number yang unik dan konsisten.
     */
    protected function generateInvoiceRef(Transaction $transaction): string
    {
        return 'UNDESIA-' . $transaction->invoice_number;
    }

    /**
     * Format amount ke integer (sen) jika diperlukan gateway.
     */
    protected function toMinorUnit(float $amount): int
    {
        return (int) round($amount * 100);
    }

    /**
     * Log webhook yang diterima untuk debugging.
     */
    protected function logWebhook(string $driver, array $payload, string $status): void
    {
        \Log::channel('payment')->info("Webhook [{$driver}]", [
            'status'  => $status,
            'payload' => $payload,
        ]);
    }

    public function supportsAutoRefund(): bool
    {
        return false; // default: refund manual. Override di provider yang support
    }
}
```

### 3.3 PaymentResult DTO

```php
<?php

namespace App\Services\Payment\DTOs;

class PaymentResult
{
    public function __construct(
        public readonly bool   $success,
        public readonly string $driver,
        public readonly string $gatewayRef,     // ID dari gateway

        // Tipe response (hanya satu yang diisi)
        public readonly ?string $paymentUrl = null,    // redirect ke halaman bayar
        public readonly ?string $snapToken  = null,    // Midtrans: embed di halaman
        public readonly ?string $vaNumber   = null,    // Virtual Account number
        public readonly ?string $paymentCode = null,   // kode bayar retail

        // Metode yang dipakai
        public readonly ?string $paymentChannel = null,// 'BCA_VA', 'OVO', 'QRIS'

        // Waktu kadaluarsa
        public readonly ?\DateTime $expiresAt = null,

        // Error jika !success
        public readonly ?string $errorCode    = null,
        public readonly ?string $errorMessage = null,
    ) {}

    public static function success(
        string $driver,
        string $gatewayRef,
        array $data = []
    ): self {
        return new self(success: true, driver: $driver, gatewayRef: $gatewayRef, ...$data);
    }

    public static function failed(string $driver, string $code, string $message): self
    {
        return new self(
            success: false,
            driver: $driver,
            gatewayRef: '',
            errorCode: $code,
            errorMessage: $message
        );
    }
}
```

### 3.4 WebhookResult DTO

```php
<?php

namespace App\Services\Payment\DTOs;

enum PaymentStatusEnum: string
{
    case Pending  = 'pending';
    case Paid     = 'paid';
    case Failed   = 'failed';
    case Expired  = 'expired';
    case Refunded = 'refunded';
}

class WebhookResult
{
    public function __construct(
        public readonly bool              $valid,        // signature valid?
        public readonly bool              $processed,    // berhasil diproses?
        public readonly string            $gatewayRef,   // reference dari gateway
        public readonly PaymentStatusEnum $status,       // status yang di-update
        public readonly float             $amount,       // amount yang dibayar
        public readonly ?string           $paymentChannel = null,
        public readonly ?string           $errorMessage   = null,
    ) {}
}
```

### 3.5 MidtransProvider

```php
<?php

namespace App\Services\Payment\Providers;

use App\Models\{Transaction, Payment};
use App\Services\Payment\DTOs\{PaymentResult, WebhookResult, PaymentStatusEnum};
use Illuminate\Http\Request;
use Midtrans\{Config, Snap, Transaction as MidtransTransaction};

class MidtransProvider extends AbstractProvider
{
    public function getDriver(): string
    {
        return 'midtrans';
    }

    private function configure(): void
    {
        Config::$serverKey    = $this->credential('server_key');
        Config::$clientKey    = $this->credential('client_key');
        Config::$isProduction = $this->isProduction();
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function createPayment(Transaction $transaction): PaymentResult
    {
        $this->configure();

        try {
            $params = [
                'transaction_details' => [
                    'order_id'     => $this->generateInvoiceRef($transaction),
                    'gross_amount' => (int) $transaction->amount,
                ],
                'customer_details' => [
                    'first_name' => $transaction->user->name,
                    'email'      => $transaction->user->email,
                    'phone'      => $transaction->user->profile?->phone,
                ],
                'item_details' => [
                    [
                        'id'       => $transaction->package->slug,
                        'price'    => (int) $transaction->amount,
                        'quantity' => 1,
                        'name'     => 'Paket ' . $transaction->package->name
                                    . ' - ' . $transaction->invitation->title,
                    ],
                ],
                'callbacks' => [
                    'finish' => route('payment.finish', $transaction->invoice_number),
                ],
            ];

            $snapToken = Snap::getSnapToken($params);

            return PaymentResult::success('midtrans', $this->generateInvoiceRef($transaction), [
                'snapToken'  => $snapToken,
                'paymentUrl' => $this->isProduction()
                    ? 'https://app.midtrans.com/snap/v2/vtweb/' . $snapToken
                    : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken,
                'expiresAt'  => now()->addHours(24)->toDateTime(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Midtrans createPayment failed', [
                'transaction' => $transaction->invoice_number,
                'error'       => $e->getMessage(),
            ]);

            return PaymentResult::failed('midtrans', 'CREATE_FAILED', $e->getMessage());
        }
    }

    public function processWebhook(Request $request): WebhookResult
    {
        $this->configure();

        $payload = $request->all();

        // Verifikasi signature Midtrans
        $expectedSig = hash(
            'sha512',
            $payload['order_id']
            . $payload['status_code']
            . $payload['gross_amount']
            . $this->credential('server_key')
        );

        if ($expectedSig !== ($payload['signature_key'] ?? '')) {
            $this->logWebhook('midtrans', $payload, 'INVALID_SIGNATURE');

            return new WebhookResult(
                valid: false,
                processed: false,
                gatewayRef: $payload['order_id'] ?? '',
                status: PaymentStatusEnum::Failed,
                amount: 0,
                errorMessage: 'Invalid signature'
            );
        }

        $status = match($payload['transaction_status'] ?? '') {
            'capture', 'settlement' => PaymentStatusEnum::Paid,
            'pending'               => PaymentStatusEnum::Pending,
            'deny', 'cancel'        => PaymentStatusEnum::Failed,
            'expire'                => PaymentStatusEnum::Expired,
            'refund'                => PaymentStatusEnum::Refunded,
            default                 => PaymentStatusEnum::Pending,
        };

        $this->logWebhook('midtrans', $payload, $status->value);

        return new WebhookResult(
            valid: true,
            processed: true,
            gatewayRef: $payload['order_id'],
            status: $status,
            amount: (float) ($payload['gross_amount'] ?? 0),
            paymentChannel: $payload['payment_type'] ?? null,
        );
    }

    public function checkStatus(string $gatewayRef): PaymentStatusEnum
    {
        $this->configure();

        try {
            $result = MidtransTransaction::status($gatewayRef);
            return match($result->transaction_status) {
                'capture', 'settlement' => PaymentStatusEnum::Paid,
                'pending'               => PaymentStatusEnum::Pending,
                'expire'                => PaymentStatusEnum::Expired,
                default                 => PaymentStatusEnum::Failed,
            };
        } catch (\Exception $e) {
            return PaymentStatusEnum::Pending;
        }
    }

    public function validateCredentials(array $credentials): bool
    {
        if (empty($credentials['server_key']) || empty($credentials['client_key'])) {
            throw new \InvalidArgumentException('Server Key dan Client Key wajib diisi.');
        }
        return true;
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): bool
    {
        // Midtrans refund via API (untuk gateway payment yang support)
        // Implementasi sesuai Midtrans Refund API
        return false; // Implementasi di Phase 2
    }

    public function supportsAutoRefund(): bool
    {
        return true;
    }
}
```

### 3.6 XenditProvider

```php
<?php

namespace App\Services\Payment\Providers;

use App\Models\{Transaction, Payment};
use App\Services\Payment\DTOs\{PaymentResult, WebhookResult, PaymentStatusEnum};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class XenditProvider extends AbstractProvider
{
    public function getDriver(): string
    {
        return 'xendit';
    }

    private function baseUrl(): string
    {
        return 'https://api.xendit.co';
    }

    private function headers(): array
    {
        return [
            'Authorization' => 'Basic ' . base64_encode($this->credential('secret_key') . ':'),
            'Content-Type'  => 'application/json',
        ];
    }

    public function createPayment(Transaction $transaction): PaymentResult
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post("{$this->baseUrl()}/v2/invoices", [
                    'external_id'       => $this->generateInvoiceRef($transaction),
                    'amount'            => (int) $transaction->amount,
                    'description'       => 'Paket ' . $transaction->package->name
                                         . ' — ' . $transaction->invitation->title,
                    'invoice_duration'  => 86400, // 24 jam
                    'customer'          => [
                        'given_names'   => $transaction->user->name,
                        'email'         => $transaction->user->email,
                        'mobile_number' => $transaction->user->profile?->phone,
                    ],
                    'success_redirect_url' => route('payment.finish', $transaction->invoice_number),
                    'failure_redirect_url' => route('payment.failed', $transaction->invoice_number),
                    'currency'          => 'IDR',
                    'items'             => [
                        [
                            'name'       => $transaction->invitation->title,
                            'quantity'   => 1,
                            'price'      => (int) $transaction->amount,
                            'category'   => 'Digital Service',
                        ],
                    ],
                ]);

            if ($response->failed()) {
                throw new \Exception($response->json('message', 'Xendit error'));
            }

            $data = $response->json();

            return PaymentResult::success('xendit', $data['id'], [
                'paymentUrl' => $data['invoice_url'],
                'expiresAt'  => now()->addDay()->toDateTime(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Xendit createPayment failed', [
                'transaction' => $transaction->invoice_number,
                'error'       => $e->getMessage(),
            ]);

            return PaymentResult::failed('xendit', 'CREATE_FAILED', $e->getMessage());
        }
    }

    public function processWebhook(Request $request): WebhookResult
    {
        // Verifikasi Xendit webhook token
        $token = $request->header('x-callback-token');
        if ($token !== $this->credential('webhook_token')) {
            return new WebhookResult(
                valid: false, processed: false,
                gatewayRef: '', status: PaymentStatusEnum::Failed,
                amount: 0, errorMessage: 'Invalid webhook token'
            );
        }

        $payload = $request->all();

        $status = match($payload['status'] ?? '') {
            'PAID'    => PaymentStatusEnum::Paid,
            'SETTLED' => PaymentStatusEnum::Paid,
            'EXPIRED' => PaymentStatusEnum::Expired,
            'PENDING' => PaymentStatusEnum::Pending,
            default   => PaymentStatusEnum::Pending,
        };

        $this->logWebhook('xendit', $payload, $status->value);

        return new WebhookResult(
            valid: true,
            processed: true,
            gatewayRef: $payload['external_id'] ?? $payload['id'],
            status: $status,
            amount: (float) ($payload['amount'] ?? 0),
            paymentChannel: $payload['payment_method'] ?? null,
        );
    }

    public function checkStatus(string $gatewayRef): PaymentStatusEnum
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get("{$this->baseUrl()}/v2/invoices/{$gatewayRef}");

            return match($response->json('status')) {
                'PAID', 'SETTLED' => PaymentStatusEnum::Paid,
                'EXPIRED'         => PaymentStatusEnum::Expired,
                'PENDING'         => PaymentStatusEnum::Pending,
                default           => PaymentStatusEnum::Pending,
            };
        } catch (\Exception $e) {
            return PaymentStatusEnum::Pending;
        }
    }

    public function validateCredentials(array $credentials): bool
    {
        if (empty($credentials['secret_key'])) {
            throw new \InvalidArgumentException('Secret API Key wajib diisi.');
        }

        // Test koneksi ke Xendit API
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($credentials['secret_key'] . ':'),
        ])->get('https://api.xendit.co/balance');

        if ($response->status() === 401) {
            throw new \InvalidArgumentException('Secret API Key tidak valid.');
        }

        return true;
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): bool
    {
        return false; // Implementasi di Phase 2
    }

    public function supportsAutoRefund(): bool
    {
        return true;
    }
}
```

### 3.7 ManualTransferProvider

```php
<?php

namespace App\Services\Payment\Providers;

use App\Models\{Transaction, Payment};
use App\Services\Payment\DTOs\{PaymentResult, WebhookResult, PaymentStatusEnum};
use Illuminate\Http\Request;

class ManualTransferProvider extends AbstractProvider
{
    public function getDriver(): string
    {
        return 'manual';
    }

    public function createPayment(Transaction $transaction): PaymentResult
    {
        // Tidak ada API call — langsung return instruksi transfer
        return PaymentResult::success('manual', $this->generateInvoiceRef($transaction), [
            'paymentCode' => $this->generateInvoiceRef($transaction),
            'expiresAt'   => now()->addDays(3)->toDateTime(),
        ]);
        // User akan melihat daftar rekening bank di halaman konfirmasi
        // dan mengupload bukti transfer
    }

    public function processWebhook(Request $request): WebhookResult
    {
        // Manual transfer tidak punya webhook dari luar
        // Konfirmasi dilakukan oleh admin secara manual
        return new WebhookResult(
            valid: false, processed: false,
            gatewayRef: '', status: PaymentStatusEnum::Pending,
            amount: 0, errorMessage: 'Manual transfer tidak menggunakan webhook'
        );
    }

    public function checkStatus(string $gatewayRef): PaymentStatusEnum
    {
        // Cek dari tabel payments, bukan dari gateway eksternal
        $payment = Payment::where('gateway_ref', $gatewayRef)->first();
        return match($payment?->status) {
            'success' => PaymentStatusEnum::Paid,
            'failed'  => PaymentStatusEnum::Failed,
            default   => PaymentStatusEnum::Pending,
        };
    }

    public function validateCredentials(array $credentials): bool
    {
        return true; // Manual transfer tidak butuh credentials
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): bool
    {
        return false; // Refund manual: dicatat admin, transfer balik manual
    }
}
```

### 3.8 PaymentGatewayManager

```php
<?php

namespace App\Services\Payment;

use App\Models\PaymentGatewayConfig;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\Providers\{
    MidtransProvider,
    XenditProvider,
    ManualTransferProvider,
};
use Illuminate\Support\Facades\Cache;

class PaymentGatewayManager
{
    private static array $drivers = [
        'midtrans' => MidtransProvider::class,
        'xendit'   => XenditProvider::class,
        'manual'   => ManualTransferProvider::class,
    ];

    /**
     * Daftarkan provider baru tanpa mengubah kode existing.
     * Dipanggil dari AppServiceProvider.
     */
    public static function extend(string $driver, string $providerClass): void
    {
        static::$drivers[$driver] = $providerClass;
    }

    /**
     * Ambil instance provider berdasarkan driver name.
     */
    public function driver(string $driver): PaymentGatewayInterface
    {
        $config = Cache::remember(
            "payment_config_{$driver}",
            300, // 5 menit
            fn() => PaymentGatewayConfig::where('driver', $driver)
                                         ->where('is_active', true)
                                         ->first()
        );

        if (!$config) {
            throw new \RuntimeException(
                "Payment gateway '{$driver}' tidak aktif atau tidak ditemukan."
            );
        }

        $providerClass = static::$drivers[$driver] ?? null;

        if (!$providerClass) {
            throw new \RuntimeException(
                "Driver '{$driver}' belum terdaftar di PaymentGatewayManager."
            );
        }

        return new $providerClass($config);
    }

    /**
     * Ambil semua driver yang aktif.
     */
    public function activeDrivers(): array
    {
        return Cache::remember('payment_active_drivers', 300, function () {
            return PaymentGatewayConfig::where('is_active', true)
                ->orderBy('sort_order')
                ->pluck('driver')
                ->toArray();
        });
    }

    /**
     * Invalidate cache setelah admin mengubah konfigurasi.
     */
    public static function clearCache(string $driver): void
    {
        Cache::forget("payment_config_{$driver}");
        Cache::forget('payment_active_drivers');
    }
}
```

### 3.9 Cara Mendaftarkan Provider Baru (Contoh TripAy)

```php
// app/Services/Payment/Providers/TripayProvider.php
class TripayProvider extends AbstractProvider
{
    public function getDriver(): string { return 'tripay'; }
    // ... implementasi interface
}

// app/Providers/AppServiceProvider.php
public function boot(): void
{
    // Daftarkan provider baru — 1 baris kode
    PaymentGatewayManager::extend('tripay', TripayProvider::class);
}

// database/seeders/PaymentGatewaySeeder.php
PaymentGatewayConfig::create([
    'driver'      => 'tripay',
    'label'       => 'TripAy',
    'icon_path'   => '/icons/tripay.svg',
    'is_active'   => false,
    'environment' => 'sandbox',
    'sort_order'  => 3,
]);
// Selesai — admin bisa aktifkan dan isi credentials dari panel
```

---

## 4. Sistem Amplop Digital

### 4.1 Alur Amplop Digital

```
Tamu membuka undangan
    │
    ▼
Klik "Kirim Amplop Digital"
    │
    ▼
Tamu isi: Nama, Nominal, Ucapan
    │
    ▼
Pilih metode pembayaran
  (hanya metode yang diaktifkan owner untuk undangan ini)
    ├── Transfer Bank (tampil nomor rekening owner)
    ├── QRIS          (tampil QR code milik owner)
    ├── Xendit        (redirect ke invoice)
    └── Midtrans      (redirect/embed snap)
    │
    ▼
Proses pembayaran
    │
    ├── Otomatis (Xendit/Midtrans):
    │     Webhook → DigitalEnvelopeWebhookController
    │             → DigitalEnvelopeService::confirm()
    │             → Notifikasi ke owner
    │
    └── Manual (Transfer Bank/QRIS Statis):
          Tamu upload bukti transfer
          Admin/Owner konfirmasi
          DigitalEnvelopeService::confirmManual()
          Notifikasi ke owner
```

### 4.2 DigitalEnvelopeService

```php
<?php

namespace App\Services;

use App\Models\{Invitation, DigitalEnvelopeTransaction};
use App\Services\Payment\PaymentGatewayManager;
use App\Services\Payment\DTOs\PaymentResult;

class DigitalEnvelopeService
{
    public function __construct(
        private readonly PaymentGatewayManager $paymentManager
    ) {}

    /**
     * Buat transaksi amplop digital baru.
     */
    public function initiate(
        Invitation $invitation,
        array $data
    ): array {
        // Validasi: apakah gateway yang dipilih aktif untuk undangan ini?
        $this->validateGatewayForInvitation($invitation, $data['gateway_driver']);

        $envelope = DigitalEnvelopeTransaction::create([
            'invitation_id' => $invitation->id,
            'sender_name'   => $data['sender_name'],
            'sender_phone'  => $data['sender_phone'] ?? null,
            'sender_message'=> $data['sender_message'] ?? null,
            'gateway_driver'=> $data['gateway_driver'],
            'amount'        => $data['amount'],
            'status'        => 'pending',
            'expires_at'    => now()->addDay(),
        ]);

        if ($data['gateway_driver'] === 'manual') {
            // Untuk manual: tidak perlu payment request, langsung tampilkan rekening
            return [
                'type'          => 'manual',
                'envelope_id'   => $envelope->id,
                'bank_accounts' => $invitation->bankAccounts,
                'qris_accounts' => $invitation->qrisAccounts,
                'instructions'  => 'Silakan transfer ke salah satu rekening di bawah ini, lalu upload bukti pembayaran.',
            ];
        }

        // Untuk gateway otomatis: buat payment request
        // Gunakan konfigurasi gateway milik platform (bukan owner)
        $provider = $this->paymentManager->driver($data['gateway_driver']);

        // Buat fake Transaction object untuk keperluan createPayment
        $fakeTransaction = $this->buildEnvelopeTransaction($envelope, $invitation);

        $result = $provider->createPayment($fakeTransaction);

        if (!$result->success) {
            $envelope->update(['status' => 'failed']);
            throw new \RuntimeException($result->errorMessage);
        }

        $envelope->update([
            'gateway_ref' => $result->gatewayRef,
            'payment_url' => $result->paymentUrl,
            'expires_at'  => $result->expiresAt,
        ]);

        return [
            'type'        => 'redirect',
            'envelope_id' => $envelope->id,
            'payment_url' => $result->paymentUrl,
        ];
    }

    /**
     * Konfirmasi pembayaran manual oleh admin/owner.
     */
    public function confirmManual(
        DigitalEnvelopeTransaction $envelope,
        int $confirmedBy,
        string $proofImagePath
    ): void {
        $envelope->update([
            'status'       => 'paid',
            'proof_image'  => $proofImagePath,
            'confirmed_by' => $confirmedBy,
            'confirmed_at' => now(),
            'paid_at'      => now(),
        ]);

        // Notifikasi ke owner undangan
        $this->notifyOwner($envelope);
    }

    private function validateGatewayForInvitation(
        Invitation $invitation,
        string $driver
    ): void {
        $allowed = $invitation->paymentMethods()
            ->where('driver', $driver)
            ->where('is_active', true)
            ->exists();

        if (!$allowed) {
            throw new \RuntimeException(
                "Metode pembayaran '{$driver}' tidak tersedia untuk undangan ini."
            );
        }
    }
}
```

### 4.3 Ringkasan Amplop Digital per Undangan

Dashboard owner untuk melihat semua amplop yang masuk:

```
GET /dashboard/invitations/{id}/envelope

Response data:
{
  "summary": {
    "total_received": 12500000,
    "total_paid": 12500000,
    "total_pending": 500000,
    "count_paid": 45,
    "count_pending": 3
  },
  "transactions": [
    {
      "id": 1,
      "sender_name": "Budi Santoso",
      "amount": 500000,
      "gateway_driver": "xendit",
      "payment_channel": "OVO",
      "status": "paid",
      "sender_message": "Selamat menempuh hidup baru!",
      "paid_at": "2026-06-10T10:30:00Z"
    }
  ]
}
```

---

## 5. Rancangan UI/UX Admin

### 5.1 Halaman Payment Gateway Settings

```
/admin/settings/payment-gateways

┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️  Pengaturan Payment Gateway                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🏦 Transfer Bank Manual                          [●] AKTIF   │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  3 rekening dikonfigurasi                                      │  │
│  │                                              [Kelola Rekening] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  💳 Midtrans                                  [○] NONAKTIF    │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  Environment: Sandbox  |  Credentials: Belum dikonfigurasi    │  │
│  │                                           [Konfigurasi] [▶ Aktifkan]│
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  💳 Xendit                                    [○] NONAKTIF    │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  Environment: Sandbox  |  Credentials: Belum dikonfigurasi    │  │
│  │                                           [Konfigurasi] [▶ Aktifkan]│
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ⚠️  Perubahan konfigurasi dicatat di audit log.                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Modal Konfigurasi Midtrans

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✕  Konfigurasi Midtrans                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Environment *                                                      │
│  ( ) Sandbox (Testing)    (●) Production                            │
│                                                                     │
│  Server Key *                                                       │
│  [••••••••••••••••••••••••••••••••] [👁 Tampilkan]                  │
│  ⚠️  Jangan bagikan Server Key kepada siapapun                      │
│                                                                     │
│  Client Key *                                                       │
│  [••••••••••••••••••••••••••••••••]                                 │
│                                                                     │
│  Merchant ID (opsional)                                             │
│  [                               ]                                 │
│                                                                     │
│  Webhook URL (salin ke dashboard Midtrans):                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ https://undesia.id/webhook/midtrans              [📋 Salin] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [🔍 Test Koneksi]                                                  │
│  ✅ Koneksi berhasil — Server Key valid                             │
│                                                                     │
│                                    [Batal]  [💾 Simpan Konfigurasi] │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Modal Konfigurasi Xendit

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✕  Konfigurasi Xendit                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Environment *                                                      │
│  (●) Development (Testing)    ( ) Production                        │
│                                                                     │
│  Secret API Key *                                                   │
│  [••••••••••••••••••••••••••••••••] [👁]                            │
│                                                                     │
│  Public Key (opsional, untuk client-side)                           │
│  [                               ]                                 │
│                                                                     │
│  Webhook Verification Token *                                       │
│  [••••••••••••••••••••••••••••••••]                                 │
│  Ambil dari Dashboard Xendit > Developers > Webhooks               │
│                                                                     │
│  Fitur yang Tersedia dengan Akun Ini:                               │
│  ✅ Virtual Account (BCA, BRI, BNI, Mandiri, Permata)              │
│  ✅ E-Wallet (OVO, DANA, ShopeePay, LinkAja)                       │
│  ✅ QRIS                                                            │
│  ✅ Kartu Kredit/Debit                                              │
│  ✅ Retail Outlet (Alfamart, Indomaret)                             │
│                                                                     │
│  Webhook URL (daftarkan di Xendit Dashboard):                       │
│  https://undesia.id/webhook/xendit                     [📋 Salin]  │
│                                                                     │
│  [🔍 Test Koneksi]                                                  │
│                                                                     │
│                                    [Batal]  [💾 Simpan Konfigurasi] │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.4 Halaman Kelola Rekening Manual

```
/admin/settings/payment-gateways/manual/bank-accounts

┌─────────────────────────────────────────────────────────────────────┐
│  ← Kembali   🏦 Rekening Transfer Bank Platform                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                                        [+ Tambah Rekening]          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🏦 BCA                                       [●] AKTIF     │   │
│  │  No. Rekening:  1234567890                                   │   │
│  │  Atas Nama:     PT Undesia Digital Nusantara                 │   │
│  │  Instruksi:     Transfer ke nomor di atas, konfirmasi WA     │   │
│  │                                          [Edit] [Nonaktifkan]│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🏦 BRI                                       [●] AKTIF     │   │
│  │  No. Rekening:  0987654321                                   │   │
│  │  Atas Nama:     PT Undesia Digital Nusantara                 │   │
│  │                                          [Edit] [Nonaktifkan]│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🏦 Mandiri                                   [○] NONAKTIF  │   │
│  │  No. Rekening:  1122334455                                   │   │
│  │  Atas Nama:     PT Undesia Digital Nusantara                 │   │
│  │                                            [Edit] [Aktifkan] │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.5 Audit Log Payment Gateway

```
/admin/settings/payment-gateways/audit-log

┌─────────────────────────────────────────────────────────────────────┐
│  📋 Audit Log — Perubahan Konfigurasi Payment                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Filter: Semua Gateway ▾]  [Pilih Tanggal ▾]    [🔍 Cari...]      │
│                                                                     │
│  ┌──────────┬──────────┬────────────────────────┬──────────────┐   │
│  │ Waktu    │ Admin    │ Aksi                   │ Gateway      │   │
│  ├──────────┼──────────┼────────────────────────┼──────────────┤   │
│  │ 10 Jun   │ Admin1   │ credentials_updated    │ Midtrans     │   │
│  │ 09:45    │          │ Credentials diperbarui  │              │   │
│  ├──────────┼──────────┼────────────────────────┼──────────────┤   │
│  │ 10 Jun   │ Admin1   │ environment_changed    │ Midtrans     │   │
│  │ 09:43    │          │ sandbox → production    │              │   │
│  ├──────────┼──────────┼────────────────────────┼──────────────┤   │
│  │ 09 Jun   │ SuperAdm │ activated              │ Manual       │   │
│  │ 14:22    │          │ Gateway diaktifkan     │              │   │
│  └──────────┴──────────┴────────────────────────┴──────────────┘   │
│                                                                     │
│  ⚠️  Nilai credentials tidak pernah dicatat di audit log.           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Rancangan UI/UX Customer

### 6.1 Pengaturan Pembayaran per Undangan

```
/dashboard/invitations/{id}/settings
→ Tab: Pembayaran

┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️  Pengaturan Pembayaran — Pernikahan Budi & Ani                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Pilih metode pembayaran yang tersedia untuk amplop digital tamu:   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🏦 Transfer Bank / QRIS Statis           [●] Aktif           │  │
│  │  Rekening yang Anda daftarkan di menu Amplop akan ditampilkan │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  💳 Midtrans                              [○] Nonaktif        │  │
│  │  Tersedia di platform (paket Gold+)                            │  │
│  │                                              [Aktifkan ▶]      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  💳 Xendit                                [●] Aktif           │  │
│  │  E-Wallet, Virtual Account, QRIS otomatis                     │  │
│  │                                           [Nonaktifkan]        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ℹ️  Metode yang diaktifkan akan muncul saat tamu mengirim amplop.  │
│                                                                     │
│                                              [💾 Simpan Pengaturan] │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Halaman Pembayaran Paket (Step 6 Wizard)

```
/invitations/wizard/{id}/payment

┌─────────────────────────────────────────────────────────────────────┐
│  ●──●──●──●──●──●  Step 6/6: Pembayaran                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Ringkasan Order                                                    │
│  ─────────────────────────────────────────────────────────────    │
│  Undangan:    Pernikahan Budi & Ani                                 │
│  Paket:       Gold (12 bulan)                                       │
│  Harga:       Rp 499.000                                           │
│                                                                     │
│  Pilih Metode Pembayaran                                           │
│  ─────────────────────────────────────────────────────────────    │
│                                                                     │
│  ● Transfer Bank Manual                                            │
│    Konfirmasi dalam 1x24 jam                                       │
│                                                                     │
│  ○ 💳 Midtrans                                                     │
│    Kartu Kredit, BCA VA, GoPay, QRIS                               │
│    Konfirmasi otomatis                                             │
│                                                                     │
│  ○ 💳 Xendit                                                       │
│    Virtual Account, OVO, DANA, QRIS                                │
│    Konfirmasi otomatis                                             │
│                                                                     │
│                                                                     │
│  Kode Promo / Voucher                                              │
│  [                    ] [Terapkan]                                 │
│                                                                     │
│  ──────────────────────────────────────────────────────────────   │
│  Total Pembayaran:                              Rp 499.000         │
│                                                                     │
│                              [← Kembali]  [Bayar Sekarang →]      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Konfirmasi Transfer Manual

```
/payment/manual/{invoice_number}

┌─────────────────────────────────────────────────────────────────────┐
│  🏦 Instruksi Transfer Bank                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ Order berhasil dibuat!                                          │
│                                                                     │
│  Silakan transfer ke salah satu rekening berikut:                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🏦 BCA                                                       │  │
│  │  1234567890                                    [📋 Salin]     │  │
│  │  a.n. PT Undesia Digital Nusantara                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🏦 BRI                                                       │  │
│  │  0987654321                                    [📋 Salin]     │  │
│  │  a.n. PT Undesia Digital Nusantara                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Jumlah Transfer (TEPAT):                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Rp 499.000                                    [📋 Salin]     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Kode Unik Invoice:   UNDESIA-INV-202606-0089                      │
│  Batas Bayar:         13 Juni 2026, 09:45 WIB                      │
│                                                                     │
│  Upload Bukti Transfer                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [📎 Pilih File atau Drag & Drop di sini]                     │  │
│  │  Format: JPG, PNG, PDF. Maks 5MB                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                                  [📤 Upload & Konfirmasi Transfer]  │
│                                                                     │
│  ℹ️  Tim kami akan memverifikasi dalam 1x24 jam                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.4 Dashboard Transaksi User

```
/dashboard/invitations/{id}/invoice

┌─────────────────────────────────────────────────────────────────────┐
│  🧾 Invoice & Pembayaran — Pernikahan Budi & Ani                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Invoice No: INV-202606-0089               ✅ LUNAS           │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  Paket Gold (12 bulan)              Rp 499.000               │  │
│  │  Metode: Xendit — OVO                                         │  │
│  │  Dibayar: 10 Juni 2026, 09:45 WIB                            │  │
│  │  Aktif hingga: 10 Juni 2027                                   │  │
│  │                                              [📥 Download PDF] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Riwayat Percobaan Pembayaran                                      │
│  ──────────────────────────────────────────────────────────────   │
│  ✅  10 Jun 09:45  Xendit (OVO)     Rp 499.000    Sukses          │
│  ❌  10 Jun 09:30  Xendit (BCA VA)  Rp 499.000    Expired         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Keamanan & Enkripsi

### 7.1 Enkripsi Credentials di Database

```php
// Credentials TIDAK PERNAH disimpan plaintext di database
// Gunakan Laravel Crypt (AES-256-CBC dengan APP_KEY)

// SIMPAN ke database:
$encrypted = Crypt::encryptString(json_encode([
    'server_key' => 'SB-Mid-server-...',
    'client_key' => 'SB-Mid-client-...',
]));
$config->update(['credentials' => $encrypted]);

// BACA dari database (hanya di dalam Provider):
$credentials = json_decode(Crypt::decryptString($config->credentials), true);

// TAMPILKAN ke admin UI:
// ❌ Jangan tampilkan nilai asli
// ✅ Tampilkan: "Dikonfigurasi (••••••••)" dengan tombol [Perbarui]
```

### 7.2 Webhook Signature Verification

Setiap webhook yang masuk harus diverifikasi sebelum diproses:

```php
// app/Http/Controllers/Webhook/MidtransWebhookController.php
public function handle(Request $request): JsonResponse
{
    // 1. Rate limiting pada webhook endpoint
    // (sudah di-handle di middleware)

    // 2. Delegate ke service — verifikasi di dalam provider
    $provider = $this->paymentManager->driver('midtrans');
    $result   = $provider->processWebhook($request);

    if (!$result->valid) {
        // Log attempt tapi jangan kasih info ke attacker
        \Log::warning('Invalid Midtrans webhook', [
            'ip' => $request->ip(),
        ]);
        return response()->json(['status' => 'ok']); // selalu 200 ke gateway
    }

    // 3. Proses update transaksi
    $this->transactionService->processWebhookResult($result);

    return response()->json(['status' => 'ok']);
}
```

### 7.3 Environment Variables yang Wajib

```bash
# .env — TIDAK ada credential gateway di sini
# Semua credential disimpan di database (terenkripsi)

APP_KEY=base64:...        # digunakan oleh Crypt facade
APP_ENV=production
APP_DEBUG=false           # WAJIB false di production

# Logging payment ke channel terpisah
LOG_PAYMENT_CHANNEL=daily
LOG_PAYMENT_PATH=storage/logs/payment.log
```

### 7.4 Permission untuk Akses Payment Config

```php
// Hanya super_admin yang dapat mengubah credentials gateway
// Admin biasa hanya dapat melihat status

'payment.gateway.view'        → admin, super_admin
'payment.gateway.activate'    → super_admin
'payment.gateway.credentials' → super_admin       ← paling sensitif
'payment.bank_account.manage' → admin, super_admin
'transaction.confirm.manual'  → admin, super_admin
'transaction.export'          → admin, super_admin
'transaction.refund'          → super_admin
```

---

## 8. Webhook & Callback

### 8.1 Route Webhook

```php
// routes/api.php

// Webhook tidak menggunakan CSRF dan tidak perlu auth
// Proteksi via signature verification di dalam provider

Route::prefix('webhook')->group(function () {
    Route::post('/midtrans', MidtransWebhookController::class)
         ->name('webhook.midtrans');

    Route::post('/xendit', XenditWebhookController::class)
         ->name('webhook.xendit');

    Route::post('/tripay', TripayWebhookController::class)
         ->name('webhook.tripay');

    // Amplop digital — webhook terpisah
    Route::post('/envelope/xendit', EnvelopeXenditWebhookController::class)
         ->name('webhook.envelope.xendit');

    Route::post('/envelope/midtrans', EnvelopeMidtransWebhookController::class)
         ->name('webhook.envelope.midtrans');
});
```

### 8.2 TransactionService::processWebhookResult()

```php
public function processWebhookResult(WebhookResult $result): void
{
    // Cari transaksi berdasarkan gateway_ref
    $transaction = Transaction::where('gateway_ref', $result->gatewayRef)->first()
        ?? Transaction::where('invoice_number',
            str_replace('UNDESIA-', '', $result->gatewayRef)
        )->first();

    if (!$transaction) {
        \Log::warning('Transaction not found for webhook', [
            'gateway_ref' => $result->gatewayRef,
        ]);
        return;
    }

    // Idempotency: jangan proses ulang jika sudah paid
    if ($transaction->status === 'paid') {
        return;
    }

    // Update status transaksi
    $paymentStatus = match($result->status) {
        PaymentStatusEnum::Paid     => 'paid',
        PaymentStatusEnum::Failed   => 'failed',
        PaymentStatusEnum::Expired  => 'expired',
        PaymentStatusEnum::Refunded => 'refunded',
        default                     => 'pending',
    };

    $transaction->update(['status' => $paymentStatus]);

    // Catat payment record
    Payment::create([
        'transaction_id'  => $transaction->id,
        'gateway'         => $transaction->gateway_driver,
        'gateway_ref'     => $result->gatewayRef,
        'amount'          => $result->amount,
        'status'          => $result->status === PaymentStatusEnum::Paid ? 'success' : 'failed',
        'payment_channel' => $result->paymentChannel,
        'payload'         => request()->all(),
    ]);

    // Jika paid: aktifkan undangan
    if ($result->status === PaymentStatusEnum::Paid) {
        $this->activateInvitation($transaction);
        event(new PaymentReceived($transaction));
    }
}

private function activateInvitation(Transaction $transaction): void
{
    $invitation  = $transaction->invitation;
    $package     = $transaction->package;

    $expiredAt = $package->duration_days
        ? now()->addDays($package->duration_days)
        : null;

    $invitation->update([
        'status'       => 'active',
        'published_at' => now(),
        'expired_at'   => $expiredAt,
    ]);

    $transaction->update(['paid_at' => now()]);
}
```

---

## 9. Dashboard Transaksi Admin

### 9.1 Halaman Transaksi Admin

```
/admin/transactions

┌─────────────────────────────────────────────────────────────────────┐
│  💳 Manajemen Transaksi                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Rp 12.4M │ │   342    │ │    89    │ │    12    │              │
│  │Pendapatan│ │  Total   │ │  Lunas   │ │ Pending  │              │
│  │ Bulan Ini│ │Transaksi │ │          │ │          │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  [Status: Semua ▾] [Gateway: Semua ▾] [Tgl: Juni 2026 ▾] [🔍]    │
│                                                       [📥 Export CSV]│
│                                                                     │
│  ┌────┬──────────────┬────────────┬─────────────┬────────┬───────┐  │
│  │ #  │ User         │ Undangan   │ Nominal     │ Status │ Aksi  │  │
│  ├────┼──────────────┼────────────┼─────────────┼────────┼───────┤  │
│  │089 │ Budi Santoso │ Pernikahan │ Rp 499.000  │✅Lunas │[Lihat]│  │
│  │088 │ Sari Dewi    │ Ulang Thn  │ Rp 199.000  │⏳Pending│[Konfirmasi]│
│  │087 │ Ahmad Fauzi  │ Khitanan   │ Rp 299.000  │✅Lunas │[Lihat]│  │
│  └────┴──────────────┴────────────┴─────────────┴────────┴───────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Konfirmasi Manual oleh Admin

```
/admin/transactions/{id}/confirm

┌─────────────────────────────────────────────────────────────────────┐
│  ✕  Konfirmasi Pembayaran Manual                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Invoice:     INV-202606-0088                                       │
│  User:        Sari Dewi (sari@email.com)                           │
│  Undangan:    Ulang Tahun Rafa ke-5                                 │
│  Paket:       Basic (6 bulan)                                       │
│  Nominal:     Rp 199.000                                           │
│                                                                     │
│  Bukti Transfer yang Diupload User:                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                [PREVIEW GAMBAR BUKTI TRANSFER]                │  │
│  │                    [🔍 Buka Ukuran Penuh]                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Catatan Admin (opsional):                                         │
│  [Transfer valid, sesuai nominal...                            ]    │
│                                                                     │
│            [❌ Tolak Pembayaran]    [✅ Konfirmasi & Aktifkan]     │
│                                                                     │
│  ⚠️  Setelah dikonfirmasi, undangan akan langsung aktif.           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Roadmap Penambahan Provider Baru

### 10.1 Checklist Menambah Provider Baru

Untuk menambah payment gateway baru (misal: **Duitku**), ikuti langkah berikut:

```
□ 1. Buat file: app/Services/Payment/Providers/DuitkuProvider.php
     Extend AbstractProvider, implement semua method interface

□ 2. Daftarkan di AppServiceProvider:
     PaymentGatewayManager::extend('duitku', DuitkuProvider::class);

□ 3. Tambah seeder atau migration untuk data konfigurasi:
     INSERT INTO payment_gateway_configs
     (driver, label, icon_path, is_active, sort_order)
     VALUES ('duitku', 'Duitku', '/icons/duitku.svg', false, 4);

□ 4. Tidak perlu ubah skema tabel payments:
     -- Kolom gateway sudah VARCHAR(50), tidak butuh ALTER TABLE.
     -- Provider baru langsung bisa digunakan tanpa migrasi DB.

□ 5. Tambah route webhook di routes/api.php:
     Route::post('/duitku', DuitkuWebhookController::class);

□ 6. Buat controller webhook:
     app/Http/Controllers/Webhook/DuitkuWebhookController.php

□ 7. Upload icon gateway ke public/icons/duitku.svg

□ 8. Test di sandbox, kemudian admin aktifkan dari panel
```

### 10.2 Rekomendasi: Ubah ENUM ke VARCHAR

Untuk menghindari ALTER TABLE setiap kali menambah provider, ubah kolom `gateway` di tabel `payments`:

```sql
-- Dari ENUM ke VARCHAR — lebih fleksibel
ALTER TABLE payments MODIFY COLUMN
    gateway VARCHAR(50) NOT NULL;

-- Index untuk query by gateway
CREATE INDEX idx_payments_gateway ON payments (gateway);
```

### 10.3 Target Provider di Masa Depan

| Provider | Driver Key | Priority | Notes |
|----------|-----------|----------|-------|
| TripAy | `tripay` | Tinggi | Sudah ada di sistem lama |
| Duitku | `duitku` | Sedang | Popular di Indonesia |
| iPaymu | `ipaymu` | Sedang | |
| Stripe | `stripe` | Rendah | Untuk market internasional |
| PayPal | `paypal` | Rendah | Untuk market internasional |

---

## Ringkasan Keputusan Arsitektur

### Yang Penting Dipahami

| Aspek | Keputusan |
|-------|-----------|
| Pattern | Strategy Pattern + Abstract Factory |
| Kredensial | Disimpan terenkripsi di DB dengan Laravel Crypt (AES-256) |
| Cache config | 5 menit di Redis, di-invalidate saat admin update |
| Webhook | Selalu return 200 ke gateway; validasi di dalam |
| Idempotency | Cek `status === paid` sebelum proses webhook |
| Provider baru | 1 file Provider + 1 baris register = selesai |
| Amplop digital | Tabel terpisah `digital_envelope_transactions` |
| Payment paket | Tabel `transactions` + `payments` |
| Audit trail | Semua perubahan config dicatat, TANPA nilai credentials |
| Columns gateway | VARCHAR bukan ENUM — tidak butuh ALTER TABLE tiap provider baru |

---

*Dokumen ini disusun pada 10 Juni 2026 sebagai bagian dari rancangan platform Undesia v2.0.0*
*Berkaitan dengan: SYSTEM_REDESIGN.md, PLATFORM_FULL_DESIGN.md*
