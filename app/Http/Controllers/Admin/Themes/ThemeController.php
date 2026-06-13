<?php

namespace App\Http\Controllers\Admin\Themes;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function index(): Response
    {
        $themes = Theme::orderByDesc('created_at')->get()->map(function (Theme $t) {
            return [
                'id'              => $t->id,
                'name'            => $t->name,
                'slug'            => $t->slug,
                'category'        => $t->category,
                'event_type'      => $t->event_type,
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

        Theme::create($data);

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

        $theme->update($data);

        return back()->with('success', "Template \"{$theme->name}\" berhasil diperbarui.");
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
        $theme->delete();

        return back()->with('success', "Template \"{$name}\" berhasil dihapus.");
    }
}
