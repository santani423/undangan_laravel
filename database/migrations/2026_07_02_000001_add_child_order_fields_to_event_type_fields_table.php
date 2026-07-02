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

        $now = now();

        if (! DB::table('event_type_fields')->where('event_type_id', $eventTypeId)->where('field_key', 'groom_child_order')->exists()) {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventTypeId)
                ->where('display_order', '>=', 3)
                ->increment('display_order');

            DB::table('event_type_fields')->insert([
                'event_type_id' => $eventTypeId,
                'field_key'     => 'groom_child_order',
                'field_label'   => 'Anak ke-',
                'field_type'    => 'text',
                'is_required'   => false,
                'is_array'      => false,
                'placeholder'   => 'Contoh: 1',
                'help_text'     => 'Opsional. Kosongkan jika tidak ingin ditampilkan.',
                'options'       => null,
                'display_order' => 3,
                'created_at'    => $now,
                'updated_at'    => $now,
            ]);
        } else {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventTypeId)
                ->where('field_key', 'groom_child_order')
                ->update([
                    'field_label' => 'Anak ke-',
                    'field_type'  => 'text',
                    'is_required' => false,
                    'placeholder' => 'Contoh: 1',
                    'help_text'   => 'Opsional. Kosongkan jika tidak ingin ditampilkan.',
                    'updated_at'  => $now,
                ]);
        }

        if (! DB::table('event_type_fields')->where('event_type_id', $eventTypeId)->where('field_key', 'bride_child_order')->exists()) {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventTypeId)
                ->where('display_order', '>=', 10)
                ->increment('display_order');

            DB::table('event_type_fields')->insert([
                'event_type_id' => $eventTypeId,
                'field_key'     => 'bride_child_order',
                'field_label'   => 'Anak ke-',
                'field_type'    => 'text',
                'is_required'   => false,
                'is_array'      => false,
                'placeholder'   => 'Contoh: 1',
                'help_text'     => 'Opsional. Kosongkan jika tidak ingin ditampilkan.',
                'options'       => null,
                'display_order' => 10,
                'created_at'    => $now,
                'updated_at'    => $now,
            ]);
        } else {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventTypeId)
                ->where('field_key', 'bride_child_order')
                ->update([
                    'field_label' => 'Anak ke-',
                    'field_type'  => 'text',
                    'is_required' => false,
                    'placeholder' => 'Contoh: 1',
                    'help_text'   => 'Opsional. Kosongkan jika tidak ingin ditampilkan.',
                    'updated_at'  => $now,
                ]);
        }
    }

    public function down(): void
    {
        $eventTypeId = DB::table('event_types')->where('name', 'wedding')->value('id');

        if (! $eventTypeId) {
            return;
        }

        DB::table('event_type_fields')
            ->where('event_type_id', $eventTypeId)
            ->whereIn('field_key', ['groom_child_order', 'bride_child_order'])
            ->delete();
    }
};
