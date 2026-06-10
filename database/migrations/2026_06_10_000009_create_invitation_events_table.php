<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('event_name', 255); // e.g., Akad, Resepsi
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->string('location', 500)->nullable();
            $table->string('location_url', 500)->nullable(); // Google Maps URL
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['invitation_id', 'event_date'], 'idx_inv_events_invitation_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_events');
    }
};
