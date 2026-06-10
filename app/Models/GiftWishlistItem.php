<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftWishlistItem extends Model
{
    protected $fillable = [
        'invitation_id',
        'item_name',
        'item_description',
        'estimated_price',
        'currency',
        'purchase_url',
        'image_url',
        'category',
        'status',
        'reserved_by_guest_id',
        'reserved_at',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'estimated_price' => 'decimal:2',
            'reserved_at'     => 'datetime',
            'display_order'   => 'integer',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'reserved_by_guest_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
