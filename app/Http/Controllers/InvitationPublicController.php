<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Theme;
use App\Services\InvitationViewerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public invitation viewer data. The SPA renders the theme; this returns the
 * same props the Inertia page `invitation/show` used to receive.
 */
class InvitationPublicController extends Controller
{
    public function __construct(private readonly InvitationViewerService $viewer)
    {
    }

    /**
     * GET /api/v1/invitations/{code}
     * GET /api/v1/invitations/{code}/visitors/{visitor}
     * (SPA: /{code} and /{code}/{visitor}; ?visitor= / ?tamu= / ?guests= also accepted)
     */
    public function show(Request $request, string $code, ?string $visitor = null): JsonResponse
    {
        $invitation = $this->viewer->findByCode($code);

        $path = '/' . $code . ($visitor !== null ? '/' . $visitor : '');

        return ApiResponse::ok($this->viewer->viewerProps($request, $invitation, $visitor, $path));
    }

    /**
     * GET /api/v1/themes/{theme}/sample — the theme's seeded demo invitation,
     * rendered through the exact same viewer (and theme component) customers get.
     */
    public function sample(Request $request, Theme $theme): JsonResponse
    {
        $invitation = $this->viewer->findSample($theme);

        abort_if(! $invitation, 404, 'Contoh undangan untuk tema ini belum tersedia.');

        return ApiResponse::ok($this->viewer->viewerProps($request, $invitation, null, "/themes/{$theme->slug}/sample"));
    }
}
