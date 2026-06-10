<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rsvp extends Model
{
    protected $fillable = [
        'guest_id',
        'invitation_id',
        'status',
        'headcount',
        'dietary_restrictions',
        'special_requests',
        'family_name',
        'relationship_to_couple',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'headcount' => 'integer',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
