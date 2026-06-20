<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            // Slug unik per invitation
            $table->unique(['invitation_id', 'slug'], 'guests_invitation_slug_unique');

            // QR code URL unik global
            $table->unique('qr_code_url', 'guests_qr_code_url_unique');
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropUnique('guests_invitation_slug_unique');
            $table->dropUnique('guests_qr_code_url_unique');
        });
    }
};
