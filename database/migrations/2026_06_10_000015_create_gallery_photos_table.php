<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->integer('file_size')->nullable(); // Bytes
            $table->string('media_type', 50); // photo, video
            $table->string('mime_type', 100)->nullable();
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('category', 100)->default('general'); // general, prewedding, pregnancy, baby, slider
            $table->string('thumbnail_url', 500)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['invitation_id', 'category'], 'idx_invitation_category');
            $table->index('media_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_photos');
    }
};
