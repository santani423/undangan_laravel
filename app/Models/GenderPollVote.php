<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenderPollVote extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'invitation_id',
        'team',
        'voter_name',
        'ip_address',
        'user_agent',
        'browser_fingerprint',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
