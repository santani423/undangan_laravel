<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->unsignedSmallInteger('max_music_upload_mb')->default(1000)->after('max_gallery_uploads')
                  ->comment('Batas ukuran upload musik dalam MB (0 = tidak diizinkan)');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('max_music_upload_mb');
        });
    }
};
