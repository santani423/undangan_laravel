<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            // ── Informasi Aplikasi ────────────────────────────────────────────
            'app_name'    => ['required', 'string', 'max:100'],
            'app_tagline' => ['nullable', 'string', 'max:200'],
            'app_description' => ['nullable', 'string', 'max:500'],

            // ── Informasi Perusahaan ──────────────────────────────────────────
            'company_name'    => ['required', 'string', 'max:200'],
            'company_email'   => ['required', 'email', 'max:255'],
            'company_phone'   => ['nullable', 'string', 'max:30'],
            'company_address' => ['nullable', 'string', 'max:500'],
            'company_website' => ['nullable', 'url', 'max:255'],
            'company_npwp'    => ['nullable', 'string', 'max:30'],

            // ── Domain ────────────────────────────────────────────────────────
            'domain_main'       => ['nullable', 'string', 'max:255'],
            'subdomain_admin'   => ['nullable', 'string', 'max:255'],
            'subdomain_settings'=> ['nullable', 'string', 'max:255'],
            'subdomain_customer'=> ['nullable', 'string', 'max:255'],

            // ── Regional ─────────────────────────────────────────────────────
            'app_timezone'      => ['required', 'string', 'timezone:all'],
            'app_language'      => ['required', 'string', 'in:id,en'],
            'app_date_format'   => ['required', 'string', 'in:d_M_Y,d_F_Y,d_m_Y,Y-m-d'],
            'app_currency'      => ['required', 'string', 'in:IDR,USD,EUR'],
            'app_number_format' => ['required', 'string', 'in:dot_comma,comma_dot'],
            'app_first_day'     => ['required', 'string', 'in:monday,sunday'],

            // ── Notifikasi ────────────────────────────────────────────────────
            'notify_email'    => ['boolean'],
            'notify_push'     => ['boolean'],
            'notify_sms'      => ['boolean'],
            'notify_whatsapp' => ['boolean'],

            // ── SMTP ─────────────────────────────────────────────────────────
            'smtp_host'       => ['nullable', 'string', 'max:255'],
            'smtp_port'       => ['nullable', 'integer', 'min:1', 'max:65535'],
            'smtp_username'   => ['nullable', 'string', 'max:255'],
            'smtp_password'   => ['nullable', 'string', 'max:255'],
            'smtp_encryption' => ['nullable', 'string', 'in:tls,ssl,none'],
            'mail_from_name'  => ['nullable', 'string', 'max:100'],
            'mail_from_email' => ['nullable', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'app_name.required'      => 'Nama aplikasi wajib diisi.',
            'app_name.max'           => 'Nama aplikasi maksimal 100 karakter.',
            'company_name.required'  => 'Nama perusahaan wajib diisi.',
            'company_email.required' => 'Email perusahaan wajib diisi.',
            'company_email.email'    => 'Format email tidak valid.',
            'company_website.url'    => 'Format URL website tidak valid (sertakan https://).',
            'app_timezone.timezone'  => 'Zona waktu tidak valid.',
            'app_language.in'        => 'Bahasa tidak valid.',
            'app_currency.in'        => 'Mata uang tidak valid.',
            'smtp_port.integer'      => 'Port SMTP harus berupa angka.',
            'smtp_port.min'          => 'Port SMTP tidak valid.',
            'smtp_port.max'          => 'Port SMTP tidak valid.',
            'mail_from_email.email'  => 'Format email pengirim tidak valid.',
        ];
    }
}
