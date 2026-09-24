<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class Theme extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'event_type',
        'preview_image_url',
        'thumbnail_url',
        'color_primary',
        'color_secondary',
        'tags',
        'is_active',
        'is_premium',
        'is_exclusive',
        'price',
        'usage_count',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tags'         => 'array',
            'is_active'    => 'boolean',
            'is_premium'   => 'boolean',
            'is_exclusive' => 'boolean',
            'price'        => 'integer',
            'usage_count'  => 'integer',
            'sort_order'   => 'integer',
        ];
    }

    /**
     * sort_order is a 1..n sequence per invitation type (event_type) and is
     * never mass-assigned — only these hooks, resequence() and reorder()
     * write it. Callers that create/update/delete themes should wrap the call
     * in a DB transaction so the row locks below actually serialise writers.
     */
    protected static function booted(): void
    {
        // New theme → last position of its invitation type.
        static::creating(function (Theme $theme) {
            $theme->sort_order ??= static::nextSortOrder($theme->event_type);
        });

        // Moved to another invitation type → last position there…
        static::updating(function (Theme $theme) {
            if ($theme->isDirty('event_type') && ! $theme->isDirty('sort_order')) {
                $theme->sort_order = static::nextSortOrder($theme->event_type);
            }
        });

        // …and close the gap it left behind in the old type.
        static::updated(function (Theme $theme) {
            if ($theme->wasChanged('event_type')) {
                static::resequence($theme->getOriginal('event_type'));
            }
        });

        static::deleted(function (Theme $theme) {
            static::resequence($theme->event_type);
        });
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Canonical display order for every theme listing: the admin-defined
     * sort_order (unplaced rows last). Within one invitation type this is the
     * exact admin order; lists that mix types interleave them by position.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query
            ->orderByRaw('sort_order IS NULL')
            ->orderBy('sort_order')
            ->orderBy('event_type')
            ->orderBy('id');
    }

    /**
     * Persist a new order for one invitation type. $ids must be exactly the
     * full set of that type's theme ids — partial or foreign lists are
     * rejected so the sequence can never end up with gaps or duplicates.
     *
     * @param  array<int, int>  $ids
     */
    public static function reorder(string $eventType, array $ids): void
    {
        DB::transaction(function () use ($eventType, $ids) {
            $current = static::query()
                ->where('event_type', $eventType)
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->sort()
                ->values()
                ->all();

            $requested = collect($ids)->map(fn ($id) => (int) $id);

            if ($requested->duplicates()->isNotEmpty() || $requested->sort()->values()->all() !== $current) {
                throw ValidationException::withMessages([
                    'ids' => 'Daftar template tidak sesuai dengan data terbaru. Muat ulang halaman lalu coba lagi.',
                ]);
            }

            static::writeSequence($eventType, $requested->all());
        });
    }

    /** Renumber one invitation type to a gap-free 1..n, keeping its current order. */
    public static function resequence(string $eventType): void
    {
        DB::transaction(function () use ($eventType) {
            $ids = static::query()
                ->where('event_type', $eventType)
                ->ordered()
                ->lockForUpdate()
                ->pluck('id')
                ->all();

            static::writeSequence($eventType, $ids);
        });
    }

    /** Resequence every invitation type (used after raw inserts, e.g. seeders). */
    public static function resequenceAll(): void
    {
        static::query()->distinct()->pluck('event_type')->each(fn (string $type) => static::resequence($type));
    }

    private static function nextSortOrder(string $eventType): int
    {
        return (int) static::query()
            ->where('event_type', $eventType)
            ->lockForUpdate()
            ->max('sort_order') + 1;
    }

    /**
     * Clear then rewrite positions so the (event_type, sort_order) unique
     * index never sees a transient duplicate. Goes through the base query
     * builder to leave updated_at and model events untouched.
     *
     * @param  array<int, int>  $orderedIds
     */
    private static function writeSequence(string $eventType, array $orderedIds): void
    {
        static::query()->toBase()->where('event_type', $eventType)->update(['sort_order' => null]);

        foreach (array_values($orderedIds) as $index => $id) {
            static::query()->toBase()->where('id', $id)->update(['sort_order' => $index + 1]);
        }
    }
}
