<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * GET /sitemap.xml — only indexable public pages (config('seo.pages')'s
     * routes). Auth, dashboards, admin and guest invitations are noindex and
     * deliberately left out. Served by Laravel rather than a static file so it
     * ships with the app code on every deploy.
     */
    public function __invoke(): Response
    {
        $base = config('seo.site_url');

        $urls = [
            ['loc' => $base . '/', 'priority' => '1.0'],
            ['loc' => $base . '/undangan/pernikahan', 'priority' => '0.9'],
            ['loc' => $base . '/themes', 'priority' => '0.8'],
        ];

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
