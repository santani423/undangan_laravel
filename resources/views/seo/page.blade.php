{{--
    Crawler renderer (App\Http\Controllers\SeoController): <head> metadata of a
    frontend page for link-preview bots that do not run JavaScript. Humans are
    served the React SPA; this page only carries metadata and a plain link.
--}}
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $seo['title'] }}</title>
        @if($seo['description'] !== '')
            <meta name="description" content="{{ $seo['description'] }}">
        @endif
        <meta name="robots" content="{{ $seo['robots'] }}">
        @if($seo['canonical'])
            <link rel="canonical" href="{{ $seo['canonical'] }}">
        @endif
        @foreach($seo['meta'] as [$attribute, $key, $content])
            <meta {{ $attribute === 'name' ? 'name' : 'property' }}="{{ $key }}" content="{{ $content }}">
        @endforeach
        @if($seo['icon'])
            <link rel="icon" href="{{ $seo['icon'] }}" type="image/png" sizes="192x192">
        @else
            <link rel="icon" href="{{ $siteUrl }}/favicon.ico" sizes="16x16 32x32 48x48">
            <link rel="icon" href="{{ $siteUrl }}/favicon-192x192.png" type="image/png" sizes="192x192">
            <link rel="icon" href="{{ $siteUrl }}/favicon.svg" type="image/svg+xml">
        @endif
        <link rel="apple-touch-icon" href="{{ $siteUrl }}/apple-touch-icon.png">
        <meta name="theme-color" content="#f43f5e">
        @if($seo['jsonLd'])
            <script type="application/ld+json">{!! json_encode($seo['jsonLd'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @endif
    </head>
    <body>
        <h1>{{ $seo['title'] }}</h1>
        @if($seo['description'] !== '')
            <p>{{ $seo['description'] }}</p>
        @endif
        <p><a href="{{ $url }}">{{ $url }}</a></p>
    </body>
</html>
