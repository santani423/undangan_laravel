<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventType extends Model
{
    /**
     * Maps event_types.name to packages.invitation_type. `label` is a
     * free-form display string (see database/seeders/EventTypeSeeder.php)
     * and must never be compared against invitation_type's fixed Indonesian
     * slug set (see Admin\Settings\PackageController's Rule::in) — doing so
     * previously broke as soon as a label picked up a space (e.g. "Ulang
     * Tahun" no longer matching invitation_type "ulang_tahun").
     */
    public const INVITATION_TYPES = [
        'wedding'       => 'pernikahan',
        'birthday'      => 'ulang_tahun',
        'khitanan'      => 'khitanan',
        'aqiqah'        => 'aqiqah',
        'gender_reveal' => 'gender_reveal',
        'syukuran'      => 'syukuran',
    ];

    protected $fillable = [
        'name',
        'label',
        'description',
        'icon_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function fields(): HasMany
    {
        return $this->hasMany(EventTypeField::class)->orderBy('display_order');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function invitationType(): ?string
    {
        return self::INVITATION_TYPES[$this->name] ?? null;
    }

    public static function findActiveByInvitationType(string $invitationType): ?self
    {
        $name = array_search($invitationType, self::INVITATION_TYPES, true);

        return $name ? self::active()->where('name', $name)->first() : null;
    }
}
