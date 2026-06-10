<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('email', 255)->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->string('gender', 20)->nullable(); // male, female, other
            $table->string('category', 100)->nullable(); // VIP, Family, Friend, etc

            // Notes
            $table->text('notes')->nullable();

            // QR Code
            $table->string('qr_code_url', 500)->nullable();
            $table->string('qr_code_data', 500)->nullable()->unique();

            // RSVP Status (cached for performance)
            $table->string('rsvp_status', 50)->default('pending'); // pending, attending, not_attending, maybe
            $table->integer('rsvp_headcount')->default(1);
            $table->text('rsvp_notes')->nullable();
            $table->timestamp('rsvp_submitted_at')->nullable();

            // Attendance
            $table->timestamp('checked_in_at')->nullable();

            $table->timestamps();

            $table->index(['invitation_id', 'email'], 'idx_invitation_email');
            $table->index(['invitation_id', 'rsvp_status'], 'idx_invitation_rsvp_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
