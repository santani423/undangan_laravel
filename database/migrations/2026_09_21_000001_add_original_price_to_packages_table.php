<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->decimal('original_price', 12, 2)->nullable()->after('price')
                  ->comment('Harga coret (sebelum diskon) yang ditampilkan di landing page; null = tidak ada');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('original_price');
        });
    }
};
