<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $eventType = DB::table('event_types')->where('name', 'wedding')->first();

        if (! $eventType) {
            return;
        }

        $displayOrders = [
            ['field_key' => 'groom_name', 'display_order' => 1],
            ['field_key' => 'groom_nickname', 'display_order' => 2],
            ['field_key' => 'groom_photo', 'display_order' => 4],
            ['field_key' => 'groom_father', 'display_order' => 5],
            ['field_key' => 'groom_mother', 'display_order' => 6],
            ['field_key' => 'groom_instagram', 'display_order' => 7],
            ['field_key' => 'bride_name', 'display_order' => 8],
            ['field_key' => 'bride_nickname', 'display_order' => 9],
            ['field_key' => 'bride_photo', 'display_order' => 11],
            ['field_key' => 'bride_father', 'display_order' => 12],
            ['field_key' => 'bride_mother', 'display_order' => 13],
            ['field_key' => 'bride_instagram', 'display_order' => 14],
            ['field_key' => 'couple_photo', 'display_order' => 15],
            ['field_key' => 'opening_quote', 'display_order' => 16],
        ];

        foreach ($displayOrders as $field) {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventType->id)
                ->where('field_key', $field['field_key'])
                ->update([
                    'display_order' => $field['display_order'],
                    'updated_at' => now(),
                ]);
        }

        $fields = [
            [
                'field_key' => 'groom_child_order',
                'field_label' => 'Anak ke-',
                'field_type' => 'text',
                'is_required' => false,
                'display_order' => 3,
                'placeholder' => 'cth. Anak pertama',
            ],
            [
                'field_key' => 'bride_child_order',
                'field_label' => 'Anak ke-',
                'field_type' => 'text',
                'is_required' => false,
                'display_order' => 10,
                'placeholder' => 'cth. Anak kedua',
            ],
        ];

        foreach ($fields as $field) {
            DB::table('event_type_fields')->updateOrInsert(
                ['event_type_id' => $eventType->id, 'field_key' => $field['field_key']],
                [
                    'event_type_id' => $eventType->id,
                    'field_label' => $field['field_label'],
                    'field_type' => $field['field_type'],
                    'is_required' => false,
                    'is_array' => false,
                    'placeholder' => $field['placeholder'],
                    'help_text' => null,
                    'options' => null,
                    'display_order' => $field['display_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        $eventType = DB::table('event_types')->where('name', 'wedding')->first();

        if (! $eventType) {
            return;
        }

        DB::table('event_type_fields')
            ->where('event_type_id', $eventType->id)
            ->whereIn('field_key', ['groom_child_order', 'bride_child_order'])
            ->delete();

        $displayOrders = [
            'groom_photo' => 3,
            'groom_father' => 4,
            'groom_mother' => 5,
            'groom_instagram' => 6,
            'bride_name' => 7,
            'bride_nickname' => 8,
            'bride_photo' => 9,
            'bride_father' => 10,
            'bride_mother' => 11,
            'bride_instagram' => 12,
            'couple_photo' => 13,
            'opening_quote' => 14,
        ];

        foreach ($displayOrders as $fieldKey => $displayOrder) {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventType->id)
                ->where('field_key', $fieldKey)
                ->update([
                    'display_order' => $displayOrder,
                    'updated_at' => now(),
                ]);
        }
    }
};
