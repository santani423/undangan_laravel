<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeFieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            // Wedding fields
            'wedding' => [
                ['field_key' => 'groom_name', 'field_label' => 'Nama Pengantin Pria', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'groom_nickname', 'field_label' => 'Nama Panggilan Pengantin Pria', 'field_type' => 'text', 'is_required' => false, 'display_order' => 2],
                ['field_key' => 'groom_photo', 'field_label' => 'Foto Pengantin Pria', 'field_type' => 'file', 'is_required' => true, 'display_order' => 3],
                ['field_key' => 'groom_father', 'field_label' => 'Nama Ayah Pengantin Pria', 'field_type' => 'text', 'is_required' => false, 'display_order' => 4],
                ['field_key' => 'groom_mother', 'field_label' => 'Nama Ibu Pengantin Pria', 'field_type' => 'text', 'is_required' => false, 'display_order' => 5],
                ['field_key' => 'groom_instagram', 'field_label' => 'Instagram Pengantin Pria', 'field_type' => 'text', 'is_required' => false, 'display_order' => 6],
                ['field_key' => 'bride_name', 'field_label' => 'Nama Pengantin Wanita', 'field_type' => 'text', 'is_required' => true, 'display_order' => 7],
                ['field_key' => 'bride_nickname', 'field_label' => 'Nama Panggilan Pengantin Wanita', 'field_type' => 'text', 'is_required' => false, 'display_order' => 8],
                ['field_key' => 'bride_photo', 'field_label' => 'Foto Pengantin Wanita', 'field_type' => 'file', 'is_required' => true, 'display_order' => 9],
                ['field_key' => 'bride_father', 'field_label' => 'Nama Ayah Pengantin Wanita', 'field_type' => 'text', 'is_required' => false, 'display_order' => 10],
                ['field_key' => 'bride_mother', 'field_label' => 'Nama Ibu Pengantin Wanita', 'field_type' => 'text', 'is_required' => false, 'display_order' => 11],
                ['field_key' => 'bride_instagram', 'field_label' => 'Instagram Pengantin Wanita', 'field_type' => 'text', 'is_required' => false, 'display_order' => 12],
                ['field_key' => 'couple_photo', 'field_label' => 'Foto Bersama', 'field_type' => 'file', 'is_required' => false, 'display_order' => 13],
                ['field_key' => 'opening_quote', 'field_label' => 'Kutipan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 14],
            ],

            // Birthday fields
            'birthday' => [
                ['field_key' => 'child_name', 'field_label' => 'Nama Anak', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'child_nickname', 'field_label' => 'Nama Panggilan', 'field_type' => 'text', 'is_required' => false, 'display_order' => 2],
                ['field_key' => 'child_photo', 'field_label' => 'Foto Anak', 'field_type' => 'file', 'is_required' => true, 'display_order' => 3],
                ['field_key' => 'child_age', 'field_label' => 'Usia', 'field_type' => 'text', 'is_required' => true, 'display_order' => 4],
                ['field_key' => 'birthday_date', 'field_label' => 'Tanggal Ulang Tahun', 'field_type' => 'date', 'is_required' => true, 'display_order' => 5],
                ['field_key' => 'party_theme', 'field_label' => 'Tema Pesta', 'field_type' => 'text', 'is_required' => false, 'display_order' => 6],
                ['field_key' => 'father_name', 'field_label' => 'Nama Ayah', 'field_type' => 'text', 'is_required' => false, 'display_order' => 7],
                ['field_key' => 'mother_name', 'field_label' => 'Nama Ibu', 'field_type' => 'text', 'is_required' => false, 'display_order' => 8],
                ['field_key' => 'opening_message', 'field_label' => 'Pesan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 9],
            ],

            // Khitanan fields
            'khitanan' => [
                ['field_key' => 'child_name', 'field_label' => 'Nama Anak', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'child_photo', 'field_label' => 'Foto Anak', 'field_type' => 'file', 'is_required' => false, 'display_order' => 2],
                ['field_key' => 'child_age', 'field_label' => 'Usia', 'field_type' => 'text', 'is_required' => false, 'display_order' => 3],
                ['field_key' => 'father_name', 'field_label' => 'Nama Ayah', 'field_type' => 'text', 'is_required' => false, 'display_order' => 4],
                ['field_key' => 'mother_name', 'field_label' => 'Nama Ibu', 'field_type' => 'text', 'is_required' => false, 'display_order' => 5],
                ['field_key' => 'opening_message', 'field_label' => 'Pesan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 6],
            ],

            // Aqiqah fields
            'aqiqah' => [
                ['field_key' => 'baby_name', 'field_label' => 'Nama Bayi', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'baby_photo', 'field_label' => 'Foto Bayi', 'field_type' => 'file', 'is_required' => false, 'display_order' => 2],
                ['field_key' => 'baby_gender', 'field_label' => 'Jenis Kelamin', 'field_type' => 'select', 'is_required' => true, 'display_order' => 3, 'options' => json_encode(['Laki-laki', 'Perempuan'])],
                ['field_key' => 'birth_date', 'field_label' => 'Tanggal Lahir', 'field_type' => 'date', 'is_required' => true, 'display_order' => 4],
                ['field_key' => 'father_name', 'field_label' => 'Nama Ayah', 'field_type' => 'text', 'is_required' => false, 'display_order' => 5],
                ['field_key' => 'mother_name', 'field_label' => 'Nama Ibu', 'field_type' => 'text', 'is_required' => false, 'display_order' => 6],
                ['field_key' => 'opening_message', 'field_label' => 'Pesan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 7],
            ],

            // Gender Reveal fields
            'gender_reveal' => [
                ['field_key' => 'mother_name', 'field_label' => 'Nama Ibu', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'father_name', 'field_label' => 'Nama Ayah', 'field_type' => 'text', 'is_required' => true, 'display_order' => 2],
                ['field_key' => 'parents_photo', 'field_label' => 'Foto Orang Tua', 'field_type' => 'file', 'is_required' => false, 'display_order' => 3],
                ['field_key' => 'due_date', 'field_label' => 'Perkiraan Tanggal Lahir', 'field_type' => 'date', 'is_required' => false, 'display_order' => 4],
                ['field_key' => 'team_a_name', 'field_label' => 'Nama Tim A (misal: Tim Biru)', 'field_type' => 'text', 'is_required' => true, 'display_order' => 5],
                ['field_key' => 'team_b_name', 'field_label' => 'Nama Tim B (misal: Tim Pink)', 'field_type' => 'text', 'is_required' => true, 'display_order' => 6],
                ['field_key' => 'reveal_scheduled_at', 'field_label' => 'Jadwal Reveal', 'field_type' => 'date', 'is_required' => false, 'display_order' => 7],
                ['field_key' => 'opening_message', 'field_label' => 'Pesan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 8],
            ],

            // Syukuran fields
            'syukuran' => [
                ['field_key' => 'host_name', 'field_label' => 'Nama Tuan Rumah', 'field_type' => 'text', 'is_required' => true, 'display_order' => 1],
                ['field_key' => 'host_photo', 'field_label' => 'Foto Tuan Rumah', 'field_type' => 'file', 'is_required' => false, 'display_order' => 2],
                ['field_key' => 'occasion', 'field_label' => 'Acara / Hajatan', 'field_type' => 'text', 'is_required' => true, 'display_order' => 3],
                ['field_key' => 'opening_message', 'field_label' => 'Pesan Pembuka', 'field_type' => 'textarea', 'is_required' => false, 'display_order' => 4],
            ],
        ];

        foreach ($fields as $eventTypeName => $eventFields) {
            $eventType = DB::table('event_types')->where('name', $eventTypeName)->first();
            if (!$eventType) continue;

            foreach ($eventFields as $field) {
                DB::table('event_type_fields')->updateOrInsert(
                    ['event_type_id' => $eventType->id, 'field_key' => $field['field_key']],
                    array_merge($field, [
                        'event_type_id' => $eventType->id,
                        'is_array' => false,
                        'placeholder' => null,
                        'help_text' => null,
                        'options' => $field['options'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }
}
