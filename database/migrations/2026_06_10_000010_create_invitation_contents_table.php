<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('content_key', 100);
            $table->longText('content_value')->nullable();
            $table->string('content_type', 50)->default('text'); // text, file, json, boolean, date, path
            $table->timestamps();

            $table->unique(['invitation_id', 'content_key'], 'uq_invitation_key');
            $table->index('invitation_id');
            $table->index('content_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_contents');
    }
};
