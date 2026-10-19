<?php

namespace Database\Seeders;

use App\Models\Theme;
use Database\Seeders\Data\WeddingThemeSampleData;

/**
 * Re-seeds only the demo invitations of wedding_theme_13 … wedding_theme_30
 * from WeddingThemeSampleData, leaving every other sample untouched:
 *
 *   php artisan db:seed --class=WeddingThemeSampleSeeder
 *
 * A full SampleInvitationSeeder run uses the same data, so the two never
 * overwrite each other. Same rule as there: a theme is seeded only once its
 * React renderer exists, so themes still in development don't get a
 * "Lihat Contoh" link to a placeholder page. Re-run after adding a renderer.
 */
class WeddingThemeSampleSeeder extends SampleInvitationSeeder
{
    public function run(): void
    {
        $slugs = WeddingThemeSampleData::slugs();

        $this->seedSamples(fn (Theme $theme) => in_array($theme->slug, $slugs, true));
    }

    protected function report(array $counts, array $skipped): void
    {
        $slugs = WeddingThemeSampleData::slugs();

        $this->command?->info('WeddingThemeSampleSeeder: '.($counts['wedding'] ?? 0).' contoh undangan wedding_theme_13 – wedding_theme_30');

        if ($noRenderer = $skipped['wedding'] ?? []) {
            $this->command?->warn('  Belum punya renderer, dilewati: '.implode(', ', $noRenderer));
        }

        $missing = array_diff($slugs, Theme::whereIn('slug', $slugs)->pluck('slug')->all());
        if ($missing) {
            $this->command?->warn('  Tidak ada di tabel themes: '.implode(', ', $missing));
        }
    }
}
