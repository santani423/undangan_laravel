<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image_url',
        'thumbnail_url',
        'colors',
        'is_free',
        'is_featured',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'colors'      => 'array',
            'is_free'     => 'boolean',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopePremium($query)
    {
        return $query->where('is_free', false);
    }
}
