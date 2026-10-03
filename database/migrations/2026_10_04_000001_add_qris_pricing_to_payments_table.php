<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-payment price breakdown for static-QRIS payments. Every column is
 * nullable and additive, so existing Xendit / Midtrans / manual rows are
 * untouched. The actual discount is stored here (not just the admin's
 * min/max range) so later range changes never recalculate old payments.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('original_amount', 12, 2)->nullable()->after('amount');
            $table->decimal('discount_amount', 12, 2)->nullable()->after('original_amount');
            $table->decimal('subtotal_amount', 12, 2)->nullable()->after('discount_amount');
            $table->decimal('tax_rate', 5, 2)->nullable()->after('subtotal_amount');
            $table->decimal('tax_amount', 12, 2)->nullable()->after('tax_rate');
            $table->text('qris_payload')->nullable()->after('tax_amount');
            $table->timestamp('qris_expires_at')->nullable()->after('qris_payload');

            $table->index(['payment_gateway', 'status', 'qris_expires_at'], 'idx_payments_qris_active');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_qris_active');
            $table->dropColumn([
                'original_amount',
                'discount_amount',
                'subtotal_amount',
                'tax_rate',
                'tax_amount',
                'qris_payload',
                'qris_expires_at',
            ]);
        });
    }
};
