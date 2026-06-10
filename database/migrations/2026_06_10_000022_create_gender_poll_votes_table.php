<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gender_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('team', 50); // team_a, team_b
            $table->string('voter_name', 255)->nullable();
            $table->string('ip_address', 45);
            $table->string('user_agent', 500)->nullable();
            $table->string('browser_fingerprint', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Composite index for dedup check (date handled at app level)
            $table->index(['invitation_id', 'ip_address'], 'idx_invitation_ip');
            $table->index(['invitation_id', 'team'], 'idx_invitation_team');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gender_poll_votes');
    }
};
