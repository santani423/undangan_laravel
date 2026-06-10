<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dress_code_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dress_code_id')->constrained('dress_codes')->cascadeOnDelete();
            $table->string('item_name', 255);
            $table->text('item_description')->nullable();
            $table->string('recommended_brands', 500)->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('dress_code_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dress_code_items');
    }
};
