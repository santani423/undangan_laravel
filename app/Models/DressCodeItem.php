<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DressCodeItem extends Model
{
    protected $fillable = [
        'dress_code_id',
        'item_name',
        'item_description',
        'recommended_brands',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    public function dressCode(): BelongsTo
    {
        return $this->belongsTo(DressCode::class);
    }
}
