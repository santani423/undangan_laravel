<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTypeField extends Model
{
    protected $fillable = [
        'event_type_id',
        'field_key',
        'field_label',
        'field_type',
        'is_required',
        'is_array',
        'placeholder',
        'help_text',
        'options',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_required'   => 'boolean',
            'is_array'      => 'boolean',
            'options'       => 'array',
            'display_order' => 'integer',
        ];
    }

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }
}
