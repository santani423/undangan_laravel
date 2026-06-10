<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    protected $fillable = [
        'name',
        'label',
        'description',
        'price',
        'currency',
        'billing_period',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'price'         => 'decimal:2',
            'is_active'     => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function features(): HasMany
    {
        return $this->hasMany(PackageFeature::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }

    public function getFeatureValue(string $key): ?string
    {
        return $this->features->firstWhere('feature_key', $key)?->feature_value;
    }
}
