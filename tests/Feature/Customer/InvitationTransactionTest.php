<?php

use App\Models\AppSetting;
use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\PaymentGatewayConfig;
use App\Models\Theme;
use App\Models\Transaction;
use App\Models\User;
use App\Services\XenditService;

it('creates a pending transaction when a paid invitation is stored', function () {
    $user = User::factory()->create();

    $eventType = EventType::create([
        'name' => 'birthday',
        'label' => 'ulang_tahun',
        'description' => 'Birthday invitation',
        'icon_path' => 'icons/birthday.svg',
        'is_active' => true,
    ]);

    $theme = Theme::create([
        'name' => 'Starry Birthday',
        'slug' => 'starry-birthday',
        'description' => 'Birthday theme',
        'category' => 'Birthday',
        'event_type' => 'birthday',
        'is_active' => true,
        'is_premium' => false,
        'is_exclusive' => false,
        'price' => 0,
        'usage_count' => 0,
    ]);

    $package = Package::create([
        'name' => 'ulang_tahun_basic_test',
        'invitation_type' => 'ulang_tahun',
        'label' => 'Ulang Tahun Basic',
        'description' => 'Birthday package',
        'price' => 199000,
        'currency' => 'IDR',
        'billing_period' => 'once',
        'duration_days' => 90,
        'trial_days' => 7,
        'max_gallery_uploads' => 10,
        'is_active' => true,
        'display_order' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('customer.invitations.store'), [
            'event_type_id' => $eventType->id,
            'theme_id' => $theme->id,
            'package_id' => $package->id,
            'slug' => 'ulang-tahun-putri',
            'field_values' => [
                'child_name' => 'Putri',
            ],
            'acara_events' => [],
            'gallery_items' => [],
            'love_story' => [],
        ])
        ->assertRedirect(route('customer.invitations.index'));

    expect(Invitation::count())->toBe(1);
    expect(Transaction::count())->toBe(1);

    $transaction = Transaction::firstOrFail();

    expect($transaction->user_id)->toBe($user->id);
    expect($transaction->invitation_id)->toBe(Invitation::firstOrFail()->id);
    expect($transaction->package_id)->toBe($package->id);
    expect($transaction->status)->toBe('pending');
    expect($transaction->invoice_number)->toMatch('/^INV-\d{8}-' . $user->id . '-[A-Z0-9]{6}$/');

    $fakeXendit = new class extends XenditService
    {
        public array $lastParams = [];

        public function __construct() {}

        public function createInvoice(array $params): array
        {
            $this->lastParams = $params;

            return [
                'id' => 'xnd_test_invoice',
                'invoice_url' => 'https://xendit.test/invoice',
            ];
        }
    };

    app()->instance(XenditService::class, $fakeXendit);

    // Checkout only proceeds when the admin has Xendit switched on
    // (admin/settings/payment) — otherwise it's blocked deliberately.
    PaymentGatewayConfig::create([
        'gateway_name' => 'xendit',
        'gateway_type' => 'payment',
        'is_active' => true,
        'is_test_mode' => true,
        'config_extra' => ['values' => [], 'enabled_methods' => ['va', 'qris', 'ewallet']],
    ]);
    AppSetting::set('payment_enabled_methods', ['va_bca', 'qris'], 'json', 'payment');

    $this->actingAs($user)
        ->post(route('customer.invitations.pay', Invitation::firstOrFail()));

    expect(Transaction::count())->toBe(1);
    expect(Transaction::firstOrFail()->invoice_number)->toBe($transaction->invoice_number);
    expect($fakeXendit->lastParams['external_id'] ?? null)->toBe($transaction->invoice_number);
    expect(Transaction::firstOrFail()->payments()->count())->toBe(1);
});
