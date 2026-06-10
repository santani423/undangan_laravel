<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    protected $fillable = [
        'invitation_id',
        'guest_id',
        'comment_text',
        'guest_name',
        'guest_email',
        'status',
        'approved_at',
        'approved_by_user_id',
        'is_flagged',
        'flag_reason',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'is_flagged'  => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
