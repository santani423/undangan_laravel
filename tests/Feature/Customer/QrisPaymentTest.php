<?php

use App\Models\AppSetting;
use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PaymentGatewayConfig;
use App\Models\Transaction;
use App\Models\User;
use App\Services\QrisPaymentService;
use App\Support\QrisPayload;
use Spatie\Permission\Models\Role;

// Static QRIS sample (structure per EMVCo), CRC computed below so the fixture stays valid.
function staticQris(): string
{
    $body = '00020101021126570011ID.DANA.WWW011893600915000000000102090000000010303UMI'
        .'51440014ID.CO.QRIS.WWW0215ID10200000000010303UMI'
        .'5204599953033605802ID5910UNDESIA QA6007JAKARTA61051234062070703A01'
        .'6304';

    return $body.QrisPayload::crc16($body);
}

function qrisSetup(int $min = 500, int $max = 2500, int $price = 100000): array
{
    $user = User::factory()->create();

    $package = Package::create([
        'name' => 'qris_test_'.uniqid(),
        'invitation_type' => 'ulang_tahun',
        'label' => 'Basic',
        'description' => 'Test',
        'price' => $price,
        'currency' => 'IDR',
        'billing_period' => 'once',
        'duration_days' => 90,
        'trial_days' => 0,
        'max_gallery_uploads' => 10,
        'is_active' => true,
        'display_order' => 1,
    ]);

    PaymentGatewayConfig::updateOrCreate(['gateway_name' => 'qris'], [
        'gateway_type' => 'payment',
        'is_active' => true,
        'is_test_mode' => false,
        'config_extra' => [
            'values' => ['base_payload' => staticQris(), 'merchant_name' => 'UNDESIA QA'],
            'enabled_methods' => ['qris'],
            'discount_min' => $min,
            'discount_max' => $max,
        ],
    ]);
    AppSetting::set('payment_enabled_methods', ['qris'], 'json', 'payment');

    $eventType = EventType::firstOrCreate(['name' => 'birthday'], [
        'label' => 'ulang_tahun',
        'description' => 'Birthday invitation',
        'icon_path' => 'icons/birthday.svg',
        'is_active' => true,
    ]);

    $invitation = Invitation::forceCreate([
        'user_id' => $user->id,
        'event_type_id' => $eventType->id,
        'package_id' => $package->id,
        'slug' => 'qris-'.uniqid(),
        'title' => 'QRIS Test',
        'status' => 'draft',
    ]);

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'invitation_id' => $invitation->id,
        'package_id' => $package->id,
        'invoice_number' => 'INV-QRIS-'.uniqid(),
        'invoice_amount' => $price,
        'invoice_currency' => 'IDR',
        'status' => 'pending',
    ]);

    return compact('user', 'package', 'invitation', 'transaction');
}

it('calculates subtotal, 11% PPN after discount, and total', function () {
    expect(QrisPaymentService::calculate(100000, 1738))->toBe([
        'original' => 100000,
        'discount' => 1738,
        'subtotal' => 98262,
        'tax' => 10809,
        'total' => 109071,
    ]);
});

it('builds a dynamic QRIS with the amount and a valid CRC', function () {
    $dynamic = QrisPayload::withAmount(staticQris(), 109071);
    $entries = QrisPayload::validate($dynamic);

    expect($entries['01'])->toBe('12');
    expect($entries['54'])->toBe('109071');
    expect($entries['59'])->toBe('UNDESIA QA');
});

it('rejects a corrupted QRIS payload', function () {
    QrisPayload::validate(substr(staticQris(), 0, -1).'0');
})->throws(InvalidArgumentException::class);

it('creates a QRIS payment with a discount in range and stores the breakdown', function () {
    ['user' => $user, 'invitation' => $invitation, 'transaction' => $transaction] = qrisSetup();

    $this->actingAs($user)
        ->post(route('customer.invitations.pay', $invitation), ['gateway' => 'qris'])
        ->assertRedirect(route('customer.invitations.payment', $invitation->slug));

    $payment = Payment::where('payment_gateway', 'qris')->sole();
    $discount = (int) $payment->discount_amount;
    $expected = QrisPaymentService::calculate(100000, $discount);

    expect($discount)->toBeGreaterThanOrEqual(500)->toBeLessThanOrEqual(2500);
    expect((int) $payment->subtotal_amount)->toBe($expected['subtotal']);
    expect((int) $payment->tax_amount)->toBe($expected['tax']);
    expect((int) $payment->amount)->toBe($expected['total']);
    expect(QrisPayload::parse($payment->qris_payload)['54'])->toBe((string) $expected['total']);
    expect((int) $transaction->fresh()->invoice_amount)->toBe($expected['total']);

    // Re-submitting reuses the live QRIS instead of regenerating the discount.
    $this->actingAs($user)->post(route('customer.invitations.pay', $invitation), ['gateway' => 'qris']);
    expect(Payment::where('payment_gateway', 'qris')->count())->toBe(1);
});

it('gives every live QRIS payment a different discount and fails cleanly when the range is exhausted', function () {
    $service = app(QrisPaymentService::class);
    $discounts = [];

    for ($i = 0; $i < 3; $i++) {
        ['transaction' => $transaction] = qrisSetup(min: 1000, max: 1002);
        $discounts[] = (int) $service->createPayment($transaction, 100000)->discount_amount;
    }

    sort($discounts);
    expect($discounts)->toBe([1000, 1001, 1002]);

    ['transaction' => $fourth] = qrisSetup(min: 1000, max: 1002);
    $paymentsBefore = Payment::count();

    expect(fn () => $service->createPayment($fourth, 100000))
        ->toThrow(RuntimeException::class, 'Semua nominal diskon QRIS');
    expect(Payment::count())->toBe($paymentsBefore);
    expect((int) $fourth->fresh()->invoice_amount)->toBe(100000);
});

it('caps the discount below the price so the subtotal never goes negative', function () {
    $service = app(QrisPaymentService::class);

    expect($service->generateDiscount(1000, 500, 5000))->toBeLessThan(1000);
    expect(fn () => $service->generateDiscount(400, 500, 5000))->toThrow(RuntimeException::class);
});

it('keeps old payments unchanged when the admin changes the range', function () {
    ['transaction' => $transaction] = qrisSetup();
    $payment = app(QrisPaymentService::class)->createPayment($transaction, 100000);
    $discount = (string) $payment->discount_amount;

    qrisSetup(min: 5000, max: 9000);

    expect((string) $payment->fresh()->discount_amount)->toBe($discount);
});

it('validates the discount range in admin settings', function () {
    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    qrisSetup(price: 10000);

    $this->actingAs($admin)
        ->patch(route('admin.settings.payment.qris.update'), [
            'is_active' => true, 'base_payload' => staticQris(), 'discount_min' => 2000, 'discount_max' => 1000,
        ])
        ->assertSessionHasErrors('discount_max');

    $this->actingAs($admin)
        ->patch(route('admin.settings.payment.qris.update'), [
            'is_active' => true, 'base_payload' => staticQris(), 'discount_min' => 500, 'discount_max' => 20000,
        ])
        ->assertSessionHasErrors('discount_max');

    $this->actingAs($admin)
        ->patch(route('admin.settings.payment.qris.update'), [
            'is_active' => true, 'base_payload' => 'not-a-qris', 'discount_min' => 500, 'discount_max' => 2500,
        ])
        ->assertSessionHasErrors('base_payload');

    $this->actingAs($admin)
        ->patch(route('admin.settings.payment.qris.update'), [
            'is_active' => true, 'base_payload' => staticQris(), 'discount_min' => 500, 'discount_max' => 2500,
        ])
        ->assertSessionHasNoErrors();

    $config = app(QrisPaymentService::class)->config();
    expect($config['discount_min'])->toBe(500);
    expect($config['discount_max'])->toBe(2500);
    expect($config['merchant_name'])->toBe('UNDESIA QA');
});

it('generates a test QRIS for the admin without saving anything', function () {
    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)
        ->postJson(route('admin.settings.payment.qris.test'), [
            'base_payload' => staticQris(), 'price' => 100000, 'discount_min' => 500, 'discount_max' => 2500,
        ])
        ->assertOk()
        ->assertJsonPath('merchant_name', 'UNDESIA QA');

    $discount = $response->json('discount');
    $expected = QrisPaymentService::calculate(100000, $discount);

    expect($discount)->toBeGreaterThanOrEqual(500)->toBeLessThanOrEqual(2500);
    expect($response->json('total'))->toBe($expected['total']);
    expect(QrisPayload::validate($response->json('payload'))['54'])->toBe((string) $expected['total']);
    expect(Payment::count())->toBe(0);

    $this->actingAs($admin)
        ->postJson(route('admin.settings.payment.qris.test'), [
            'base_payload' => staticQris(), 'price' => 400, 'discount_min' => 500, 'discount_max' => 2500,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('price');
});
