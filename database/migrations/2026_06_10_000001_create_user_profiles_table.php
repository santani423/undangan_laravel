<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('phone_number', 20)->nullable();
            $table->string('whatsapp_token', 255)->nullable();
            $table->json('notification_preferences')->default('{"email":true,"whatsapp":true}');
            $table->string('language', 10)->default('id');
            $table->string('timezone', 50)->default('Asia/Jakarta');
            $table->string('profile_photo_url', 500)->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();

            $table->index('whatsapp_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
