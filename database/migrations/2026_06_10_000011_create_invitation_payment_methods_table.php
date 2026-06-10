<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('payment_gateway', 100); // midtrans, xendit, manual
            $table->json('config_override')->nullable();
            $table->boolean('is_using_platform_config')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['invitation_id', 'payment_gateway'], 'uq_invitation_gateway');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_payment_methods');
    }
};
