<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Story extends Model
{
    protected $fillable = [
        'invitation_id',
        'title',
        'content',
        'story_type',
        'story_date',
        'display_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'story_date'    => 'date',
            'display_order' => 'integer',
            'is_published'  => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
