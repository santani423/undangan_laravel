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

        $this->upsertField($eventTypeId, 'groom_child_order', 3);
        $this->upsertField($eventTypeId, 'bride_child_order', 10);

        $this->updateDisplayOrders($eventTypeId, [
            'groom_name' => 1,
            'groom_nickname' => 2,
            'groom_child_order' => 3,
            'groom_photo' => 4,
            'groom_father' => 5,
            'groom_mother' => 6,
            'groom_instagram' => 7,
            'bride_name' => 8,
            'bride_nickname' => 9,
            'bride_child_order' => 10,
            'bride_photo' => 11,
            'bride_father' => 12,
            'bride_mother' => 13,
            'bride_instagram' => 14,
            'couple_photo' => 15,
            'opening_quote' => 16,
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
            ->whereIn('field_key', ['groom_child_order', 'bride_child_order'])
            ->delete();

        $this->updateDisplayOrders($eventTypeId, [
            'groom_name' => 1,
            'groom_nickname' => 2,
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
        ]);
    }

    private function upsertField(int $eventTypeId, string $fieldKey, int $displayOrder): void
    {
        DB::table('event_type_fields')->updateOrInsert(
            ['event_type_id' => $eventTypeId, 'field_key' => $fieldKey],
            [
                'field_label' => 'Anak ke-',
                'field_type' => 'text',
                'is_required' => false,
                'is_array' => false,
                'placeholder' => 'cth. Anak pertama',
                'help_text' => null,
                'options' => null,
                'display_order' => $displayOrder,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    private function updateDisplayOrders(int $eventTypeId, array $orders): void
    {
        foreach ($orders as $fieldKey => $displayOrder) {
            DB::table('event_type_fields')
                ->where('event_type_id', $eventTypeId)
                ->where('field_key', $fieldKey)
                ->update([
                    'display_order' => $displayOrder,
                    'updated_at' => now(),
                ]);
        }
    }
};
