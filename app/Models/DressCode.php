<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DressCode extends Model
{
    protected $fillable = [
        'invitation_id',
        'title',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DressCodeItem::class)->orderBy('display_order');
    }

    public function palettes(): HasMany
    {
        return $this->hasMany(DressCodePalette::class)->orderBy('display_order');
    }
}
