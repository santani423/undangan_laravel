<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $isInvitation = ($page['component'] ?? null) === 'invitation/show';
            $inv = $isInvitation ? ($page['props']['invitation'] ?? []) : [];
            $ogTitle = $inv['pageTitle'] ?? $inv['title'] ?? config('app.name', 'Undesia Digital Invitation');
            $ogDescription = $inv['ogDescription'] ?? 'Anda diundang! Silakan buka undangan digital ini untuk info lengkap acara.';
            $ogImage = $inv['ogImage'] ?? null;
            $ogUrl = $inv['ogUrl'] ?? url()->current();
            // ?v=<mtime> busts the browser's long-lived favicon cache whenever the file changes.
            $iconUrl = fn (string $file) => asset($file) . '?v=' . (@filemtime(public_path($file)) ?: '1');
        @endphp

        <title inertia>{{ $isInvitation ? $ogTitle : config('app.name', 'Laravel') }}</title>

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
            <link rel="icon" href="{{ $iconUrl('favicon.ico') }}" sizes="48x48">
            <link rel="icon" href="{{ $iconUrl('favicon.png') }}" type="image/png" sizes="64x64">
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
