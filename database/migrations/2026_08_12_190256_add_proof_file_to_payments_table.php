<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('proof_file_path', 255)->nullable()->after('webhook_payload');
            $table->timestamp('proof_uploaded_at')->nullable()->after('proof_file_path');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['proof_file_path', 'proof_uploaded_at']);
        });
    }
};
