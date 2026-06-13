<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->unique();
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('category', 100)->default('Floral');
            $table->string('event_type', 100)->default('Pernikahan');
            $table->string('preview_image_url', 500)->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('color_primary', 20)->default('#e8a5b4');
            $table->string('color_secondary', 20)->default('#f9e4ea');
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_exclusive')->default(false);
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
            $table->index('category');
            $table->index('event_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
