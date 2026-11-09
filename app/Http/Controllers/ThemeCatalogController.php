<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Theme;
use App\Services\SeoService;
use App\Support\PublicAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /api/v1/themes — public theme catalog (/themes page).
 * Moved verbatim from the closure that used to live in routes/web.php.
 */
class ThemeCatalogController extends Controller
{
    public function index(Request $request, SeoService $seo): JsonResponse
    {
        $themes = Theme::where('is_active', true)
            ->withExists('sampleInvitation')
            ->ordered()
            ->get()
            ->map(fn (Theme $t) => [
                'id'              => $t->id,
                'name'            => $t->name,
                'slug'            => $t->slug,
                'category'        => $t->category,
                'event_type'      => $t->event_type,
                'thumbnail'       => PublicAsset::url($t->thumbnail_url) ?? '',
                'color_primary'   => $t->color_primary,
                'color_secondary' => $t->color_secondary,
                'is_premium'      => $t->is_premium,
                'is_exclusive'    => $t->is_exclusive,
                'usage_count'     => $t->usage_count,
                'tags'            => $t->tags ?? [],
                'sample_url'      => $t->sampleUrl($t->sample_invitation_exists),
            ]);

        return ApiResponse::ok([
            'themes'     => $themes,
            // Pre-selects the event filter, e.g. when coming from a landing showcase tab.
            'event_type' => $request->string('event_type')->toString(),
            'seo'        => $seo->page('themes/index'),
        ]);
    }
}
