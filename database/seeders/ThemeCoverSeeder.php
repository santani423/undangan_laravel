<?php

namespace Database\Seeders;

use App\Services\ThemeCoverService;
use Illuminate\Database\Seeder;

class ThemeCoverSeeder extends Seeder
{
    /**
     * Gives every seeded theme an illustrated cover (see ThemeCoverService).
     * Runs after the theme seeders so placeholder themes are covered too.
     */
    public function run(ThemeCoverService $covers): void
    {
        $covers->syncAll();
    }
}
