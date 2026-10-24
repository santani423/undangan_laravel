<?php

namespace Database\Seeders;

use App\Models\Theme;
use Database\Seeders\Data\BirthdayThemeSampleData;
use Illuminate\Support\Facades\DB;

/**
 * Deletes the demo invitations of birthday_theme_01 … birthday_theme_20 and
 * seeds them again from BirthdayThemeSampleData, leaving every other sample
 * untouched:
 *
 *   php artisan db:seed --class=ResetBirthdaySampleSeeder
 *   (production: add --force)
 *
 * Same rules as ResetSampleInvitationSeeder: only the system account's
 * is_sample rows are deleted, a sample with payment records is refreshed in
 * place instead, and everything runs in one transaction. Same rule as
 * WeddingThemeSampleSeeder: a theme gets a sample only once its React renderer
 * exists, so re-run after adding one. A full SampleInvitationSeeder run uses
 * the same data, so the two never overwrite each other.
 */
class ResetBirthdaySampleSeeder extends ResetSampleInvitationSeeder
{
    public function run(): void
    {
        $slugs = BirthdayThemeSampleData::slugs();

        DB::transaction(function () use ($slugs) {
            $this->wipeSamples(Theme::whereIn('slug', $slugs)->pluck('id')->all());
            $this->seedSamples(fn (Theme $theme) => in_array($theme->slug, $slugs, true));
        });
    }

    protected function report(array $counts, array $skipped): void
    {
        $slugs = BirthdayThemeSampleData::slugs();

        $this->command?->info('ResetBirthdaySampleSeeder: '.($counts['birthday'] ?? 0).' contoh undangan birthday_theme_01 – birthday_theme_20 dibuat ulang');

        if ($noRenderer = $skipped['birthday'] ?? []) {
            $this->command?->warn('  Belum punya renderer, dilewati: '.implode(', ', $noRenderer));
        }

        $missing = array_diff($slugs, Theme::whereIn('slug', $slugs)->pluck('slug')->all());
        if ($missing) {
            $this->command?->warn('  Tidak ada di tabel themes: '.implode(', ', $missing));
        }
    }
}
