<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('status', 50); // attending, not_attending, maybe, undecided
            $table->integer('headcount')->default(1);
            $table->string('dietary_restrictions', 500)->nullable();
            $table->text('special_requests')->nullable();
            $table->string('family_name', 255)->nullable();
            $table->string('relationship_to_couple', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->unique(['guest_id', 'invitation_id'], 'uq_guest_invitation');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rsvps');
    }
};
