<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // ── Informasi Aplikasi ────────────────────────────────────────────
            ['key' => 'app_name',        'value' => 'Undesia',                       'type' => 'string',  'group' => 'general'],
            ['key' => 'app_tagline',     'value' => 'Undangan Digital Modern',        'type' => 'string',  'group' => 'general'],
            ['key' => 'app_description', 'value' => 'Platform undangan digital modern untuk berbagai jenis acara.', 'type' => 'string', 'group' => 'general'],
            ['key' => 'app_logo',        'value' => null,                             'type' => 'file',    'group' => 'general'],
            ['key' => 'app_favicon',     'value' => null,                             'type' => 'file',    'group' => 'general'],

            // ── Informasi Perusahaan ──────────────────────────────────────────
            ['key' => 'company_name',    'value' => 'PT. Undesia Digital Indonesia',  'type' => 'string',  'group' => 'company'],
            ['key' => 'company_email',   'value' => 'halo@undesia.com',               'type' => 'string',  'group' => 'company'],
            ['key' => 'company_phone',   'value' => '+62 812-0000-0000',              'type' => 'string',  'group' => 'company'],
            ['key' => 'company_address', 'value' => '',                               'type' => 'string',  'group' => 'company'],
            ['key' => 'company_website', 'value' => 'https://undesia.com',            'type' => 'string',  'group' => 'company'],
            ['key' => 'company_npwp',    'value' => '',                               'type' => 'string',  'group' => 'company'],

            // ── Domain ────────────────────────────────────────────────────────
            ['key' => 'domain_main',             'value' => 'undesia.com',  'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_admin',          'value' => 'undesia.com',  'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_settings',       'value' => 'undesia.com',  'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_customer',       'value' => 'undesia.com',  'type' => 'string', 'group' => 'domain'],
            ['key' => 'domain_main_status',        'value' => 'active',      'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_admin_status',    'value' => 'active',      'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_settings_status', 'value' => 'pending',     'type' => 'string', 'group' => 'domain'],
            ['key' => 'subdomain_customer_status', 'value' => 'pending',     'type' => 'string', 'group' => 'domain'],

            // ── Regional ─────────────────────────────────────────────────────
            ['key' => 'app_timezone',      'value' => 'Asia/Jakarta', 'type' => 'string', 'group' => 'regional'],
            ['key' => 'app_language',      'value' => 'id',           'type' => 'string', 'group' => 'regional'],
            ['key' => 'app_date_format',   'value' => 'd_M_Y',        'type' => 'string', 'group' => 'regional'],
            ['key' => 'app_currency',      'value' => 'IDR',          'type' => 'string', 'group' => 'regional'],
            ['key' => 'app_number_format', 'value' => 'dot_comma',    'type' => 'string', 'group' => 'regional'],
            ['key' => 'app_first_day',     'value' => 'monday',       'type' => 'string', 'group' => 'regional'],

            // ── Notifikasi ────────────────────────────────────────────────────
            ['key' => 'notify_email',    'value' => '1',   'type' => 'boolean', 'group' => 'notification'],
            ['key' => 'notify_push',     'value' => '0',   'type' => 'boolean', 'group' => 'notification'],
            ['key' => 'notify_sms',      'value' => '0',   'type' => 'boolean', 'group' => 'notification'],
            ['key' => 'notify_whatsapp', 'value' => '1',   'type' => 'boolean', 'group' => 'notification'],

            // ── SMTP ─────────────────────────────────────────────────────────
            ['key' => 'smtp_host',       'value' => '',                 'type' => 'string', 'group' => 'notification'],
            ['key' => 'smtp_port',       'value' => '587',              'type' => 'string', 'group' => 'notification'],
            ['key' => 'smtp_username',   'value' => '',                 'type' => 'string', 'group' => 'notification'],
            ['key' => 'smtp_password',   'value' => '',                 'type' => 'string', 'group' => 'notification'],
            ['key' => 'smtp_encryption', 'value' => 'tls',              'type' => 'string', 'group' => 'notification'],
            ['key' => 'mail_from_name',  'value' => 'Undesia',          'type' => 'string', 'group' => 'notification'],
            ['key' => 'mail_from_email', 'value' => 'noreply@undesia.com', 'type' => 'string', 'group' => 'notification'],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'type' => $setting['type'], 'group' => $setting['group']]
            );
        }

        AppSetting::flushCache();
    }
}
