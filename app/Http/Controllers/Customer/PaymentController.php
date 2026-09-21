<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Invitation;
use App\Models\Payment;
use App\Models\PaymentGatewayConfig;
use App\Models\Transaction;
use App\Services\UploadService;
use App\Services\XenditService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Only Xendit has a real payment integration today — this maps the
     * fine-grained method ids from admin settings to what Xendit can actually
     * process, so the checkout page never advertises a method nothing can charge.
     */
    private const XENDIT_METHODS = [
        'va_bca' => ['group' => 'Virtual Account', 'label' => 'BCA'],
        'va_bni' => ['group' => 'Virtual Account', 'label' => 'BNI'],
        'qris' => ['group' => 'QRIS', 'label' => 'QRIS'],
        'ovo' => ['group' => 'E-Wallet', 'label' => 'OVO'],
        'dana' => ['group' => 'E-Wallet', 'label' => 'DANA'],
        'shopeepay' => ['group' => 'E-Wallet', 'label' => 'ShopeePay'],
    ];

    /** Coarse per-gateway method ids (from PaymentSettingController::GATEWAY_SPECS) → fine ids above. */
    private const COARSE_TO_FINE = [
        'va' => ['va_bca', 'va_bni'],
        'qris' => ['qris'],
        'ewallet' => ['ovo', 'dana', 'shopeepay'],
    ];

    public function __construct(private readonly XenditService $xendit) {}

    /**
     * Payment methods actually available right now: enabled globally
     * (admin/settings/payment → Metode Pembayaran) AND enabled on the Xendit
     * gateway itself AND the Xendit gateway is active — all three must agree.
     */
    private function resolveActivePaymentMethods(): array
    {
        $xenditGateway = PaymentGatewayConfig::where('gateway_name', 'xendit')->first();
        $gatewayActive = (bool) $xenditGateway?->is_active;

        $globalEnabled = AppSetting::get('payment_enabled_methods', []);
        $gatewayEnabled = $xenditGateway?->config_extra['enabled_methods'] ?? [];
        $gatewayFine = collect($gatewayEnabled)->flatMap(fn ($c) => self::COARSE_TO_FINE[$c] ?? [])->all();

        $active = array_intersect(array_keys(self::XENDIT_METHODS), $globalEnabled, $gatewayFine);

        $groups = [];
        foreach ($active as $id) {
            $groups[self::XENDIT_METHODS[$id]['group']][] = self::XENDIT_METHODS[$id]['label'];
        }

        $labels = [];
        foreach ($groups as $group => $items) {
            $labels[] = $group === 'QRIS' ? 'QRIS' : "{$group} (".implode(', ', $items).')';
        }

        return ['gatewayActive' => $gatewayActive, 'methods' => $labels];
    }

    /**
     * Bank transfer is only "available" when the admin has switched it on at
     * both layers (global toggle + the manual gateway's own toggle) and filled
     * in real account details — otherwise a customer could be shown an upload
     * form for a transfer nobody is actually watching for.
     */
    private function resolveManualTransfer(): array
    {
        $manualGateway = PaymentGatewayConfig::where('gateway_name', 'manual')->first();
        $gatewayActive = (bool) $manualGateway?->is_active;

        $globalEnabled = AppSetting::get('payment_enabled_methods', []);
        $gatewayMethods = $manualGateway?->config_extra['enabled_methods'] ?? [];
        $values = $manualGateway?->config_extra['values'] ?? [];

        $available = $gatewayActive
            && in_array('transfer_bank', $globalEnabled, true)
            && in_array('transfer', $gatewayMethods, true)
            && filled($values['bank_name'] ?? null)
            && filled($values['account_no'] ?? null);

        return [
            'available' => $available,
            'bankDetails' => $available ? [
                'bank_name' => $values['bank_name'],
                'account_no' => $values['account_no'],
                'account_name' => $values['account_name'] ?? '',
            ] : null,
        ];
    }

    // ─── Show Payment Page ────────────────────────────────────────────────────

    public function show(Invitation $invitation): Response|RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $invitation->load(['package.features', 'events']);

        $package = $invitation->package;
        abort_if(! $package, 404, 'Paket tidak ditemukan untuk undangan ini.');

        // Free package → activate & redirect
        if ((float) $package->price === 0.0) {
            $this->activateInvitation($invitation);

            return redirect()->route('customer.invitations.index')
                ->with('success', 'Undangan Anda telah diaktifkan!');
        }

        $transaction = $invitation->transaction;
        $paymentUrl = null;
        $latestPayment = null;

        if ($transaction) {
            $latestPayment = $transaction->payments()->latest()->first();
            $paymentUrl = $latestPayment?->gateway_order_id;

            if ($transaction->status === 'paid') {
                return redirect()->route('customer.transactions.show', $transaction->id)
                    ->with('info', 'Undangan ini sudah dibayar.');
            }
        } else {
            // Pre-generate an invoice record so a code is visible as soon as the
            // payment page is opened, before the customer initiates any payment.
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'invitation_id' => $invitation->id,
                'package_id' => $package->id,
                'invoice_number' => $this->generateInvoiceNumber(auth()->id()),
                'invoice_amount' => $package->price,
                'invoice_currency' => $package->currency ?? 'IDR',
                'status' => 'pending',
            ]);
        }

        $packageFeatures = $package->features->map(fn ($f) => [
            'feature_key' => $f->feature_key,
            'feature_type' => $f->feature_type,
            'feature_value' => $f->feature_value,
        ])->values()->toArray();

        $paymentInfo = $this->resolveActivePaymentMethods();
        $manualTransfer = $this->resolveManualTransfer();

        $latestManualPayment = $transaction->payments()
            ->where('payment_gateway', 'manual')
            ->latest()
            ->first();

        return Inertia::render('customer/invitations/payment', [
            'invitation' => [
                'id' => $invitation->id,
                'slug' => $invitation->slug,
                'title' => $invitation->title,
            ],
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'label' => $package->label,
                'description' => $package->description,
                'price' => $package->price,
                'currency' => $package->currency ?? 'IDR',
                'billing_period' => $package->billing_period,
                'duration_days' => $package->duration_days,
                'features' => $packageFeatures,
            ],
            'transaction' => $transaction ? [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'status' => $transaction->status,
                'due_date' => $transaction->due_date?->toDateString(),
                'paid_at' => $transaction->paid_at?->toDateTimeString(),
                'payment_url' => $paymentUrl,
            ] : null,
            'paymentMethods' => $paymentInfo['methods'],
            'gatewayActive' => $paymentInfo['gatewayActive'],
            'manualTransfer' => [
                'available' => $manualTransfer['available'],
                'bankDetails' => $manualTransfer['bankDetails'],
                'existingProof' => $latestManualPayment && in_array($latestManualPayment->status, ['pending', 'processing'], true) ? [
                    'status' => $latestManualPayment->status,
                    'proof_url' => $latestManualPayment->proof_file_path
                        ? Storage::disk('public')->url($latestManualPayment->proof_file_path)
                        : null,
                    'proof_is_pdf' => $latestManualPayment->proof_file_path
                        ? str_ends_with(strtolower($latestManualPayment->proof_file_path), '.pdf')
                        : false,
                    'uploaded_at' => $latestManualPayment->proof_uploaded_at?->toDateTimeString(),
                ] : null,
            ],
        ]);
    }

    // ─── Initiate Payment (Create Invoice) ───────────────────────────────────

    public function pay(Request $request, Invitation $invitation): RedirectResponse|\Illuminate\Http\Response
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $invitation->load('package');
        $package = $invitation->package;

        abort_if(! $package, 404);

        // Free package — activate immediately
        if ((float) $package->price === 0.0) {
            $this->activateInvitation($invitation);

            return redirect()->route('customer.invitations.index')
                ->with('success', 'Undangan Anda telah diaktifkan!');
        }

        $transaction = $invitation->transaction;

        if ($transaction && $transaction->status === 'paid') {
            return redirect()->route('customer.transactions.show', $transaction->id)
                ->with('info', 'Undangan ini sudah dibayar.');
        }

        // Already has a live Xendit invoice URL — send user there
        if ($transaction && $transaction->status === 'pending') {
            $existing = $transaction->payments()
                ->where('status', 'pending')
                ->whereNotNull('gateway_order_id')
                ->latest()
                ->first();
            if ($existing) {
                return Inertia::location($existing->gateway_order_id);
            }
        }

        if (! $this->resolveActivePaymentMethods()['gatewayActive']) {
            return redirect()->route('customer.invitations.payment', $invitation->slug)
                ->with('error', 'Metode pembayaran sedang tidak tersedia. Silakan hubungi admin.');
        }

        // ── Step 1: Call Xendit API FIRST — no DB writes yet ─────────────
        try {
            // Reuse the invoice number already shown on the payment page if this
            // is the first payment attempt; generate a fresh one for retries.
            $invoiceNumber = ($transaction && ! $transaction->payments()->exists())
                ? $transaction->invoice_number
                : $this->generateInvoiceNumber(auth()->id());
            $amount = (float) $package->price;
            $user = auth()->user();
            $dueDate = Carbon::now()->addDays(1);

            $xenditData = $this->xendit->createInvoice([
                'external_id' => $invoiceNumber,
                'amount' => $amount,
                'payer_email' => $user->email,
                'description' => "Undangan Digital - {$package->label} | {$invitation->title}",
                'success_redirect_url' => route('customer.payments.success').'?invoice_number='.urlencode($invoiceNumber),
                'failure_redirect_url' => route('customer.payments.failed').'?invoice_number='.urlencode($invoiceNumber),
                'currency' => $package->currency ?? 'IDR',
            ]);
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('customer.invitations.payment', $invitation->slug)
                ->with('error', $this->paymentErrorMessage($e));
        }

        // ── Step 2: Persist to DB only after Xendit succeeds ─────────────
        DB::transaction(function () use (
            $invitation, $package, $transaction,
            $invoiceNumber, $amount, $dueDate, $xenditData
        ) {
            if ($transaction) {
                // Cancel any stale pending payments before reassigning invoice number
                $transaction->payments()->where('status', 'pending')->update(['status' => 'cancelled']);

                $transaction->update([
                    'invoice_number' => $invoiceNumber,
                    'invoice_amount' => $amount,
                    'invoice_currency' => $package->currency ?? 'IDR',
                    'status' => 'pending',
                    'due_date' => $dueDate,
                    'paid_at' => null,
                ]);
            } else {
                $transaction = Transaction::create([
                    'user_id' => auth()->id(),
                    'invitation_id' => $invitation->id,
                    'package_id' => $package->id,
                    'invoice_number' => $invoiceNumber,
                    'invoice_amount' => $amount,
                    'invoice_currency' => $package->currency ?? 'IDR',
                    'status' => 'pending',
                    'due_date' => $dueDate,
                ]);
            }

            Payment::create([
                'transaction_id' => $transaction->id,
                'payment_gateway' => 'xendit',
                'gateway_reference_id' => $xenditData['id'],
                'gateway_order_id' => $xenditData['invoice_url'],
                'amount' => $amount,
                'currency' => $package->currency ?? 'IDR',
                'status' => 'pending',
            ]);
        });

        return Inertia::location($xenditData['invoice_url']);
    }

    // ─── Submit Manual Transfer Proof ────────────────────────────────────────

    public function submitManualProof(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $invitation->load('package');
        $package = $invitation->package;

        abort_if(! $package, 404);

        if (! $this->resolveManualTransfer()['available']) {
            return redirect()->route('customer.invitations.payment', $invitation->slug)
                ->with('error', 'Transfer manual sedang tidak tersedia.');
        }

        $transaction = $invitation->transaction;

        if (! $transaction) {
            return redirect()->route('customer.invitations.payment', $invitation->slug)
                ->with('error', 'Transaksi tidak ditemukan. Silakan muat ulang halaman.');
        }

        if ($transaction->status === 'paid') {
            return redirect()->route('customer.transactions.show', $transaction->id)
                ->with('info', 'Undangan ini sudah dibayar.');
        }

        $request->validate([
            'proof_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ], [
            'proof_file.required' => 'Bukti transfer wajib diunggah.',
            'proof_file.mimes' => 'Format file harus JPG, PNG, atau PDF.',
            'proof_file.max' => 'Ukuran file maksimal 5 MB.',
        ]);

        $path = UploadService::uploadDocument(
            $request->file('proof_file'),
            "invitations/{$invitation->id}/payment-proof",
        );

        $existingManualPayment = $transaction->payments()
            ->where('payment_gateway', 'manual')
            ->whereIn('status', ['pending', 'processing'])
            ->latest()
            ->first();

        if ($existingManualPayment) {
            $existingManualPayment->update([
                'proof_file_path' => $path,
                'proof_uploaded_at' => now(),
                'status' => 'pending',
            ]);
        } else {
            $transaction->payments()->create([
                'payment_gateway' => 'manual',
                'gateway_reference_id' => "manual-{$transaction->id}-".now()->timestamp,
                'amount' => $transaction->invoice_amount,
                'currency' => $transaction->invoice_currency ?? 'IDR',
                'status' => 'pending',
                'proof_file_path' => $path,
                'proof_uploaded_at' => now(),
            ]);
        }

        return redirect()->route('customer.invitations.payment', $invitation->slug)
            ->with('success', 'Bukti pembayaran berhasil diunggah. Tim kami akan memverifikasi dalam 1x24 jam.');
    }

    // ─── Success & Failed Redirect Pages ─────────────────────────────────────

    public function success(Request $request): Response
    {
        $transaction = null;
        $invoiceNumber = $request->query('invoice_number') ?? $request->query('external_id');

        if ($invoiceNumber) {
            $transaction = Transaction::with(['invitation', 'package'])
                ->where('user_id', auth()->id())
                ->where('invoice_number', $invoiceNumber)
                ->first();
        }

        return Inertia::render('customer/payments/success', [
            'transaction' => $transaction ? [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'invoice_currency' => $transaction->invoice_currency,
                'status' => $transaction->status,
                'invitation' => $transaction->invitation
                    ? ['slug' => $transaction->invitation->slug, 'title' => $transaction->invitation->title]
                    : null,
                'package' => $transaction->package
                    ? ['label' => $transaction->package->label]
                    : null,
            ] : null,
        ]);
    }

    public function failed(Request $request): Response
    {
        $transaction = null;
        $invoiceNumber = $request->query('invoice_number') ?? $request->query('external_id');

        if ($invoiceNumber) {
            $transaction = Transaction::with(['invitation', 'package'])
                ->where('user_id', auth()->id())
                ->where('invoice_number', $invoiceNumber)
                ->first();
        }

        return Inertia::render('customer/payments/failed', [
            'transaction' => $transaction ? [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'invoice_currency' => $transaction->invoice_currency,
                'status' => $transaction->status,
                'invitation' => $transaction->invitation
                    ? ['slug' => $transaction->invitation->slug, 'title' => $transaction->invitation->title]
                    : null,
            ] : null,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Error text shown on the payment page. With APP_DEBUG=true the real
     * exception (class, message, file:line) is shown so failures can be
     * diagnosed from the UI; otherwise only messages we wrote ourselves
     * (XenditService throws plain RuntimeException) reach the customer, and
     * anything else (cURL, SQL, ...) is replaced by a generic message.
     */
    private function paymentErrorMessage(Throwable $e): string
    {
        $message = $e->getMessage();

        if (config('app.debug')) {
            $file = str_replace('\\', '/', Str::after($e->getFile(), base_path().DIRECTORY_SEPARATOR));

            return sprintf('[%s] %s (%s:%d)', class_basename($e), $message, $file, $e->getLine());
        }

        // Detect permission error and give actionable guidance
        if (str_contains($message, 'forbidden') || str_contains($message, 'permission')) {
            return 'API Key Xendit tidak memiliki izin untuk membuat Invoice. '
                .'Silakan masuk ke Dashboard Xendit → Settings → API Keys, '
                .'lalu aktifkan permission "Money-In" / "Invoice" pada API key Anda, kemudian coba lagi.';
        }

        // Exact class match: QueryException etc. also extend RuntimeException.
        return $e::class === RuntimeException::class
            ? $message
            : 'Pembayaran gagal diproses. Silakan coba lagi atau hubungi admin.';
    }

    private function generateInvoiceNumber(int $userId): string
    {
        return 'INV-'.now()->format('Ymd').'-'.$userId.'-'.strtoupper(Str::random(6));
    }

    private function activateInvitation(Invitation $invitation): void
    {
        if ($invitation->status !== 'active') {
            $invitation->update([
                'status' => 'active',
                'activated_at' => now(),
                'expires_at' => now()->addDays(365),
            ]);
        }
    }
}
