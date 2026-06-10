<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qris_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('qris_code'); // Static QRIS data
            $table->string('qris_reference_id', 100)->unique()->nullable();
            $table->string('merchant_id', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_primary'], 'idx_qris_accounts_user_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qris_accounts');
    }
};
