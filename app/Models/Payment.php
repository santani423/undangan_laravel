<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'transaction_id',
        'payment_gateway',
        'gateway_reference_id',
        'gateway_order_id',
        'amount',
        'fee',
        'currency',
        'status',
        'error_code',
        'error_message',
        'webhook_received_at',
        'webhook_verified_at',
        'webhook_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount'               => 'decimal:2',
            'fee'                  => 'decimal:2',
            'webhook_received_at'  => 'datetime',
            'webhook_verified_at'  => 'datetime',
            'webhook_payload'      => 'array',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }
}
