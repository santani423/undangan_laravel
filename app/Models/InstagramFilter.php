<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstagramFilter extends Model
{
    protected $fillable = [
        'invitation_id',
        'filter_name',
        'filter_handle',
        'filter_config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'filter_config' => 'array',
            'is_active'     => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
