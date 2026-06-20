<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Guest extends Model
{
    protected $fillable = [
        'invitation_id',
        'name',
        'slug',
        'email',
        'phone_number',
        'gender',
        'category',
        'notes',
        'qr_code_url',
        'qr_code_data',
        'rsvp_status',
        'rsvp_headcount',
        'rsvp_notes',
        'rsvp_submitted_at',
        'checked_in_at',
        'message',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Guest $guest) {
            if (empty($guest->qr_code_data)) {
                $token = Str::uuid()->toString();
                $guest->qr_code_data = $token;
            }

            if (empty($guest->qr_code_url)) {
                $invSlug = $guest->invitation?->slug ?? $guest->invitation_id;
                $guest->qr_code_url = url("/inv/{$invSlug}/g/{$guest->qr_code_data}");
            }
        });
    }

    protected function casts(): array
    {
        return [
            'rsvp_headcount'    => 'integer',
            'rsvp_submitted_at' => 'datetime',
            'checked_in_at'     => 'datetime',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function rsvp(): HasOne
    {
        return $this->hasOne(Rsvp::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function sliderPhotos(): HasMany
    {
        return $this->hasMany(SliderPhoto::class, 'submitted_by_guest_id');
    }

    public function gameResponses(): HasMany
    {
        return $this->hasMany(GameResponse::class);
    }

    public function digitalEnvelopes(): HasMany
    {
        return $this->hasMany(DigitalEnvelopeTransaction::class);
    }

    public function reservedWishlistItems(): HasMany
    {
        return $this->hasMany(GiftWishlistItem::class, 'reserved_by_guest_id');
    }

    public function scopeAttending($query)
    {
        return $query->where('rsvp_status', 'attending');
    }

    public function scopePending($query)
    {
        return $query->where('rsvp_status', 'pending');
    }

    public function hasCheckedIn(): bool
    {
        return $this->checked_in_at !== null;
    }
}
