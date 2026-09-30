<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use LogsActivity;

    protected array $activityLogExcept = ['whatsapp_token'];

    protected $fillable = [
        'user_id',
        'phone_number',
        'whatsapp_token',
        'notification_preferences',
        'language',
        'timezone',
        'profile_photo_url',
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'notification_preferences' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
