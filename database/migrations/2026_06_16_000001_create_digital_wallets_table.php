<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider');          // dana, ovo, gopay, shopeepay, etc.
            $table->string('provider_label');    // Display name: DANA, OVO, GoPay, dll.
            $table->string('account_number');    // Nomor HP / akun dompet
            $table->string('account_name');      // Nama pemilik akun
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('invitation_digital_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('digital_wallet_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_displayed')->default(true);
            $table->unsignedTinyInteger('display_order')->default(0);
            $table->timestamps();

            $table->unique(['invitation_id', 'digital_wallet_id'], 'inv_wallet_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_digital_wallets');
        Schema::dropIfExists('digital_wallets');
    }
};
