<?php

namespace App\Support;

use App\Models\InvitationSetting;

/**
 * Single source of truth for which background music an invitation plays.
 *
 * Event types listed in DEFAULTS fall back to a bundled track whenever the
 * invitation has no custom music, so nothing has to be stored per invitation
 * (and removing a custom track simply falls back again). Event types without
 * a default keep the original rule: music plays only when enabled and set.
 */
class InvitationMusic
{
    /** event type → bundled default track (path relative to public/). */
    private const DEFAULTS = [
        'birthday' => [
            'path'  => 'audio/birthday-default.mp3',
            'label' => 'Default Birthday Music',
        ],
    ];

    /**
     * The bundled default track for an event type, or null when it has none.
     *
     * @return array{url: string, label: string}|null
     */
    public static function default(?string $eventType): ?array
    {
        $default = self::DEFAULTS[$eventType] ?? null;

        return $default
            ? ['url' => asset($default['path']), 'label' => $default['label']]
            : null;
    }

    /**
     * The music the public viewer should play, or null for none.
     *
     * @return array{url: string, autoplay: bool, loop: bool}|null
     */
    public static function resolve(?InvitationSetting $settings, ?string $eventType): ?array
    {
        $custom = trim((string) ($settings?->music_url ?? ''));

        if ($custom !== '') {
            // A custom track is only silenced by its own "Aktifkan Musik" switch.
            $url = ($settings->music_enabled ?? false) ? self::customUrl($custom) : null;
        } else {
            // music_enabled is false on every untouched row, so it can't mean
            // "off" here; the features.music toggle is what hides the player.
            $url = self::default($eventType)['url'] ?? null;
        }

        return $url === null ? null : [
            'url'      => $url,
            'autoplay' => (bool) ($settings?->music_autoplay ?? true),
            'loop'     => (bool) ($settings?->music_loop ?? true),
        ];
    }

    /** music_url holds either a full URL or a path on the public disk. */
    private static function customUrl(string $value): string
    {
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }
}
