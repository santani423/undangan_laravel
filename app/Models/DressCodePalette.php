<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DressCodePalette extends Model
{
    protected $fillable = [
        'dress_code_id',
        'color_name',
        'hex_value',
        'rgb_value',
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
