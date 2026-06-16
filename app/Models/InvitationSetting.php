<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationSetting extends Model
{
    protected $fillable = [
        'invitation_id',
        'feature_rsvp',
        'feature_gift_wishlist',
        'feature_gender_poll',
        'feature_live_stream',
        'feature_interactive_games',
        'feature_dress_code',
        'feature_amplop_digital',
        'feature_instagram_filter',
        'feature_analytics',
        'feature_page_builder',
        'feature_custom_domain',
        'countdown_label',
        'show_guest_count',
        // Greeting
        'greeting_title',
        'greeting_message',
        'greeting_guest_label',
        'greeting_button_text',
        // Music
        'music_enabled',
        'music_autoplay',
        'music_loop',
        'music_source',
        'music_library_id',
        'music_url',
        // Feature toggles JSON
        'features',
    ];

    protected function casts(): array
    {
        return [
            'feature_rsvp'              => 'boolean',
            'feature_gift_wishlist'     => 'boolean',
            'feature_gender_poll'       => 'boolean',
            'feature_live_stream'       => 'boolean',
            'feature_interactive_games' => 'boolean',
            'feature_dress_code'        => 'boolean',
            'feature_amplop_digital'    => 'boolean',
            'feature_instagram_filter'  => 'boolean',
            'feature_analytics'         => 'boolean',
            'feature_page_builder'      => 'boolean',
            'feature_custom_domain'     => 'boolean',
            'show_guest_count'          => 'boolean',
            'music_enabled'             => 'boolean',
            'music_autoplay'            => 'boolean',
            'music_loop'                => 'boolean',
            'features'                  => 'array',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
