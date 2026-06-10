<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalEnvelopeTransaction extends Model
{
    protected $fillable = [
        'invitation_id',
        'guest_id',
        'guest_name',
        'guest_email',
        'amount',
        'currency',
        'bank_account_id',
        'qris_account_id',
        'payment_method',
        'gateway_reference_id',
        'status',
        'confirmed_at',
        'message',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'confirmed_at' => 'datetime',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function qrisAccount(): BelongsTo
    {
        return $this->belongsTo(QrisAccount::class);
    }

    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }
}
