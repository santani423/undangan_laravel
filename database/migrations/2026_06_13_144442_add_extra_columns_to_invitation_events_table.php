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
        Schema::table('invitation_events', function (Blueprint $table) {
            $table->time('time_end')->nullable()->after('event_time');
            $table->string('location_name', 255)->nullable()->after('location');
            $table->string('maps_embed', 500)->nullable()->after('location_url');
            $table->string('maps_lat', 50)->nullable()->after('maps_embed');
            $table->string('maps_lng', 50)->nullable()->after('maps_lat');
        });
    }

    public function down(): void
    {
        Schema::table('invitation_events', function (Blueprint $table) {
            $table->dropColumn(['time_end', 'location_name', 'maps_embed', 'maps_lat', 'maps_lng']);
        });
    }
};
