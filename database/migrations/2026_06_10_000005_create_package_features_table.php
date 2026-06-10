<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->string('feature_key', 100);
            $table->string('feature_type', 50)->default('boolean'); // boolean, level
            $table->string('feature_value', 255)->default('true'); // true/false or basic/intermediate/full
            $table->timestamps();

            $table->unique(['package_id', 'feature_key'], 'uq_package_feature');
            $table->index('package_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_features');
    }
};
