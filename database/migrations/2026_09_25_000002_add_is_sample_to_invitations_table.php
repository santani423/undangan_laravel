<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Marks the per-theme demo invitations seeded by SampleInvitationSeeder so
     * they can be told apart from customer invitations (theme preview lookup,
     * landing stats, public API writes). Existing rows default to false.
     */
    public function up(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->boolean('is_sample')->default(false)->after('status');
            $table->index(['is_sample', 'theme_id'], 'idx_invitations_sample_theme');
        });
    }

    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropIndex('idx_invitations_sample_theme');
            $table->dropColumn('is_sample');
        });
    }
};
