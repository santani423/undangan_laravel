<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->restrictOnDelete();
            $table->string('payment_gateway', 50); // midtrans, xendit, manual
            $table->string('gateway_reference_id', 255)->unique();
            $table->string('gateway_order_id', 255)->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->string('currency', 3)->default('IDR');
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'cancelled'])->default('pending');
            $table->string('error_code', 100)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('webhook_received_at')->nullable();
            $table->timestamp('webhook_verified_at')->nullable();
            $table->json('webhook_payload')->nullable();
            $table->timestamps();

            $table->index(['transaction_id', 'status'], 'idx_transaction_status');
            $table->index('gateway_reference_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
