<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
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
            'features'     => $this->landing->topFeatures(),
            'packageTiers' => $this->landing->packageTiers(),
            'themeSamples' => $this->landing->themeSamples(),
            'testimonials' => $this->landing->testimonials(),
            'stats'        => $this->landing->stats(),
            'contact'      => $this->landing->contact(),
        ]);
    }
}
