<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\PaymentGatewayAuditLog;
use App\Models\PaymentGatewayConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingController extends Controller
{
    /**
     * Per-gateway field & payment-method catalogue. Field labels/placeholders/icons
     * live in the frontend; this only needs the keys for validation + storage mapping.
     */
    private const GATEWAY_SPECS = [
        'midtrans' => [
            'fields' => ['merchant_id', 'client_key', 'server_key', 'webhook_url'],
            'secret_fields' => ['server_key'],
            'methods' => ['va', 'qris', 'ewallet', 'cc'],
        ],
        'xendit' => [
            'fields' => ['api_key', 'public_key', 'webhook_token', 'callback_url'],
            'secret_fields' => ['api_key', 'webhook_token'],
            'methods' => ['va', 'qris', 'ewallet', 'transfer'],
        ],
        'tripay' => [
            'fields' => ['api_key', 'private_key', 'merchant_code', 'callback_url'],
            'secret_fields' => ['private_key'],
            'methods' => ['va', 'qris', 'alfamart'],
        ],
        'manual' => [
            'fields' => ['bank_name', 'account_no', 'account_name', 'conf_email'],
            'secret_fields' => [],
            'methods' => ['transfer'],
        ],
    ];

    private const METHOD_CATALOGUE = [
        'va_bca', 'va_bni', 'va_bri', 'va_mandiri', 'qris', 'gopay', 'ovo',
        'dana', 'shopeepay', 'cc', 'alfamart', 'indomaret', 'transfer_bank',
    ];

    private const DEFAULT_ENABLED_METHODS = [
        'va_bca', 'va_bni', 'va_bri', 'va_mandiri', 'qris', 'gopay', 'transfer_bank',
    ];

    private const DEFAULTS = [
        'midtrans' => ['is_active' => false, 'is_test_mode' => true,  'enabled_methods' => ['va', 'qris', 'ewallet']],
        'xendit' => ['is_active' => false, 'is_test_mode' => true,  'enabled_methods' => []],
        'tripay' => ['is_active' => false, 'is_test_mode' => true,  'enabled_methods' => []],
        'manual' => ['is_active' => true,  'is_test_mode' => false, 'enabled_methods' => ['transfer']],
    ];

    public function index(Request $request): Response
    {
        $rows = PaymentGatewayConfig::whereIn('gateway_name', array_keys(self::GATEWAY_SPECS))
            ->get()
            ->keyBy('gateway_name');

        $gateways = [];
        foreach (self::GATEWAY_SPECS as $id => $spec) {
            $row = $rows->get($id);

            if (! $row) {
                $defaults = self::DEFAULTS[$id];
                $row = PaymentGatewayConfig::create([
                    'gateway_name' => $id,
                    'gateway_type' => 'payment',
                    'is_active' => $defaults['is_active'],
                    'is_test_mode' => $defaults['is_test_mode'],
                    'config_extra' => ['values' => [], 'enabled_methods' => $defaults['enabled_methods']],
                ]);
            }

            $extra = $row->configExtraSafe();
            $values = $extra['values'] ?? [];
            $enabledMethods = $extra['enabled_methods'] ?? [];

            $fieldValues = [];
            $secretsSet = [];
            foreach ($spec['fields'] as $key) {
                $isSecret = in_array($key, $spec['secret_fields'], true);
                $fieldValues[$key] = $isSecret ? '' : ($values[$key] ?? '');
                if ($isSecret) {
                    $secretsSet[$key] = ! empty($values[$key]);
                }
            }

            $gateways[] = [
                'id' => $id,
                'enabled' => (bool) $row->is_active,
                'environment' => $row->is_test_mode ? 'sandbox' : 'production',
                'fieldValues' => $fieldValues,
                'secretsSet' => $secretsSet,
                'enabledMethods' => array_values(array_intersect($enabledMethods, $spec['methods'])),
                'lastVerifiedAt' => $row->last_verified_at?->translatedFormat('d M Y, H:i'),
                'configuredAt' => $row->configured_at?->translatedFormat('d M Y, H:i'),
            ];
        }

        return Inertia::render('admin/settings/payment', [
            'gateways' => $gateways,
            'enabledMethods' => AppSetting::get('payment_enabled_methods', self::DEFAULT_ENABLED_METHODS),
            'webhook' => [
                'successRedirectUrl' => AppSetting::get('payment_redirect_success_url', ''),
                'failedRedirectUrl' => AppSetting::get('payment_redirect_failed_url', ''),
                'pendingRedirectUrl' => AppSetting::get('payment_redirect_pending_url', ''),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function updateGateway(Request $request, string $gateway): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(['super_admin', 'admin']), 403);

        if (! isset(self::GATEWAY_SPECS[$gateway])) {
            abort(404);
        }

        $spec = self::GATEWAY_SPECS[$gateway];

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
            'environment' => ['required', Rule::in(['sandbox', 'production'])],
            'fields' => ['array'],
            'fields.*' => ['nullable', 'string', 'max:500'],
            'enabled_methods' => ['array'],
            'enabled_methods.*' => [Rule::in($spec['methods'])],
        ]);

        $row = PaymentGatewayConfig::firstOrNew(['gateway_name' => $gateway]);
        $row->gateway_type ??= 'payment';

        $existingValues = $row->configExtraSafe()['values'] ?? [];
        $newValues = [];
        foreach ($spec['fields'] as $key) {
            $isSecret = in_array($key, $spec['secret_fields'], true);
            $submitted = $validated['fields'][$key] ?? '';

            if ($isSecret && $submitted === '') {
                // Blank secret field means "keep existing value", not "clear it".
                $newValues[$key] = $existingValues[$key] ?? '';
            } else {
                $newValues[$key] = $submitted;
            }
        }

        $oldValues = [
            'is_active' => (bool) $row->is_active,
            'is_test_mode' => (bool) $row->is_test_mode,
            'enabled_methods' => $row->configExtraSafe()['enabled_methods'] ?? [],
        ];

        $row->is_active = $validated['is_active'];
        $row->is_test_mode = $validated['environment'] === 'sandbox';
        $row->config_extra = [
            'values' => $newValues,
            'enabled_methods' => array_values(array_intersect($validated['enabled_methods'] ?? [], $spec['methods'])),
        ];
        $row->configured_at = now();
        $row->configured_by_user_id = $request->user()->id;
        $row->save();

        PaymentGatewayAuditLog::create([
            'gateway_name' => $gateway,
            'action' => 'update',
            'old_values' => $oldValues,
            'new_values' => [
                'is_active' => $row->is_active,
                'is_test_mode' => $row->is_test_mode,
                'enabled_methods' => $row->config_extra['enabled_methods'],
            ],
            'changed_by_user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Konfigurasi gateway berhasil disimpan.');
    }

    public function updateMethods(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(['super_admin', 'admin']), 403);

        $validated = $request->validate([
            'enabled_methods' => ['array'],
            'enabled_methods.*' => [Rule::in(self::METHOD_CATALOGUE)],
        ]);

        AppSetting::set('payment_enabled_methods', array_values($validated['enabled_methods'] ?? []), 'json', 'payment');

        return back()->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    public function updateWebhook(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(['super_admin', 'admin']), 403);

        $validated = $request->validate([
            'success_redirect_url' => ['nullable', 'string', 'max:255', 'url'],
            'failed_redirect_url' => ['nullable', 'string', 'max:255', 'url'],
            'pending_redirect_url' => ['nullable', 'string', 'max:255', 'url'],
        ]);

        AppSetting::set('payment_redirect_success_url', $validated['success_redirect_url'] ?? '', 'string', 'payment');
        AppSetting::set('payment_redirect_failed_url', $validated['failed_redirect_url'] ?? '', 'string', 'payment');
        AppSetting::set('payment_redirect_pending_url', $validated['pending_redirect_url'] ?? '', 'string', 'payment');

        return back()->with('success', 'Konfigurasi webhook berhasil disimpan.');
    }
}
