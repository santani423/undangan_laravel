<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    protected $fillable = [
        'user_id',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'bank_code',
        'account_type',
        'verification_status',
        'verification_code',
        'verification_attempts',
        'verified_at',
        'is_primary',
        'is_active',
    ];

    protected $hidden = [
        'bank_account_number',
        'verification_code',
    ];

    protected function casts(): array
    {
        return [
            // Encrypted via Laravel's encrypted cast
            'bank_account_number'   => 'encrypted',
            'verification_attempts' => 'integer',
            'verified_at'           => 'datetime',
            'is_primary'            => 'boolean',
            'is_active'             => 'boolean',
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

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }
}
