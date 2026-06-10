<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryPhoto extends Model
{
    protected $fillable = [
        'invitation_id',
        'file_path',
        'file_size',
        'media_type',
        'mime_type',
        'title',
        'description',
        'category',
        'thumbnail_url',
        'display_order',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'file_size'     => 'integer',
            'display_order' => 'integer',
            'is_featured'   => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
