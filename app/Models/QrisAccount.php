<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QrisAccount extends Model
{
    protected $fillable = [
        'user_id',
        'qris_code',
        'qris_reference_id',
        'merchant_id',
        'is_active',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'is_primary' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function digitalEnvelopes(): HasMany
    {
        return $this->hasMany(DigitalEnvelopeTransaction::class);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}
