<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_envelope_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations');
            $table->foreignId('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('guest_name', 255)->nullable();
            $table->string('guest_email', 255)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('IDR');
            $table->foreignId('bank_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
            $table->foreignId('qris_account_id')->nullable()->constrained('qris_accounts')->nullOnDelete();
            $table->string('payment_method', 50)->nullable(); // bank_transfer, qris, manual
            $table->string('gateway_reference_id', 255)->nullable();
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->text('message')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['invitation_id', 'status'], 'idx_envelope_invitation_status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_envelope_transactions');
    }
};
