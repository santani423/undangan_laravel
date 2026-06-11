<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->unsignedSmallInteger('max_gallery_uploads')->default(0)->after('trial_days')
                ->comment('Maksimum jumlah upload foto/media ke galeri (0 = tidak terbatas)');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('max_gallery_uploads');
        });
    }
};
