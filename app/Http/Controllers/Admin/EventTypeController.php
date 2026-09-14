<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventTypeController extends Controller
{
    public function index(): Response
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

        return Inertia::render('admin/event-types/index', [
            'eventTypes' => $eventTypes,
            'flash'      => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
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

        return back()->with('success', "Jenis acara \"{$data['label']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, EventType $eventType): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('event_types', 'name')->ignore($eventType->id)],
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string',
            'icon_path'   => 'nullable|string|max:255',
            'is_active'   => 'boolean',
        ]);

        $eventType->update($data);

        return back()->with('success', "Jenis acara \"{$eventType->label}\" berhasil diperbarui.");
    }

    public function toggle(EventType $eventType): RedirectResponse
    {
        $eventType->update(['is_active' => ! $eventType->is_active]);
        $label = $eventType->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Jenis acara \"{$eventType->label}\" berhasil {$label}. Tema dengan jenis acara ini " . ($eventType->is_active ? 'kembali bisa' : 'tidak bisa') . ' dipesan.');
    }

    public function destroy(EventType $eventType): RedirectResponse
    {
        if ($eventType->invitations()->exists()) {
            return back()->with('error', "Jenis acara \"{$eventType->label}\" tidak bisa dihapus karena masih dipakai oleh undangan yang sudah dibuat. Nonaktifkan saja untuk menyembunyikannya.");
        }

        $label = $eventType->label;
        $eventType->delete();

        return back()->with('success', "Jenis acara \"{$label}\" berhasil dihapus.");
    }
}
