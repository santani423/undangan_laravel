<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Theme;
use App\Services\LandingPageService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private readonly LandingPageService $landing)
    {
    }

    public function index(): Response
    {
        return Inertia::render('welcome', [
            'appName'      => AppSetting::get('app_name', config('app.name', 'Undesia')),
            'appTagline'   => AppSetting::get('app_tagline', 'Undangan Digital Modern & Eksklusif'),
            'seoTitle'     => config('seo.pages.welcome.title'),
            'features'     => $this->landing->topFeatures(),
            'packagesByType' => $this->landing->packagesByType(),
            'themeSamples' => $this->landing->themeSamples(),
            'testimonials' => $this->landing->testimonials(),
            'stats'        => $this->landing->stats(),
            'contact'      => $this->landing->contact(),
        ]);
    }

    /**
     * GET /undangan/pernikahan — public product page for wedding invitations.
     * Two segments on purpose: single-segment paths like /undangan or
     * /undangan-pernikahan are default customer invitation slugs
     * (InvitationSlugService) and would shadow those invitations.
     */
    public function wedding(): Response
    {
        $packages = collect($this->landing->packagesByType())->firstWhere('event_type', 'wedding');

        return Inertia::render('wedding/index', [
            'appName'        => AppSetting::get('app_name', config('app.name', 'Undesia')),
            'seoTitle'       => config('seo.pages.wedding/index.title'),
            'features'       => $this->landing->topFeatures(),
            'packagesByType' => $packages ? [$packages] : [],
            'themeSamples'   => collect($this->landing->themeSamples())->where('event_type', 'wedding')->values()->all(),
            'themeCount'     => Theme::active()->where('event_type', 'wedding')->count(),
            'contact'        => $this->landing->contact(),
        ]);
    }
}
