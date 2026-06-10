<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InteractiveGame extends Model
{
    protected $fillable = [
        'invitation_id',
        'game_title',
        'game_type',
        'game_description',
        'game_config',
        'start_time',
        'end_time',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'game_config' => 'array',
            'start_time'  => 'datetime',
            'end_time'    => 'datetime',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(GameResponse::class, 'game_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
