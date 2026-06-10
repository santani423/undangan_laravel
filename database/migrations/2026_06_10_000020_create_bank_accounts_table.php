<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('bank_name', 100);
            $table->string('bank_account_name', 255);
            $table->text('bank_account_number'); // Stored encrypted via model cast
            $table->string('bank_code', 10)->nullable(); // BCA, BRI, MANDIRI
            $table->string('account_type', 50)->default('checking'); // checking, savings
            $table->enum('verification_status', ['unverified', 'verifying', 'verified'])->default('unverified');
            $table->string('verification_code', 10)->nullable();
            $table->integer('verification_attempts')->default(0);
            $table->timestamp('verified_at')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_primary'], 'idx_bank_accounts_user_primary');
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
