<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slider_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('file_path', 500)->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->foreignId('submitted_by_guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('guest_name', 255)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_approved')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['invitation_id', 'is_approved'], 'idx_invitation_approved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slider_photos');
    }
};
