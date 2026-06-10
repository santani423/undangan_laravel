<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderPhoto extends Model
{
    protected $fillable = [
        'invitation_id',
        'file_path',
        'thumbnail_url',
        'submitted_by_guest_id',
        'guest_name',
        'display_order',
        'is_approved',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_approved'   => 'boolean',
            'approved_at'   => 'datetime',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'submitted_by_guest_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }
}
