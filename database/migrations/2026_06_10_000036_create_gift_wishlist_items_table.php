<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('item_name', 255);
            $table->text('item_description')->nullable();
            $table->decimal('estimated_price', 12, 2)->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->string('purchase_url', 500)->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('category', 100)->nullable(); // kitchen, bedroom, electronics, etc
            $table->enum('status', ['available', 'reserved', 'purchased'])->default('available');
            $table->foreignId('reserved_by_guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->timestamp('reserved_at')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['invitation_id', 'status'], 'idx_wishlist_invitation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_wishlist_items');
    }
};
