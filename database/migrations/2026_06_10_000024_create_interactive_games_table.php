<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactive_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('game_title', 255);
            $table->string('game_type', 100); // quiz, trivia, guessing, etc
            $table->text('game_description')->nullable();
            $table->json('game_config')->nullable();
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->enum('status', ['draft', 'active', 'ended'])->default('draft');
            $table->timestamps();

            $table->index(['invitation_id', 'status'], 'idx_interactive_games_invitation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interactive_games');
    }
};
