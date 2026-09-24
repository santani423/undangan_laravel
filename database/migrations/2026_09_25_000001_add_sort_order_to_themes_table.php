<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-invitation-type (themes.event_type) display order, 1..n within each
     * type. Nullable so raw inserts (seeders) land "unplaced" and get appended
     * by Theme::resequence(); the unique index rejects duplicate positions
     * inside one type while multiple NULLs stay allowed.
     */
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->nullable()->after('event_type');
            $table->unique(['event_type', 'sort_order'], 'themes_event_type_sort_order_unique');
        });

        // Backfill with the order customers already saw on the theme picker
        // (free → premium → exclusive, then most used), so nothing reshuffles.
        DB::table('themes')
            ->select('event_type')
            ->distinct()
            ->pluck('event_type')
            ->each(function (string $eventType) {
                DB::table('themes')
                    ->where('event_type', $eventType)
                    ->orderBy('is_premium')
                    ->orderBy('is_exclusive')
                    ->orderByDesc('usage_count')
                    ->orderBy('id')
                    ->pluck('id')
                    ->each(fn (int $id, int $i) => DB::table('themes')->where('id', $id)->update(['sort_order' => $i + 1]));
            });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropUnique('themes_event_type_sort_order_unique');
            $table->dropColumn('sort_order');
        });
    }
};
