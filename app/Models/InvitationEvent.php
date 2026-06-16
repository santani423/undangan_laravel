<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationEvent extends Model
{
    protected $fillable = [
        'invitation_id',
        'event_name',
        'event_date',
        'event_time',
        'time_end',
        'location',
        'location_name',
        'location_url',
        'maps_embed',
        'maps_lat',
        'maps_lng',
        'description',
        'display_order',
        'is_countdown',
    ];

    protected function casts(): array
    {
        return [
            'event_date'    => 'date',
            'display_order' => 'integer',
            'is_countdown'  => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
