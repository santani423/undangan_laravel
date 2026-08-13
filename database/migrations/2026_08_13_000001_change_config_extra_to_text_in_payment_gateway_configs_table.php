<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `config_extra` is cast as `encrypted:array` on the model, which stores an
     * opaque base64 ciphertext string — not valid JSON. A native `json` column
     * enforces JSON validity (MySQL `CHECK` constraint) and rejects that value,
     * so the column must be plain text to hold encrypted data.
     */
    public function up(): void
    {
        Schema::table('payment_gateway_configs', function (Blueprint $table) {
            $table->text('config_extra')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('payment_gateway_configs', function (Blueprint $table) {
            $table->json('config_extra')->nullable()->change();
        });
    }
};
