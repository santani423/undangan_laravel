{{--
    Server-rendered SEO tags for indexable public pages (config('seo.pages')).
    Plain (non-`inertia`) tags, so crawlers get them in the raw HTML whether or
    not SSR is running, and Inertia's client-side <Head> never duplicates them.
--}}
@props([
    'seo',              // one entry of config('seo.pages')
    'component',        // Inertia component name, e.g. 'welcome'
    'contact' => [],    // LandingPageService::contact() when the page has it
])

@php
    $siteName = config('seo.site_name');
    $siteUrl = config('seo.site_url');
    $home = $siteUrl . '/';
    $abs = fn (string $path) => $siteUrl . '/' . ltrim($path, '/');

    // Always the production host and never the query string: /themes?event_type=x → /themes.
    $canonical = $abs(request()->path() === '/' ? '' : request()->path());
    $ogImage = $abs(config('seo.og_image.path'));
    $breadcrumbs = $seo['breadcrumbs'] ?? [];

    $webPage = [
        '@type'              => $component === 'themes/index' ? 'CollectionPage' : 'WebPage',
        '@id'                => $canonical . '#webpage',
        'url'                => $canonical,
        'name'               => $seo['title'],
        'description'        => $seo['description'],
        'inLanguage'         => 'id-ID',
        'isPartOf'           => ['@id' => $home . '#website'],
        'about'              => ['@id' => $home . '#organization'],
        'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $ogImage],
    ];

    $graph = [];

    if ($component === 'welcome') {
        $graph[] = array_filter([
            '@type'       => 'Organization',
            '@id'         => $home . '#organization',
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
            '@id'           => $home . '#website',
            'url'           => $home,
            'name'          => $siteName,
            // Google site names: the preferred name plus the bare domain as fallback.
            'alternateName' => ['undesia.com'],
            'inLanguage'    => 'id-ID',
            'publisher'     => ['@id' => $home . '#organization'],
        ];
    }

    if ($breadcrumbs) {
        $webPage['breadcrumb'] = ['@id' => $canonical . '#breadcrumb'];
        $graph[] = [
            '@type'           => 'BreadcrumbList',
            '@id'             => $canonical . '#breadcrumb',
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
            '@id'         => $canonical . '#service',
            'name'        => 'Undangan Pernikahan Digital',
            'serviceType' => 'Undangan pernikahan digital',
            'description' => $seo['description'],
            'url'         => $canonical,
            'provider'    => ['@id' => $home . '#organization'],
            'areaServed'  => ['@type' => 'Country', 'name' => 'Indonesia'],
        ];
    }

    array_splice($graph, $component === 'welcome' ? 2 : 0, 0, [$webPage]);
    $jsonLd = ['@context' => 'https://schema.org', '@graph' => $graph];
@endphp

<meta name="description" content="{{ $seo['description'] }}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="{{ $canonical }}">

<meta property="og:type" content="website">
<meta property="og:locale" content="{{ config('seo.locale') }}">
<meta property="og:site_name" content="{{ $siteName }}">
<meta property="og:title" content="{{ $seo['title'] }}">
<meta property="og:description" content="{{ $seo['description'] }}">
<meta property="og:url" content="{{ $canonical }}">
<meta property="og:image" content="{{ $ogImage }}">
<meta property="og:image:secure_url" content="{{ $ogImage }}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="{{ config('seo.og_image.width') }}">
<meta property="og:image:height" content="{{ config('seo.og_image.height') }}">
<meta property="og:image:alt" content="{{ config('seo.og_image.alt') }}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $seo['title'] }}">
<meta name="twitter:description" content="{{ $seo['description'] }}">
<meta name="twitter:image" content="{{ $ogImage }}">
<meta name="twitter:image:alt" content="{{ config('seo.og_image.alt') }}">

<script type="application/ld+json">{!! json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
