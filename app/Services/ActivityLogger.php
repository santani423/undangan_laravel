<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Throwable;

/**
 * Single write path for the `activity_logs` audit trail.
 *
 * Actor defaults to the authenticated user; request metadata (IP, user agent)
 * is captured only when running inside an HTTP request. A failure to write a
 * log is reported but never aborts the business action that triggered it.
 */
class ActivityLogger
{
    public static function record(
        string $action,
        ?Model $subject = null,
        ?array $changes = null,
        ?int $userId = null,
    ): ?ActivityLog {
        // Seeders / artisan commands are not user activity.
        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return null;
        }

        try {
            $request = request();

            return ActivityLog::create([
                'user_id'    => $userId ?? Auth::id(),
                'action'     => $action,
                'model_type' => $subject ? $subject->getMorphClass() : null,
                'model_id'   => $subject?->getKey(),
                'changes'    => $changes ?: null,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent() ? mb_substr($request->userAgent(), 0, 500) : null,
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }
}
