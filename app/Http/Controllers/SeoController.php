<?php

namespace App\Http\Controllers;

use App\Models\Theme;
use App\Services\InvitationViewerService;
use App\Services\LandingPageService;
use App\Services\SeoService;
use App\Support\FrontendUrl;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * GET /seo/{path} — server-rendered <head> for a frontend path, for crawlers
 * that do not execute JavaScript (WhatsApp, Facebook, Telegram, X, LinkedIn,
 * Slack, Discord…). The frontend web server forwards those user agents here
 * (docs/DEPLOYMENT.md); humans always get the SPA.
 *
 * This is the only HTML Laravel still produces for the public site, and it
 * contains metadata only — no application UI.
 */
class SeoController extends Controller
{
    /** First path segments that belong to the application, never to an invitation code. */
    private const APP_SEGMENTS = [
        'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'confirm-password',
        'dashboard', 'customer', 'admin', 'settings', 'themes', 'undangan', 'preview',
    ];

    public function __construct(
        private readonly SeoService $seo,
        private readonly InvitationViewerService $viewer,
        private readonly LandingPageService $landing,
    ) {
    }

    public function __invoke(Request $request, ?string $path = null): Response
    {
        $path = trim((string) $path, '/');
        $query = $request->getQueryString();
        $url = FrontendUrl::to('/'.$path).($query ? '?'.$query : '');
        $status = 200;

        try {
            $seo = $this->resolve($request, $path);
        } catch (HttpExceptionInterface $e) {
            // Missing / expired invitation: same status the viewer answers with.
            $status = $e->getStatusCode();
            $seo = $this->seo->noindex();
        } catch (ModelNotFoundException) {
            $status = 404;
            $seo = $this->seo->noindex();
        }

        return response()
            ->view('seo.page', ['seo' => $seo, 'url' => $url, 'siteUrl' => FrontendUrl::base()], $status)
            ->header('X-Robots-Tag', $seo['robots']);
    }

    private function resolve(Request $request, string $path): array
    {
        if ($path === '') {
            return $this->seo->page('welcome', $this->landing->contact());
        }

        if ($path === 'undangan/pernikahan') {
            return $this->seo->page('wedding/index');
        }

        if ($path === 'themes') {
            return $this->seo->page('themes/index');
        }

        if (preg_match('#^themes/([A-Za-z0-9_-]+)/sample$#', $path, $m)) {
            $theme = Theme::where('slug', $m[1])->firstOrFail();
            $invitation = $this->viewer->findSample($theme);
            abort_if(! $invitation, 404);

            return $this->seo->invitation($this->viewer->viewerProps($request, $invitation, null, '/'.$path)['invitation']);
        }

        $segments = explode('/', $path);

        if (in_array($segments[0], self::APP_SEGMENTS, true)) {
            return $this->seo->noindex();
        }

        // /{code} or /{code}/{visitor}
        if (preg_match('#^([A-Za-z0-9_-]+)(?:/([A-Za-z0-9_-]+))?$#', $path, $m)) {
            $invitation = $this->viewer->findByCode($m[1]);

            return $this->seo->invitation(
                $this->viewer->viewerProps($request, $invitation, $m[2] ?? null, '/'.$path)['invitation']
            );
        }

        return $this->seo->noindex();
    }
}
