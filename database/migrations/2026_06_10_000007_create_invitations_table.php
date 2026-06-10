<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('event_type_id')->constrained('event_types');
            $table->foreignId('package_id')->constrained('packages');
            $table->foreignId('theme_id')->nullable()->constrained('themes')->nullOnDelete();

            // Identity
            $table->string('slug', 255)->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('custom_domain', 255)->unique()->nullable();
            $table->string('qr_code_url', 500)->nullable();

            // Status
            $table->enum('status', ['draft', 'active', 'expired', 'archived'])->default('draft');
            $table->boolean('is_public')->default(false);
            $table->boolean('requires_password')->default(false);
            $table->string('password_hash', 255)->nullable();

            // Expiry
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Settings
            $table->boolean('allow_guest_comments')->default(true);
            $table->boolean('allow_guest_plus_one')->default(true);
            $table->integer('max_guests_plus_one')->default(1);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at'], 'idx_user_created');
            $table->index('slug');
            $table->index('custom_domain');
            $table->index('status');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
