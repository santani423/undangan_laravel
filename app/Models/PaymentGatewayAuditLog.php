<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentGatewayAuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'gateway_name',
        'action',
        'old_values',
        'new_values',
        'changed_by_user_id',
        'ip_address',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    public function gatewayConfig(): BelongsTo
    {
        return $this->belongsTo(PaymentGatewayConfig::class, 'gateway_name', 'gateway_name');
    }
}
