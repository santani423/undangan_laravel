<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $eventTypeId = DB::table('event_types')->where('name', 'wedding')->value('id');

        if (! $eventTypeId) {
            return;
        }

        DB::table('event_type_fields')
            ->where('event_type_id', $eventTypeId)
            ->whereIn('field_key', ['groom_child_order', 'bride_child_order'])
            ->update([
                'field_type' => 'number',
                'placeholder' => 'Contoh: 1',
                'help_text' => 'Opsional. Isi angka saja, misalnya 1 untuk anak pertama.',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        $eventTypeId = DB::table('event_types')->where('name', 'wedding')->value('id');

        if (! $eventTypeId) {
            return;
        }

        DB::table('event_type_fields')
            ->where('event_type_id', $eventTypeId)
            ->where('field_key', 'groom_child_order')
            ->update([
                'field_type' => 'text',
                'placeholder' => 'cth. Anak pertama',
                'help_text' => null,
                'updated_at' => now(),
            ]);

        DB::table('event_type_fields')
            ->where('event_type_id', $eventTypeId)
            ->where('field_key', 'bride_child_order')
            ->update([
                'field_type' => 'text',
                'placeholder' => 'cth. Anak kedua',
                'help_text' => null,
                'updated_at' => now(),
            ]);
    }
};
