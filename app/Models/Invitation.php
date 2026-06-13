<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invitation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'event_type_id',
        'package_id',
        'theme_id',
        'slug',
        'invitation_code',
        'title',
        'description',
        'custom_domain',
        'qr_code_url',
        'status',
        'is_public',
        'requires_password',
        'password_hash',
        'activated_at',
        'expires_at',
        'allow_guest_comments',
        'allow_guest_plus_one',
        'max_guests_plus_one',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'is_public'           => 'boolean',
            'requires_password'   => 'boolean',
            'allow_guest_comments'=> 'boolean',
            'allow_guest_plus_one'=> 'boolean',
            'max_guests_plus_one' => 'integer',
            'activated_at'        => 'datetime',
            'expires_at'          => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(InvitationSetting::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(InvitationEvent::class)->orderBy('display_order');
    }

    public function contents(): HasMany
    {
        return $this->hasMany(InvitationContent::class);
    }

    public function paymentMethods(): HasMany
    {
        return $this->hasMany(InvitationPaymentMethod::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function galleryPhotos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)->orderBy('display_order');
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class)->orderBy('display_order');
    }

    public function sliderPhotos(): HasMany
    {
        return $this->hasMany(SliderPhoto::class)->orderBy('display_order');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    public function genderPollVotes(): HasMany
    {
        return $this->hasMany(GenderPollVote::class);
    }

    public function liveStreamSessions(): HasMany
    {
        return $this->hasMany(LiveStreamSession::class);
    }

    public function interactiveGames(): HasMany
    {
        return $this->hasMany(InteractiveGame::class);
    }

    public function instagramFilters(): HasMany
    {
        return $this->hasMany(InstagramFilter::class);
    }

    public function dressCode(): HasOne
    {
        return $this->hasOne(DressCode::class);
    }

    public function giftWishlistItems(): HasMany
    {
        return $this->hasMany(GiftWishlistItem::class)->orderBy('display_order');
    }

    public function digitalEnvelopeTransactions(): HasMany
    {
        return $this->hasMany(DigitalEnvelopeTransaction::class);
    }

    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    public function getContent(string $key): ?string
    {
        return $this->contents->firstWhere('content_key', $key)?->content_value;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
