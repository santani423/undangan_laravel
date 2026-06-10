<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dress_code_palettes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dress_code_id')->constrained('dress_codes')->cascadeOnDelete();
            $table->string('color_name', 100);
            $table->string('hex_value', 10); // #FF5733
            $table->string('rgb_value', 20)->nullable(); // rgb(255, 87, 51)
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('dress_code_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dress_code_palettes');
    }
};
