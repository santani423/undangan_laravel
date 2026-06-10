<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 255); // May differ from user's account name
            $table->string('event_type', 100)->nullable(); // Wedding, Birthday, etc
            $table->text('content');
            $table->tinyInteger('rating')->unsigned()->default(5); // 1-5 stars
            $table->string('photo_url', 500)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('is_featured')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'is_featured'], 'idx_status_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
