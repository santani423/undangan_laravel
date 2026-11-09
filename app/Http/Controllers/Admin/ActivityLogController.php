<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'action' => (string) $request->query('action', ''),
        ];

        $logs = ActivityLog::query()
            ->with(['user' => fn ($query) => $query->withTrashed()->select('id', 'name', 'email')])
            ->when($filters['action'] !== '', fn ($query) => $query->where('action', $filters['action']))
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $term = '%' . $filters['search'] . '%';

                $query->where(function ($query) use ($term) {
                    $query->whereHas('user', fn ($user) => $user->withTrashed()
                        ->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term))
                        ->orWhere('model_type', 'like', $term)
                        ->orWhere('ip_address', 'like', $term);
                });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (ActivityLog $log) => [
                ...$log->toAdminArray(),
                'user' => $log->user ? [
                    'id'    => $log->user->id,
                    'name'  => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
            ]);

        return ApiResponse::ok([
            'logs'    => $logs,
            'filters' => $filters,
            'actions' => ActivityLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
