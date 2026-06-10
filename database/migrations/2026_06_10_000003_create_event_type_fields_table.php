<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_type_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_type_id')->constrained('event_types')->cascadeOnDelete();
            $table->string('field_key', 100);
            $table->string('field_label', 255);
            $table->string('field_type', 50); // text, date, file, textarea, select, radio, etc
            $table->boolean('is_required')->default(false);
            $table->boolean('is_array')->default(false);
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->json('options')->nullable(); // For select/radio fields
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['event_type_id', 'field_key'], 'uq_event_field');
            $table->index('event_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_type_fields');
    }
};
