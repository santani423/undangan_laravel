<?php

namespace App\Services;

/**
 * SEO / Open Graph metadata of the public pages, as plain data.
 *
 * Ported from the Blade component resources/views/components/seo.blade.php
 * and the invitation block of the old app.blade.php root view. Consumed by:
 *   • the API (landing / wedding / themes responses carry a `seo` key that the
 *     SPA renders into <head>, so Google — which runs JavaScript — sees them);
 *   • SeoController, the crawler renderer that hands link-preview bots
 *     (WhatsApp, Facebook, Telegram…) server-side tags.
 *
 * Shape: [
 *   'title' => string, 'description' => string, 'robots' => string,
 *   'canonical' => ?string, 'meta' => [[name|property, content]...],
 *   'icon' => ?string, 'jsonLd' => ?array,
 * ]
 */
class SeoService
{
    /** Keys of config('seo.pages') (the former Inertia component names). */
    public const PAGES = ['welcome', 'wedding/index', 'themes/index'];

    /** Indexable public page: welcome, wedding/index or themes/index. */
    public function page(string $component, array $contact = []): array
    {
        $seo = config('seo.pages.'.$component);
        abort_if(! $seo, 404);

        $siteName = config('seo.site_name');
        $siteUrl = config('seo.site_url');
        $home = $siteUrl.'/';
        $abs = fn (string $path) => $siteUrl.'/'.ltrim($path, '/');

        $canonical = $abs(match ($component) {
            'welcome'       => '',
            'wedding/index' => 'undangan/pernikahan',
            'themes/index'  => 'themes',
        });
        $ogImage = $abs(config('seo.og_image.path'));
        $breadcrumbs = $seo['breadcrumbs'] ?? [];

        $webPage = [
            '@type'              => $component === 'themes/index' ? 'CollectionPage' : 'WebPage',
            '@id'                => $canonical.'#webpage',
            'url'                => $canonical,
            'name'               => $seo['title'],
            'description'        => $seo['description'],
            'inLanguage'         => 'id-ID',
            'isPartOf'           => ['@id' => $home.'#website'],
            'about'              => ['@id' => $home.'#organization'],
            'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $ogImage],
        ];

        $graph = [];

        if ($component === 'welcome') {
            $graph[] = array_filter([
                '@type'       => 'Organization',
                '@id'         => $home.'#organization',
                'name'        => $siteName,
                'url'         => $home,
                'description' => config('seo.organization.description'),
                'logo'        => [
                    '@type'  => 'ImageObject',
                    'url'    => $abs(config('seo.logo')),
                    'width'  => 512,
                    'height' => 512,
                ],
                'email'        => $contact['email'] ?? null,
                'sameAs'       => config('seo.organization.same_as') ?: null,
                'contactPoint' => empty($contact['whatsapp']) ? null : array_filter([
                    '@type'             => 'ContactPoint',
                    'contactType'       => 'customer service',
                    'telephone'         => $contact['whatsapp'],
                    'email'             => $contact['email'] ?? null,
                    'availableLanguage' => ['Indonesian'],
                ]),
            ]);
            $graph[] = [
                '@type'         => 'WebSite',
                '@id'           => $home.'#website',
                'url'           => $home,
                'name'          => $siteName,
                // Google site names: the preferred name plus the bare domain as fallback.
                'alternateName' => ['undesia.com'],
                'inLanguage'    => 'id-ID',
                'publisher'     => ['@id' => $home.'#organization'],
            ];
        }

        if ($breadcrumbs) {
            $webPage['breadcrumb'] = ['@id' => $canonical.'#breadcrumb'];
            $graph[] = [
                '@type'           => 'BreadcrumbList',
                '@id'             => $canonical.'#breadcrumb',
                'itemListElement' => collect($breadcrumbs)->keys()->map(fn (string $name, int $i) => [
                    '@type'    => 'ListItem',
                    'position' => $i + 1,
                    'name'     => $name,
                    'item'     => $abs($breadcrumbs[$name]),
                ])->all(),
            ];
        }

        if ($component === 'wedding/index') {
            $graph[] = [
                '@type'       => 'Service',
                '@id'         => $canonical.'#service',
                'name'        => 'Undangan Pernikahan Digital',
                'serviceType' => 'Undangan pernikahan digital',
                'description' => $seo['description'],
                'url'         => $canonical,
                'provider'    => ['@id' => $home.'#organization'],
                'areaServed'  => ['@type' => 'Country', 'name' => 'Indonesia'],
            ];
        }

        array_splice($graph, $component === 'welcome' ? 2 : 0, 0, [$webPage]);

        return [
            'title'       => $seo['title'],
            'description' => $seo['description'],
            'robots'      => 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            'canonical'   => $canonical,
            'icon'        => null,
            'meta'        => [
                ['property', 'og:type', 'website'],
                ['property', 'og:locale', config('seo.locale')],
                ['property', 'og:site_name', $siteName],
                ['property', 'og:title', $seo['title']],
                ['property', 'og:description', $seo['description']],
                ['property', 'og:url', $canonical],
                ['property', 'og:image', $ogImage],
                ['property', 'og:image:secure_url', $ogImage],
                ['property', 'og:image:type', 'image/png'],
                ['property', 'og:image:width', (string) config('seo.og_image.width')],
                ['property', 'og:image:height', (string) config('seo.og_image.height')],
                ['property', 'og:image:alt', config('seo.og_image.alt')],
                ['name', 'twitter:card', 'summary_large_image'],
                ['name', 'twitter:title', $seo['title']],
                ['name', 'twitter:description', $seo['description']],
                ['name', 'twitter:image', $ogImage],
                ['name', 'twitter:image:alt', config('seo.og_image.alt')],
            ],
            'jsonLd'      => ['@context' => 'https://schema.org', '@graph' => $graph],
        ];
    }

    /**
     * A guest invitation: shareable via link and Open Graph, but kept out of
     * search results (personal family events with guest names in the URL).
     *
     * @param  array  $inv  the `invitation` prop built by InvitationViewerService
     */
    public function invitation(array $inv): array
    {
        $siteName = config('seo.site_name');
        $title = $inv['pageTitle'] ?? $inv['title'] ?? $siteName;
        $description = $inv['ogDescription'] ?? 'Anda diundang! Silakan buka undangan digital ini untuk info lengkap acara.';
        $ogImage = $inv['ogImage'] ?? null;

        $meta = [
            ['property', 'og:type', 'website'],
            ['property', 'og:site_name', $siteName],
            ['property', 'og:title', $title],
            ['property', 'og:description', $description],
            ['property', 'og:url', $inv['ogUrl'] ?? ''],
        ];

        if ($ogImage) {
            $meta[] = ['property', 'og:image', $ogImage];
            $meta[] = ['property', 'og:image:secure_url', $ogImage];
            if (! empty($inv['ogImageType'])) {
                $meta[] = ['property', 'og:image:type', $inv['ogImageType']];
            }
            if (! empty($inv['ogImageWidth']) && ! empty($inv['ogImageHeight'])) {
                $meta[] = ['property', 'og:image:width', (string) $inv['ogImageWidth']];
                $meta[] = ['property', 'og:image:height', (string) $inv['ogImageHeight']];
            }
            $meta[] = ['property', 'og:image:alt', $title];
        }

        $meta[] = ['name', 'twitter:card', $ogImage ? 'summary_large_image' : 'summary'];
        $meta[] = ['name', 'twitter:title', $title];
        $meta[] = ['name', 'twitter:description', $description];
        if ($ogImage) {
            $meta[] = ['name', 'twitter:image', $ogImage];
        }

        return [
            'title'       => $title,
            'description' => $description,
            'robots'      => 'noindex, follow',
            'canonical'   => null,
            'icon'        => $inv['favicon'] ?? null,
            'meta'        => $meta,
            'jsonLd'      => null,
        ];
    }

    /** Any other path (auth, dashboards, unknown): no search value. */
    public function noindex(?string $title = null): array
    {
        return [
            'title'       => $title ?? config('seo.site_name'),
            'description' => '',
            'robots'      => 'noindex, follow',
            'canonical'   => null,
            'icon'        => null,
            'meta'        => [],
            'jsonLd'      => null,
        ];
    }
}
