<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('interactive_games')->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->json('response_data')->nullable();
            $table->integer('score')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['game_id', 'score'], 'idx_game_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_responses');
    }
};
