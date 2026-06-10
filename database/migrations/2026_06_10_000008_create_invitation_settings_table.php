<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->unique()->constrained('invitations')->cascadeOnDelete();

            // Feature Toggles
            $table->boolean('feature_rsvp')->default(true);
            $table->boolean('feature_gift_wishlist')->default(false);
            $table->boolean('feature_gender_poll')->default(false);
            $table->boolean('feature_live_stream')->default(false);
            $table->boolean('feature_interactive_games')->default(false);
            $table->boolean('feature_dress_code')->default(false);
            $table->boolean('feature_amplop_digital')->default(false);
            $table->boolean('feature_instagram_filter')->default(false);
            $table->boolean('feature_analytics')->default(false);
            $table->boolean('feature_page_builder')->default(false);
            $table->boolean('feature_custom_domain')->default(false);

            // Settings
            $table->string('countdown_label', 100)->default('Hitung Mundur');
            $table->boolean('show_guest_count')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_settings');
    }
};
