<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameResponse extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'game_id',
        'guest_id',
        'response_data',
        'score',
        'submitted_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'response_data' => 'array',
            'score'         => 'integer',
            'submitted_at'  => 'datetime',
            'created_at'    => 'datetime',
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(InteractiveGame::class, 'game_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }
}
