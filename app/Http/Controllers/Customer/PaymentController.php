<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\XenditService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(private readonly XenditService $xendit) {}

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

        $transaction  = $invitation->transaction;
        $paymentUrl   = null;
        $latestPayment = null;

        if ($transaction) {
            $latestPayment = $transaction->payments()->latest()->first();
            $paymentUrl    = $latestPayment?->gateway_order_id;

            if ($transaction->status === 'paid') {
                return redirect()->route('customer.transactions.show', $transaction->id)
                    ->with('info', 'Undangan ini sudah dibayar.');
            }
        }

        $packageFeatures = $package->features->map(fn ($f) => [
            'feature_key'   => $f->feature_key,
            'feature_type'  => $f->feature_type,
            'feature_value' => $f->feature_value,
        ])->values()->toArray();

        return Inertia::render('customer/invitations/payment', [
            'invitation' => [
                'id'    => $invitation->id,
                'slug'  => $invitation->slug,
                'title' => $invitation->title,
            ],
            'package' => [
                'id'             => $package->id,
                'name'           => $package->name,
                'label'          => $package->label,
                'description'    => $package->description,
                'price'          => $package->price,
                'currency'       => $package->currency ?? 'IDR',
                'billing_period' => $package->billing_period,
                'duration_days'  => $package->duration_days,
                'features'       => $packageFeatures,
            ],
            'transaction' => $transaction ? [
                'id'             => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'status'         => $transaction->status,
                'due_date'       => $transaction->due_date?->toDateString(),
                'paid_at'        => $transaction->paid_at?->toDateTimeString(),
                'payment_url'    => $paymentUrl,
            ] : null,
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

        // ── Step 1: Call Xendit API FIRST — no DB writes yet ─────────────
        try {
            $invoiceNumber = $this->generateInvoiceNumber(auth()->id());
            $amount        = (float) $package->price;
            $user          = auth()->user();
            $dueDate       = Carbon::now()->addDays(1);

            $xenditData = $this->xendit->createInvoice([
                'external_id'          => $invoiceNumber,
                'amount'               => $amount,
                'payer_email'          => $user->email,
                'description'          => "Undangan Digital - {$package->label} | {$invitation->title}",
                'success_redirect_url' => route('customer.payments.success') . '?invoice_number=' . urlencode($invoiceNumber),
                'failure_redirect_url' => route('customer.payments.failed')  . '?invoice_number=' . urlencode($invoiceNumber),
                'currency'             => $package->currency ?? 'IDR',
            ]);
        } catch (Throwable $e) {
            $message = $e->getMessage();

            // Detect permission error and give actionable guidance
            if (str_contains($message, 'forbidden') || str_contains($message, 'permission')) {
                $message = 'API Key Xendit tidak memiliki izin untuk membuat Invoice. '
                    . 'Silakan masuk ke Dashboard Xendit → Settings → API Keys, '
                    . 'lalu aktifkan permission "Money-In" / "Invoice" pada API key Anda, kemudian coba lagi.';
            }

            return redirect()->route('customer.invitations.payment', $invitation->slug)
                ->with('error', $message);
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
                    'invoice_number'   => $invoiceNumber,
                    'invoice_amount'   => $amount,
                    'invoice_currency' => $package->currency ?? 'IDR',
                    'status'           => 'pending',
                    'due_date'         => $dueDate,
                    'paid_at'          => null,
                ]);
            } else {
                $transaction = Transaction::create([
                    'user_id'          => auth()->id(),
                    'invitation_id'    => $invitation->id,
                    'package_id'       => $package->id,
                    'invoice_number'   => $invoiceNumber,
                    'invoice_amount'   => $amount,
                    'invoice_currency' => $package->currency ?? 'IDR',
                    'status'           => 'pending',
                    'due_date'         => $dueDate,
                ]);
            }

            Payment::create([
                'transaction_id'       => $transaction->id,
                'payment_gateway'      => 'xendit',
                'gateway_reference_id' => $xenditData['id'],
                'gateway_order_id'     => $xenditData['invoice_url'],
                'amount'               => $amount,
                'currency'             => $package->currency ?? 'IDR',
                'status'               => 'pending',
            ]);
        });

        return Inertia::location($xenditData['invoice_url']);
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
                'id'             => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'invoice_currency'=> $transaction->invoice_currency,
                'status'         => $transaction->status,
                'invitation'     => $transaction->invitation
                    ? ['slug' => $transaction->invitation->slug, 'title' => $transaction->invitation->title]
                    : null,
                'package'        => $transaction->package
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
                'id'             => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'invoice_amount' => $transaction->invoice_amount,
                'invoice_currency'=> $transaction->invoice_currency,
                'status'         => $transaction->status,
                'invitation'     => $transaction->invitation
                    ? ['slug' => $transaction->invitation->slug, 'title' => $transaction->invitation->title]
                    : null,
            ] : null,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function generateInvoiceNumber(int $userId): string
    {
        return 'INV-' . now()->format('Ymd') . '-' . $userId . '-' . strtoupper(Str::random(6));
    }

    private function activateInvitation(Invitation $invitation): void
    {
        if ($invitation->status !== 'active') {
            $invitation->update([
                'status'       => 'active',
                'activated_at' => now(),
                'expires_at'   => now()->addDays(365),
            ]);
        }
    }
}
