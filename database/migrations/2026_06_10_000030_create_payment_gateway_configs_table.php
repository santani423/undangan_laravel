<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateway_configs', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_name', 100)->unique();
            $table->string('gateway_type', 50)->nullable(); // payment, verification
            $table->text('config_key')->nullable(); // Stored encrypted
            $table->text('config_secret')->nullable(); // Stored encrypted
            $table->json('config_extra')->nullable(); // Stored encrypted
            $table->boolean('is_active')->default(false);
            $table->boolean('is_test_mode')->default(true);
            $table->timestamp('configured_at')->nullable();
            $table->unsignedBigInteger('configured_by_user_id')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();

            $table->index(['gateway_name', 'is_active'], 'idx_gateway_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_configs');
    }
};
