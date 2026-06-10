<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'event_type',
        'content',
        'rating',
        'photo_url',
        'status',
        'is_featured',
        'display_order',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'rating'        => 'integer',
            'is_featured'   => 'boolean',
            'display_order' => 'integer',
            'approved_at'   => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->orderBy('display_order');
    }
}
