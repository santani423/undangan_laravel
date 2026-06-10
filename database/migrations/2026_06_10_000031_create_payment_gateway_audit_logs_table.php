<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateway_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_name', 100);
            $table->string('action', 50); // create, update, test, delete
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable(); // EXCLUDING secret values
            $table->unsignedBigInteger('changed_by_user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['gateway_name', 'created_at'], 'idx_gateway_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_audit_logs');
    }
};
