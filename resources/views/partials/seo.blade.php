{{--
    Server-rendered SEO tags for the public marketing pages. These are plain
    (non-`inertia`) tags so crawlers get them in the raw HTML whether or not
    SSR is running, and Inertia's client-side <Head> never duplicates them.

    Expects: $seo (config('seo.home') / config('seo.themes')), $page.
--}}
@php
    $siteName = config('seo.site_name');
    $siteUrl = config('seo.site_url');
    // Always the production host, never the query string: /themes?event_type=x → /themes.
    $path = request()->path();
    $canonical = $siteUrl . '/' . ($path === '/' ? '' : $path);
    $ogImage = $siteUrl . '/' . config('seo.og_image.path');
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

@if(($page['component'] ?? null) === 'welcome')
    @php
        $contact = $page['props']['contact'] ?? [];
        $home = $siteUrl . '/';
        $organization = array_filter([
            '@type' => 'Organization',
            '@id'   => $home . '#organization',
            'name'  => $siteName,
            'url'   => $home,
            'logo'  => [
                '@type'  => 'ImageObject',
                'url'    => $siteUrl . '/' . config('seo.logo'),
                'width'  => 512,
                'height' => 512,
            ],
            'email' => $contact['email'] ?? null,
            'contactPoint' => empty($contact['whatsapp']) ? null : array_filter([
                '@type'             => 'ContactPoint',
                'contactType'       => 'customer service',
                'telephone'         => $contact['whatsapp'],
                'email'             => $contact['email'] ?? null,
                'availableLanguage' => ['Indonesian'],
            ]),
        ]);
        $jsonLd = [
            '@context' => 'https://schema.org',
            '@graph'   => [
                $organization,
                [
                    '@type'         => 'WebSite',
                    '@id'           => $home . '#website',
                    'url'           => $home,
                    'name'          => $siteName,
                    // Google site names: the preferred name plus the bare domain as fallback.
                    'alternateName' => [parse_url($siteUrl, PHP_URL_HOST)],
                    'inLanguage'    => 'id-ID',
                    'publisher'     => ['@id' => $home . '#organization'],
                ],
                [
                    '@type'              => 'WebPage',
                    '@id'                => $home . '#webpage',
                    'url'                => $home,
                    'name'               => $seo['title'],
                    'description'        => $seo['description'],
                    'inLanguage'         => 'id-ID',
                    'isPartOf'           => ['@id' => $home . '#website'],
                    'about'              => ['@id' => $home . '#organization'],
                    'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $ogImage],
                ],
                [
                    '@type'       => 'Service',
                    '@id'         => $home . '#service',
                    'name'        => 'Undangan Digital Online',
                    'serviceType' => 'Undangan Digital',
                    'description' => $seo['description'],
                    'url'         => $home,
                    'provider'    => ['@id' => $home . '#organization'],
                    'areaServed'  => ['@type' => 'Country', 'name' => 'Indonesia'],
                ],
            ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
@endif
