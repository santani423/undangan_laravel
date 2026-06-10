<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('title', 255);
            $table->longText('content');
            $table->string('story_type', 100)->default('general'); // general, love_story, timeline, pregnancy_journey, family_story
            $table->date('story_date')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['invitation_id', 'story_type'], 'idx_invitation_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
