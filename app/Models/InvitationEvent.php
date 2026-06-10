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
        'location',
        'location_url',
        'description',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'event_date'    => 'date',
            'display_order' => 'integer',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
