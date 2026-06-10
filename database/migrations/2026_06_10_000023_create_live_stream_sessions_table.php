<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_stream_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('stream_title', 255)->nullable();
            $table->string('stream_url', 500)->nullable();
            $table->string('stream_provider', 100)->nullable(); // youtube, facebook, custom
            $table->string('provider_stream_id', 255)->nullable();
            $table->timestamp('scheduled_start_at')->nullable();
            $table->timestamp('actual_start_at')->nullable();
            $table->timestamp('actual_end_at')->nullable();
            $table->integer('peak_viewers')->default(0);
            $table->enum('status', ['scheduled', 'live', 'ended'])->default('scheduled');
            $table->timestamps();

            $table->index(['invitation_id', 'status'], 'idx_live_streams_invitation_status');
            $table->index('scheduled_start_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_stream_sessions');
    }
};
