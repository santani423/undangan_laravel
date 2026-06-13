<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Theme extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'event_type',
        'preview_image_url',
        'thumbnail_url',
        'color_primary',
        'color_secondary',
        'tags',
        'is_active',
        'is_premium',
        'is_exclusive',
        'price',
        'usage_count',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tags'         => 'array',
            'is_active'    => 'boolean',
            'is_premium'   => 'boolean',
            'is_exclusive' => 'boolean',
            'price'        => 'integer',
            'usage_count'  => 'integer',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
