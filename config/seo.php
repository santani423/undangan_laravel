<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public site identity
    |--------------------------------------------------------------------------
    |
    | Canonical URLs, Open Graph and JSON-LD are built from site_url instead of
    | APP_URL, so a misconfigured APP_URL (e.g. http://localhost) can never leak
    | a development domain into production metadata. No trailing slash.
    |
    */

    'site_name' => env('SEO_SITE_NAME', 'Undesia'),

    'site_url' => rtrim(env('SEO_SITE_URL', 'https://undesia.com'), '/'),

    'locale' => 'id_ID',

    'og_image' => [
        'path'   => 'images/brand/og-image.png',
        'width'  => 1200,
        'height' => 630,
        'alt'    => 'Logo Undesia — Undangan Digital Indonesia',
    ],

    'logo' => 'images/brand/undesia-icon.png',

    /*
    |--------------------------------------------------------------------------
    | Landing page (route "home")
    |--------------------------------------------------------------------------
    */

    'home' => [
        'title'       => 'Undangan Digital Online Modern & Eksklusif | Undesia',
        'description' => 'Buat undangan digital online untuk pernikahan, ulang tahun, khitanan, aqiqah & syukuran. Pilih tema elegan dengan RSVP, buku tamu, dan amplop digital.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme catalogue (route "themes.index")
    |--------------------------------------------------------------------------
    */

    'themes' => [
        'title'       => 'Semua Tema Undangan - Undesia',
        'description' => 'Jelajahi koleksi tema undangan digital Undesia untuk pernikahan, ulang tahun, khitanan, aqiqah, dan acara lainnya. Lihat contoh undangannya sebelum membuat.',
    ],

];
