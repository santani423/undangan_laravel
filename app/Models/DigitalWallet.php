<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DigitalWallet extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'provider_label',
        'account_number',
        'account_name',
        'logo_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static array $providers = [
        'dana'      => 'DANA',
        'ovo'       => 'OVO',
        'gopay'     => 'GoPay',
        'shopeepay' => 'ShopeePay',
        'linkaja'   => 'LinkAja',
        'jeniuspay' => 'Jenius Pay',
        'other'     => 'Lainnya',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitations(): BelongsToMany
    {
        return $this->belongsToMany(Invitation::class, 'invitation_digital_wallets')
            ->withPivot(['is_displayed', 'display_order'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->logo_path);
    }
}
