<?php

namespace App\Models\Concerns;

use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Writes created / updated / deleted / restored entries to `activity_logs`.
 *
 * Attributes listed in the model's `$hidden` are recorded as "[redacted]" so
 * secrets (passwords, gateway keys) never land in the audit trail. A model can
 * declare `protected array $activityLogExcept = [...]` to skip noisy columns.
 */
trait LogsActivity
{
    private const ALWAYS_EXCEPT = ['created_at', 'updated_at', 'remember_token'];

    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            ActivityLogger::record('created', $model, ['attributes' => $model->activityLogAttributes($model->getAttributes())]);
        });

        static::updated(function ($model) {
            $changed = $model->activityLogAttributes($model->getChanges());

            if ($changed === []) {
                return;
            }

            $old = array_intersect_key($model->getRawOriginal(), $changed);

            ActivityLogger::record('updated', $model, [
                'old'        => $model->activityLogAttributes($old),
                'attributes' => $changed,
            ]);
        });

        static::deleted(function ($model) {
            $forced = in_array(SoftDeletes::class, class_uses_recursive($model), true) && $model->isForceDeleting();

            ActivityLogger::record($forced ? 'force_deleted' : 'deleted', $model);
        });

        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            static::restored(fn ($model) => ActivityLogger::record('restored', $model));
        }
    }

    protected function activityLogAttributes(array $attributes): array
    {
        $except = array_merge(self::ALWAYS_EXCEPT, $this->activityLogExcept ?? []);

        if (method_exists($this, 'getDeletedAtColumn')) {
            $except[] = $this->getDeletedAtColumn();
        }

        $filtered = array_diff_key($attributes, array_flip($except));

        foreach (array_intersect(array_keys($filtered), $this->getHidden()) as $key) {
            $filtered[$key] = '[redacted]';
        }

        return $filtered;
    }
}
