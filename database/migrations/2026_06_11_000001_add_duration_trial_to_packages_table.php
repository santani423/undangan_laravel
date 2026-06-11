<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_days')->default(90)->after('billing_period')
                ->comment('Masa aktif paket dalam hari setelah pembayaran');
            $table->unsignedSmallInteger('trial_days')->default(0)->after('duration_days')
                ->comment('Durasi trial undangan digital dalam hari (0 = tidak ada trial)');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['duration_days', 'trial_days']);
        });
    }
};
