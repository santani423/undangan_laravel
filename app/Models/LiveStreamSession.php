<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveStreamSession extends Model
{
    protected $fillable = [
        'invitation_id',
        'stream_title',
        'stream_url',
        'stream_provider',
        'provider_stream_id',
        'scheduled_start_at',
        'actual_start_at',
        'actual_end_at',
        'peak_viewers',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_start_at' => 'datetime',
            'actual_start_at'    => 'datetime',
            'actual_end_at'      => 'datetime',
            'peak_viewers'       => 'integer',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function isLive(): bool
    {
        return $this->status === 'live';
    }
}
