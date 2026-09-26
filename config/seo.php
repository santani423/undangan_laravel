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
    | www.undesia.com is the host Google already indexes; public/.htaccess
    | 301-redirects the bare domain to it.
    |
    */

    'site_name' => env('SEO_SITE_NAME', 'Undesia'),

    'site_url' => rtrim(env('SEO_SITE_URL', 'https://www.undesia.com'), '/'),

    'locale' => 'id_ID',

    'og_image' => [
        'path'   => 'images/brand/og-image.png',
        'width'  => 1200,
        'height' => 630,
        'alt'    => 'Logo Undesia — Undangan Pernikahan Digital',
    ],

    'logo' => 'images/brand/undesia-icon.png',

    /*
    |--------------------------------------------------------------------------
    | Organization (JSON-LD)
    |--------------------------------------------------------------------------
    |
    | Only profiles that exist in the product itself (landing footer). Email
    | and WhatsApp come from the admin-managed contact settings at runtime.
    |
    */

    'organization' => [
        'description' => 'Undesia adalah platform undangan digital untuk pernikahan dan acara keluarga di Indonesia, lengkap dengan RSVP, buku tamu, dan amplop digital.',
        'same_as'     => [
            'https://www.instagram.com/undesia_id/',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Indexable public pages, keyed by Inertia component
    |--------------------------------------------------------------------------
    |
    | breadcrumbs: [name => path] trail rendered both visibly on the page and
    | as BreadcrumbList JSON-LD — only list pages that have a visible trail.
    |
    */

    'pages' => [
        'welcome' => [
            'title'       => 'Undesia - Undangan Pernikahan Digital',
            'description' => 'Undesia adalah platform undangan pernikahan digital. Buat undangan online dengan tema elegan, RSVP, buku tamu, dan amplop digital, lalu bagikan lewat WhatsApp.',
        ],

        'wedding/index' => [
            'title'       => 'Undangan Pernikahan Digital - Undesia',
            'description' => 'Buat undangan pernikahan digital di Undesia: pilih tema, isi data mempelai dan acara, lalu bagikan ke tamu lengkap dengan RSVP, buku tamu, dan amplop digital.',
            'breadcrumbs' => [
                'Beranda'             => '/',
                'Undangan Pernikahan' => '/undangan/pernikahan',
            ],
        ],

        'themes/index' => [
            'title'       => 'Semua Tema Undangan - Undesia',
            'description' => 'Jelajahi koleksi tema undangan digital Undesia untuk pernikahan, ulang tahun, khitanan, aqiqah, dan acara lainnya. Lihat contoh undangannya sebelum membuat.',
        ],
    ],

];
