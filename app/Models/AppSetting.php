<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    // Cache TTL in seconds
    private const CACHE_TTL = 3600;
    private const CACHE_KEY = 'app_settings_all';

    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = static::allCached();

        if (! isset($settings[$key])) {
            return $default;
        }

        return static::castValue($settings[$key]['value'], $settings[$key]['type']);
    }

    public static function set(string $key, mixed $value, string $type = 'string', string $group = 'general'): void
    {
        $raw = is_array($value) ? json_encode($value) : (string) $value;

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $raw, 'type' => $type, 'group' => $group]
        );

        Cache::forget(self::CACHE_KEY);
    }

    public static function setMany(array $values, string $group = 'general'): void
    {
        foreach ($values as $key => $payload) {
            $value = is_array($payload) ? ($payload['value'] ?? $payload) : $payload;
            $type  = is_array($payload) ? ($payload['type']  ?? 'string') : 'string';
            static::set($key, $value, $type, $group);
        }

        Cache::forget(self::CACHE_KEY);
    }

    public static function allByGroup(string $group): array
    {
        return collect(static::allCached())
            ->filter(fn ($item) => $item['group'] === $group)
            ->mapWithKeys(fn ($item, $key) => [$key => static::castValue($item['value'], $item['type'])])
            ->toArray();
    }

    public static function allForPage(): array
    {
        $settings = static::allCached();
        $result   = [];

        foreach ($settings as $key => $item) {
            $result[$key] = static::castValue($item['value'], $item['type']);
        }

        return $result;
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private static function allCached(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return static::all()
                ->keyBy('key')
                ->map(fn ($row) => ['value' => $row->value, 'type' => $row->type, 'group' => $row->group])
                ->toArray();
        });
    }

    private static function castValue(mixed $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'json'    => json_decode((string) $value, true),
            default   => $value,
        };
    }
}
