<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentGatewayConfig extends Model
{
    protected $fillable = [
        'gateway_name',
        'gateway_type',
        'config_key',
        'config_secret',
        'config_extra',
        'is_active',
        'is_test_mode',
        'configured_at',
        'configured_by_user_id',
        'last_verified_at',
    ];

    protected $hidden = [
        'config_key',
        'config_secret',
        'config_extra',
    ];

    protected function casts(): array
    {
        return [
            // Encrypted at rest via model cast
            'config_key'    => 'encrypted',
            'config_secret' => 'encrypted',
            'config_extra'  => 'encrypted:array',
            'is_active'     => 'boolean',
            'is_test_mode'  => 'boolean',
            'configured_at' => 'datetime',
            'last_verified_at' => 'datetime',
        ];
    }

    /**
     * config_extra decrypted safely. Reading it directly throws DecryptException
     * whenever the stored ciphertext doesn't match the current APP_KEY (e.g. the
     * key was rotated without re-saving gateway credentials) — that must never
     * bubble up into a 500 on the customer payment page or lock the admin out of
     * Settings → Pembayaran, since re-saving there is the only way to recover.
     */
    public function configExtraSafe(): array
    {
        try {
            return $this->config_extra ?? [];
        } catch (DecryptException) {
            return [];
        }
    }

    public function configuredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'configured_by_user_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(PaymentGatewayAuditLog::class, 'gateway_name', 'gateway_name');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
