<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS)
|--------------------------------------------------------------------------
|
| The React frontend runs on its own origin (FRONTEND_URL, e.g.
| https://undesia.com) and talks to this API (e.g. https://api.undesia.com)
| with credentials (Sanctum SPA session cookie + XSRF token), so origins
| must be listed explicitly — "*" is not allowed together with credentials.
|
| CORS_ALLOWED_ORIGINS: comma-separated list; defaults to FRONTEND_URL.
|
*/

$origins = array_values(array_filter(array_map(
    fn (string $origin) => rtrim(trim($origin), '/'),
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', env('APP_URL', 'http://localhost'))))
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 7200,

    'supports_credentials' => true,

];
