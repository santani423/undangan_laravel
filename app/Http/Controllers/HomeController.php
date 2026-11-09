<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\AppSetting;
use App\Models\Theme;
use App\Services\LandingPageService;
use App\Services\SeoService;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function __construct(private readonly LandingPageService $landing, private readonly SeoService $seo)
    {
    }

    /** GET /api/v1/landing — data for the landing page (/). */
    public function index(): JsonResponse
    {
        return ApiResponse::ok([
            'appName'      => AppSetting::get('app_name', config('app.name', 'Undesia')),
            'appTagline'   => AppSetting::get('app_tagline', 'Undangan Digital Modern & Eksklusif'),
            'seoTitle'     => config('seo.pages.welcome.title'),
            'features'     => $this->landing->topFeatures(),
            'packagesByType' => $this->landing->packagesByType(),
            'themeSamples' => $this->landing->themeSamples(),
            'testimonials' => $this->landing->testimonials(),
            'stats'        => $this->landing->stats(),
            'contact'      => $contact = $this->landing->contact(),
            // Rendered into <head> by the SPA (was server-side <x-seo>).
            'seo'          => $this->seo->page('welcome', $contact),
        ]);
    }

    /**
     * GET /api/v1/landing/wedding — data for the wedding product page
     * (/undangan/pernikahan). Two segments on purpose in the SPA: single-segment
     * paths like /undangan or /undangan-pernikahan are default customer
     * invitation slugs (InvitationSlugService) and would shadow those invitations.
     */
    public function wedding(): JsonResponse
    {
        $packages = collect($this->landing->packagesByType())->firstWhere('event_type', 'wedding');

        return ApiResponse::ok([
            'appName'        => AppSetting::get('app_name', config('app.name', 'Undesia')),
            'seoTitle'       => config('seo.pages.wedding/index.title'),
            'features'       => $this->landing->topFeatures(),
            'packagesByType' => $packages ? [$packages] : [],
            'themeSamples'   => collect($this->landing->themeSamples())->where('event_type', 'wedding')->values()->all(),
            'themeCount'     => Theme::active()->where('event_type', 'wedding')->count(),
            'contact'        => $this->landing->contact(),
            'seo'            => $this->seo->page('wedding/index'),
        ]);
    }
}
