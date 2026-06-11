<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = Package::orderBy('display_order')
            ->get()
            ->map(fn (Package $pkg) => [
                'id'                  => $pkg->id,
                'name'                => $pkg->name,
                'label'               => $pkg->label,
                'description'         => $pkg->description ?? '',
                'price'               => (float) $pkg->price,
                'currency'            => $pkg->currency,
                'billing_period'      => $pkg->billing_period,
                'duration_days'       => (int) $pkg->duration_days,
                'trial_days'          => (int) $pkg->trial_days,
                'max_gallery_uploads' => (int) $pkg->max_gallery_uploads,
                'is_active'           => (bool) $pkg->is_active,
                'display_order'       => (int) $pkg->display_order,
            ]);

        // Route settings/packages renders a different view
        $view = str_starts_with($request->route()->getName() ?? '', 'settings.')
            ? 'settings/packages'
            : 'admin/settings/packages';

        return Inertia::render($view, [
            'packages' => $packages,
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'label'               => ['required', 'string', 'max:100'],
            'description'         => ['nullable', 'string', 'max:1000'],
            'price'               => ['required', 'numeric', 'min:0'],
            'billing_period'      => ['required', Rule::in(['month', 'year', 'once'])],
            'duration_days'       => ['required', 'integer', 'min:1', 'max:3650'],
            'trial_days'          => ['required', 'integer', 'min:0', 'max:365'],
            'max_gallery_uploads' => ['required', 'integer', 'min:0'],
            'is_active'           => ['required', 'boolean'],
            'display_order'       => ['required', 'integer', 'min:0'],
        ]);

        $package->update($validated);

        $back = str_starts_with($request->route()->getName() ?? '', 'settings.')
            ? 'settings.packages'
            : 'admin.settings.packages';

        return redirect()->route($back)
            ->with('success', "Paket \"{$package->label}\" berhasil diperbarui.");
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'                => ['required', 'string', 'max:100', 'unique:packages,name', 'regex:/^[a-z0-9_]+$/'],
            'label'               => ['required', 'string', 'max:100'],
            'description'         => ['nullable', 'string', 'max:1000'],
            'price'               => ['required', 'numeric', 'min:0'],
            'billing_period'      => ['required', Rule::in(['month', 'year', 'once'])],
            'duration_days'       => ['required', 'integer', 'min:1', 'max:3650'],
            'trial_days'          => ['required', 'integer', 'min:0', 'max:365'],
            'max_gallery_uploads' => ['required', 'integer', 'min:0'],
            'is_active'           => ['required', 'boolean'],
            'display_order'       => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['display_order'] ??= Package::max('display_order') + 1;

        $package = Package::create($validated);

        $back = str_starts_with($request->route()->getName() ?? '', 'settings.')
            ? 'settings.packages'
            : 'admin.settings.packages';

        return redirect()->route($back)
            ->with('success', "Paket \"{$package->label}\" berhasil ditambahkan.");
    }

    public function destroy(Request $request, Package $package): RedirectResponse
    {
        $label = $package->label;
        $package->delete();

        $back = str_starts_with($request->route()->getName() ?? '', 'settings.')
            ? 'settings.packages'
            : 'admin.settings.packages';

        return redirect()->route($back)
            ->with('success', "Paket \"{$label}\" berhasil dihapus.");
    }
}
