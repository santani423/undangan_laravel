<!DOCTYPE html>
{{-- The whole product is Indonesian-only; APP_LOCALE stays "en" for framework fallbacks. --}}
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $isInvitation = ($page['component'] ?? null) === 'invitation/show';
            // Public marketing pages that get full server-rendered SEO tags (partials.seo).
            $seo = match ($page['component'] ?? null) {
                'welcome'      => config('seo.home'),
                'themes/index' => config('seo.themes'),
                default        => null,
            };
            $inv = $isInvitation ? ($page['props']['invitation'] ?? []) : [];
            $ogTitle = $inv['pageTitle'] ?? $inv['title'] ?? config('app.name', 'Undesia Digital Invitation');
            $ogDescription = $inv['ogDescription'] ?? 'Anda diundang! Silakan buka undangan digital ini untuk info lengkap acara.';
            $ogImage = $inv['ogImage'] ?? null;
            $ogUrl = $inv['ogUrl'] ?? url()->current();
            // ?v=<content hash> busts the browser's long-lived favicon cache whenever the file changes,
            // while staying stable across deploys (mtime changes on every checkout, which would keep
            // handing Googlebot a "new" favicon URL).
            $iconUrl = fn (string $file) => asset($file) . '?v=' . substr(@md5_file(public_path($file)) ?: '1', 0, 8);
        @endphp

        <title inertia>{{ $isInvitation ? $ogTitle : ($seo['title'] ?? config('seo.site_name')) }}</title>

        @if($seo)
            @include('partials.seo', ['seo' => $seo])
        @endif

        @if($isInvitation)
            <meta name="description" content="{{ $ogDescription }}">

            <meta property="og:type" content="website">
            <meta property="og:site_name" content="{{ config('app.name', 'Undesia Digital Invitation') }}">
            <meta property="og:title" content="{{ $ogTitle }}">
            <meta property="og:description" content="{{ $ogDescription }}">
            <meta property="og:url" content="{{ $ogUrl }}">
            @if($ogImage)
                <meta property="og:image" content="{{ $ogImage }}">
                <meta property="og:image:secure_url" content="{{ $ogImage }}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="1200">
            @endif

            <meta name="twitter:card" content="{{ $ogImage ? 'summary_large_image' : 'summary' }}">
            <meta name="twitter:title" content="{{ $ogTitle }}">
            <meta name="twitter:description" content="{{ $ogDescription }}">
            @if($ogImage)
                <meta name="twitter:image" content="{{ $ogImage }}">
            @endif

            <link rel="icon" href="{{ $ogImage ?: $iconUrl('favicon.png') }}">
        @else
            {{-- Google Search favicon: square, multiple of 48px, crawlable, declared in the raw HTML. --}}
            <link rel="icon" href="{{ $iconUrl('favicon.ico') }}" sizes="16x16 32x32 48x48">
            <link rel="icon" href="{{ $iconUrl('favicon-48x48.png') }}" type="image/png" sizes="48x48">
            <link rel="icon" href="{{ $iconUrl('favicon-96x96.png') }}" type="image/png" sizes="96x96">
            <link rel="icon" href="{{ $iconUrl('favicon-144x144.png') }}" type="image/png" sizes="144x144">
            <link rel="icon" href="{{ $iconUrl('favicon-192x192.png') }}" type="image/png" sizes="192x192">
            <link rel="icon" href="{{ $iconUrl('favicon.svg') }}" type="image/svg+xml">
        @endif
        <link rel="apple-touch-icon" href="{{ $iconUrl('apple-touch-icon.png') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
