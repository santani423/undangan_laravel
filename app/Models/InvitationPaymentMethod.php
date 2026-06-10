<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationPaymentMethod extends Model
{
    protected $fillable = [
        'invitation_id',
        'payment_gateway',
        'config_override',
        'is_using_platform_config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'config_override'          => 'array',
            'is_using_platform_config' => 'boolean',
            'is_active'                => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
