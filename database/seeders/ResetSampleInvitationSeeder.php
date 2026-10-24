<?php

namespace Database\Seeders;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Deletes every theme demo invitation and seeds them again from scratch:
 *
 *   php artisan db:seed --class=ResetSampleInvitationSeeder
 *   (production: add --force)
 *
 * SampleInvitationSeeder updates samples in place; this also clears whatever a
 * sample picked up since it was seeded (settings edited in the admin, page
 * views, poll votes, slider photos…). Samples get new ids.
 *
 * Scope: only invitations with is_sample = true owned by the sample system
 * account. Customer invitations, the demo customers' invitations
 * (InvitationSeeder) and files on disk are never touched. Everything runs in
 * one transaction, so a failed run leaves the old samples as they were.
 * Subclasses reset only some themes (ResetBirthdaySampleSeeder).
 */
class ResetSampleInvitationSeeder extends SampleInvitationSeeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->wipeSamples();
            $this->seedSamples();
        });
    }

    /**
     * Force-deletes the system account's samples: all of them, or only the
     * samples of $themeIds.
     *
     * @param  array<int, int>|null  $themeIds
     */
    protected function wipeSamples(?array $themeIds = null): void
    {
        $seeder = class_basename(static::class);
        $owner = User::withTrashed()->where('email', self::OWNER_EMAIL)->first();

        if (! $owner) {
            $this->command?->info("{$seeder}: belum ada contoh undangan, langsung seeding.");

            return;
        }

        // The system account only ever owns samples; anything else means a real person holds this address.
        if (Invitation::withTrashed()->where('user_id', $owner->id)->where('is_sample', false)->exists()) {
            throw new \RuntimeException(self::OWNER_EMAIL.' punya undangan yang bukan contoh. Reset dibatalkan, tidak ada data yang diubah; periksa akun ini.');
        }

        $ids = Invitation::withTrashed()
            ->where('is_sample', true)
            ->where('user_id', $owner->id)
            ->when($themeIds !== null, fn ($q) => $q->whereIn('theme_id', $themeIds))
            ->pluck('id');

        // These payment tables reference invitations without ON DELETE CASCADE. Money
        // records are never deleted: such a sample is kept and only refreshed in place.
        $kept = DB::table('transactions')->whereIn('invitation_id', $ids)->pluck('invitation_id')
            ->merge(DB::table('digital_envelope_transactions')->whereIn('invitation_id', $ids)->pluck('invitation_id'))
            ->unique();
        $ids = $ids->diff($kept)->values();

        // Child rows (settings, contents, events, gallery, guests, comments, page views…)
        // go with them through ON DELETE CASCADE.
        Invitation::withTrashed()->whereKey($ids->all())->forceDelete();

        // Wallets that only belonged to the deleted samples.
        $this->deleteOrphanWallets($owner);

        $this->command?->info("{$seeder}: {$ids->count()} contoh undangan dihapus.");
        if ($kept->isNotEmpty()) {
            $this->command?->warn("  {$kept->count()} contoh dipertahankan karena punya transaksi (id: {$kept->implode(', ')}); isinya tetap diperbarui.");
        }

        $foreign = Invitation::withTrashed()
            ->where('is_sample', true)
            ->where('user_id', '!=', $owner->id)
            ->when($themeIds !== null, fn ($q) => $q->whereIn('theme_id', $themeIds))
            ->pluck('id');
        if ($foreign->isNotEmpty()) {
            $this->command?->warn("  {$foreign->count()} undangan bertanda is_sample milik akun lain tidak disentuh (id: {$foreign->implode(', ')}); periksa manual.");
        }
    }
}
