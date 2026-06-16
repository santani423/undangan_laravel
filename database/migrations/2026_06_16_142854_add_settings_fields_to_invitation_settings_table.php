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
        Schema::table('invitation_settings', function (Blueprint $table) {
            // Greeting / cover page
            $table->string('greeting_title', 100)->default('Kepada Yth.')->after('show_guest_count');
            $table->text('greeting_message')->nullable()->after('greeting_title');
            $table->string('greeting_guest_label', 100)->default('Tamu Undangan')->after('greeting_message');
            $table->string('greeting_button_text', 100)->default('Buka Undangan')->after('greeting_guest_label');

            // Music
            $table->boolean('music_enabled')->default(false)->after('greeting_button_text');
            $table->boolean('music_autoplay')->default(true)->after('music_enabled');
            $table->boolean('music_loop')->default(true)->after('music_autoplay');
            $table->string('music_source', 20)->nullable()->after('music_loop');
            $table->string('music_library_id', 100)->nullable()->after('music_source');
            $table->string('music_url')->nullable()->after('music_library_id');

            // Feature visibility toggles (JSON)
            $table->json('features')->nullable()->after('music_url');
        });
    }

    public function down(): void
    {
        Schema::table('invitation_settings', function (Blueprint $table) {
            $table->dropColumn([
                'greeting_title', 'greeting_message', 'greeting_guest_label', 'greeting_button_text',
                'music_enabled', 'music_autoplay', 'music_loop', 'music_source', 'music_library_id', 'music_url',
                'features',
            ]);
        });
    }
};
