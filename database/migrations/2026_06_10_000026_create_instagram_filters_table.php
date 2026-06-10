<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instagram_filters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('filter_name', 255);
            $table->string('filter_handle', 255)->nullable(); // @undesia_wedding_123
            $table->json('filter_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['invitation_id', 'is_active'], 'idx_invitation_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instagram_filters');
    }
};
