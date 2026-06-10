<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateAppSettingRequest;
use App\Http\Requests\Settings\UploadAppAssetRequest;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingController extends Controller
{
    private const BOOLEAN_KEYS = [
        'notify_email', 'notify_push', 'notify_sms', 'notify_whatsapp',
    ];

    private const STRING_KEYS = [
        // General
        'app_name', 'app_tagline', 'app_description',
        // Company
        'company_name', 'company_email', 'company_phone', 'company_address',
        'company_website', 'company_npwp',
        // Domain
        'domain_main', 'subdomain_admin', 'subdomain_settings', 'subdomain_customer',
        // Regional
        'app_timezone', 'app_language', 'app_date_format',
        'app_currency', 'app_number_format', 'app_first_day',
        // SMTP
        'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
        'smtp_encryption', 'mail_from_name', 'mail_from_email',
    ];

    public function edit(Request $request): Response
    {
        $settings = AppSetting::allForPage();

        // Default values for any missing keys
        $defaults = [
            'app_name'           => config('app.name', 'Undesia'),
            'app_tagline'        => 'Undangan Digital Modern',
            'app_description'    => '',
            'app_version'        => config('app.version', '2.0.0'),
            'app_logo'           => null,
            'app_favicon'        => null,
            'company_name'       => 'PT. Undesia Digital Indonesia',
            'company_email'      => 'halo@undesia.com',
            'company_phone'      => '+62 812-0000-0000',
            'company_address'    => '',
            'company_website'    => 'https://undesia.com',
            'company_npwp'       => '',
            'domain_main'        => 'undesia.com',
            'subdomain_admin'    => 'undesia.com',
            'subdomain_settings' => 'undesia.com',
            'subdomain_customer' => 'undesia.com',
            'domain_main_status'       => 'active',
            'subdomain_admin_status'   => 'active',
            'subdomain_settings_status'=> 'pending',
            'subdomain_customer_status'=> 'pending',
            'app_timezone'       => 'Asia/Jakarta',
            'app_language'       => 'id',
            'app_date_format'    => 'd_M_Y',
            'app_currency'       => 'IDR',
            'app_number_format'  => 'dot_comma',
            'app_first_day'      => 'monday',
            'notify_email'       => true,
            'notify_push'        => false,
            'notify_sms'         => false,
            'notify_whatsapp'    => true,
            'smtp_host'          => '',
            'smtp_port'          => 587,
            'smtp_username'      => '',
            'smtp_password'      => '',
            'smtp_encryption'    => 'tls',
            'mail_from_name'     => 'Undesia',
            'mail_from_email'    => 'noreply@undesia.com',
        ];

        return Inertia::render('settings/app', [
            'settings' => array_merge($defaults, $settings),
            'status'   => $request->session()->get('status'),
        ]);
    }

    public function update(UpdateAppSettingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        foreach (self::STRING_KEYS as $key) {
            if (array_key_exists($key, $validated)) {
                AppSetting::set($key, $validated[$key] ?? '', 'string', $this->groupFor($key));
            }
        }

        foreach (self::BOOLEAN_KEYS as $key) {
            AppSetting::set($key, $request->boolean($key) ? '1' : '0', 'boolean', 'notification');
        }

        AppSetting::flushCache();

        return back()->with('status', 'settings-saved');
    }

    public function uploadAsset(UploadAppAssetRequest $request, string $type): JsonResponse
    {
        $file     = $request->file('file');
        $disk     = 'public';
        $dir      = "app-assets/{$type}";
        $filename = $type . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Delete old file
        $oldPath = AppSetting::get("app_{$type}");
        if ($oldPath && Storage::disk($disk)->exists($oldPath)) {
            Storage::disk($disk)->delete($oldPath);
        }

        $path = $file->storeAs($dir, $filename, $disk);

        AppSetting::set("app_{$type}", $path, 'file', 'general');
        AppSetting::flushCache();

        return response()->json([
            'path' => $path,
            'url'  => Storage::disk($disk)->url($path),
        ]);
    }

    public function deleteAsset(Request $request, string $type): JsonResponse
    {
        $path = AppSetting::get("app_{$type}");

        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        AppSetting::set("app_{$type}", '', 'file', 'general');
        AppSetting::flushCache();

        return response()->json(['deleted' => true]);
    }

    private function groupFor(string $key): string
    {
        return match (true) {
            in_array($key, ['app_name', 'app_tagline', 'app_description'])                          => 'general',
            str_starts_with($key, 'company_')                                                        => 'company',
            str_starts_with($key, 'domain_') || str_starts_with($key, 'subdomain_')                 => 'domain',
            in_array($key, ['app_timezone', 'app_language', 'app_date_format',
                            'app_currency', 'app_number_format', 'app_first_day'])                   => 'regional',
            str_starts_with($key, 'smtp_') || str_starts_with($key, 'mail_')                        => 'notification',
            default                                                                                   => 'general',
        };
    }
}
