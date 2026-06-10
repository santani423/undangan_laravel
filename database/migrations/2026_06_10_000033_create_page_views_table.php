<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Note: This table will grow significantly.
        // Implement archival strategy: keep 30 days in main table, archive older to summaries.
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->nullable()->constrained('invitations')->cascadeOnDelete();
            $table->string('ip_address', 45);
            $table->string('user_agent', 500)->nullable();
            $table->string('referer', 500)->nullable();
            $table->string('device_type', 50)->nullable(); // mobile, tablet, desktop
            $table->string('browser_name', 100)->nullable();
            $table->string('browser_version', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('session_id', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['invitation_id', 'created_at'], 'idx_page_views_invitation_date');
            $table->index('created_at');
            $table->index('device_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
