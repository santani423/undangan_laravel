<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('themes:covers {--force : Replace every thumbnail_url, including working custom ones}', function (App\Services\ThemeCoverService $covers) {
    $result = $covers->syncAll((bool) $this->option('force'));

    $this->info("Generated {$result['written']} theme covers in public/" . App\Services\ThemeCoverService::PUBLIC_DIR . "; linked {$result['linked']} thumbnail_url(s).");
})->purpose('Generate illustrated SVG cover images for every theme');
