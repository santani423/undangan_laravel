<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\EventType;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $themeCounts = Theme::query()
            ->selectRaw('event_type, count(*) as aggregate')
            ->groupBy('event_type')
            ->pluck('aggregate', 'event_type');

        $eventTypes = EventType::withCount('invitations')
            ->orderBy('name')
            ->get()
            ->map(function (EventType $eventType) use ($themeCounts) {
                return [
                    'id'                => $eventType->id,
                    'name'              => $eventType->name,
                    'label'             => $eventType->label,
                    'description'       => $eventType->description,
                    'icon_path'         => $eventType->icon_path,
                    'is_active'         => $eventType->is_active,
                    'theme_count'       => (int) ($themeCounts[$eventType->name] ?? 0),
                    'invitations_count' => $eventType->invitations_count,
                    'created_at'        => $eventType->created_at?->format('Y-m-d') ?? '',
                ];
            });

        return ApiResponse::ok([
            'eventTypes' => $eventTypes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|alpha_dash|unique:event_types,name',
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string',
            'icon_path'   => 'nullable|string|max:255',
            'is_active'   => 'boolean',
        ]);

        $data['is_active'] = $data['is_active'] ?? true;

        EventType::create($data);

        return ApiResponse::message("Jenis acara \"{$data['label']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, EventType $eventType): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('event_types', 'name')->ignore($eventType->id)],
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string',
            'icon_path'   => 'nullable|string|max:255',
            'is_active'   => 'boolean',
        ]);

        $eventType->update($data);

        return ApiResponse::message("Jenis acara \"{$eventType->label}\" berhasil diperbarui.");
    }

    public function toggle(EventType $eventType): JsonResponse
    {
        $eventType->update(['is_active' => ! $eventType->is_active]);
        $label = $eventType->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return ApiResponse::message("Jenis acara \"{$eventType->label}\" berhasil {$label}. Tema dengan jenis acara ini " . ($eventType->is_active ? 'kembali bisa' : 'tidak bisa') . ' dipesan.');
    }

    public function destroy(EventType $eventType): JsonResponse
    {
        if ($eventType->invitations()->exists()) {
            return ApiResponse::error("Jenis acara \"{$eventType->label}\" tidak bisa dihapus karena masih dipakai oleh undangan yang sudah dibuat. Nonaktifkan saja untuk menyembunyikannya.");
        }

        $label = $eventType->label;
        $eventType->delete();

        return ApiResponse::message("Jenis acara \"{$label}\" berhasil dihapus.");
    }
}
