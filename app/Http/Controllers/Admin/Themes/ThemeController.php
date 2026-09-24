<?php

namespace App\Http\Controllers\Admin\Themes;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function index(): Response
    {
        // Grouped per invitation type, each group in its admin-defined order.
        $themes = Theme::orderBy('event_type')->ordered()->get()->map(function (Theme $t) {
            return [
                'id'              => $t->id,
                'name'            => $t->name,
                'slug'            => $t->slug,
                'category'        => $t->category,
                'event_type'      => $t->event_type,
                'sort_order'      => $t->sort_order,
                'thumbnail'       => $t->thumbnail_url ?? '',
                'color_primary'   => $t->color_primary,
                'color_secondary' => $t->color_secondary,
                'is_active'       => $t->is_active,
                'is_premium'      => $t->is_premium,
                'is_exclusive'    => $t->is_exclusive,
                'price'           => $t->price,
                'usage_count'     => $t->usage_count,
                'tags'            => $t->tags ?? [],
                'created_at'      => $t->created_at?->format('Y-m-d') ?? '',
            ];
        });

        return Inertia::render('admin/themes/index', [
            'themes' => $themes,
            'flash'  => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255|unique:themes,name',
            'category'        => 'required|string|max:100',
            'event_type'      => 'required|string|max:100',
            'color_primary'   => 'required|string|max:20',
            'color_secondary' => 'required|string|max:20',
            'is_active'       => 'boolean',
            'is_premium'      => 'boolean',
            'is_exclusive'    => 'boolean',
            'price'           => 'integer|min:0',
            'tags'            => 'nullable|array',
            'tags.*'          => 'string|max:50',
        ]);

        $data['slug']               = Str::slug($data['name']);
        $data['is_premium']         = $data['is_premium']   ?? false;
        $data['is_exclusive']       = $data['is_exclusive'] ?? false;
        $data['is_active']          = $data['is_active']    ?? true;
        $data['price']              = $data['price']        ?? 0;
        $data['created_by_user_id'] = auth()->id();

        // sort_order is appended to the end of this invitation type by Theme::booted().
        DB::transaction(fn () => Theme::create($data));

        return back()->with('success', "Template \"{$data['name']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, Theme $theme): RedirectResponse
    {
        $data = $request->validate([
            'name'            => "required|string|max:255|unique:themes,name,{$theme->id}",
            'category'        => 'required|string|max:100',
            'event_type'      => 'required|string|max:100',
            'color_primary'   => 'required|string|max:20',
            'color_secondary' => 'required|string|max:20',
            'is_active'       => 'boolean',
            'is_premium'      => 'boolean',
            'is_exclusive'    => 'boolean',
            'price'           => 'integer|min:0',
            'tags'            => 'nullable|array',
            'tags.*'          => 'string|max:50',
        ]);

        if ($data['name'] !== $theme->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Changing event_type moves it to the end of the new type (see Theme::booted()).
        DB::transaction(fn () => $theme->update($data));

        return back()->with('success', "Template \"{$theme->name}\" berhasil diperbarui.");
    }

    /**
     * Persist a drag-and-drop order for one invitation type. Called via fetch
     * from the admin page, so it answers JSON instead of redirecting.
     */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_type' => 'required|string|max:100',
            'ids'        => 'required|array|min:1',
            'ids.*'      => 'required|integer|distinct',
        ]);

        Theme::reorder($data['event_type'], $data['ids']);

        return response()->json([
            'message' => 'Urutan template berhasil disimpan.',
            'order'   => Theme::where('event_type', $data['event_type'])->ordered()->pluck('sort_order', 'id'),
        ]);
    }

    public function toggle(Theme $theme): RedirectResponse
    {
        $theme->update(['is_active' => ! $theme->is_active]);
        $label = $theme->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Template \"{$theme->name}\" berhasil {$label}.");
    }

    public function destroy(Theme $theme): RedirectResponse
    {
        $name = $theme->name;
        // Remaining themes of the type are resequenced by Theme::booted().
        DB::transaction(fn () => $theme->delete());

        return back()->with('success', "Template \"{$name}\" berhasil dihapus.");
    }
}
