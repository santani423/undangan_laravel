<?php

namespace App\Services;

use App\Models\Invitation;
use Illuminate\Support\Str;

class InvitationSlugService
{
    public function normalize(?string $value): string
    {
        return Str::slug((string) $value) ?: '';
    }

    public function resolveBase(string $eventTypeName, array $fields = [], ?string $title = null): string
    {
        $candidates = match ($eventTypeName) {
            'wedding' => [
                trim((string) ($fields['groom_nickname'] ?? '')) . ' ' . trim((string) ($fields['bride_nickname'] ?? '')),
                trim((string) ($fields['groom_name'] ?? '')) . ' ' . trim((string) ($fields['bride_name'] ?? '')),
                'undangan-pernikahan',
            ],
            'birthday' => [
                $fields['child_name'] ?? null,
                $fields['child_nickname'] ?? null,
                'ulang-tahun',
            ],
            'khitanan' => [
                $fields['child_name'] ?? null,
                $fields['child_nickname'] ?? null,
                'khitanan',
            ],
            'aqiqah' => [
                $fields['baby_name'] ?? null,
                $fields['baby_nickname'] ?? null,
                'aqiqah',
            ],
            'gender_reveal' => [
                trim((string) ($fields['team_a_name'] ?? '')) . ' ' . trim((string) ($fields['team_b_name'] ?? '')),
                trim((string) ($fields['mother_name'] ?? '')) . ' ' . trim((string) ($fields['father_name'] ?? '')),
                'gender-reveal',
            ],
            'syukuran' => [
                $fields['host_name'] ?? null,
                $fields['occasion'] ?? null,
                'syukuran',
            ],
            default => [
                $title,
                $fields['title'] ?? null,
                $fields['name'] ?? null,
                'undangan',
            ],
        };

        foreach ($candidates as $candidate) {
            $normalized = $this->normalize($candidate);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return 'undangan';
    }

    public function resolveCandidate(?string $requestedSlug, string $eventTypeName, array $fields = [], ?string $title = null): string
    {
        $normalized = $this->normalize($requestedSlug);

        if ($normalized !== '') {
            return $normalized;
        }

        return $this->resolveBase($eventTypeName, $fields, $title);
    }

    public function isAvailable(string $slug, ?int $ignoreInvitationId = null): bool
    {
        $query = Invitation::withTrashed()->where('slug', $slug);

        if ($ignoreInvitationId) {
            $query->where('id', '!=', $ignoreInvitationId);
        }

        return ! $query->exists();
    }

    public function suggestions(string $slug, ?int $ignoreInvitationId = null, int $limit = 5): array
    {
        $base = $this->normalize($slug) ?: 'undangan';
        $primarySuffixes = [
            '-01',
            '-02',
            '-' . now()->year,
            '-7th',
            '-party',
            '-invite',
            '-official',
        ];
        $primarySuffixes = array_merge(
            $primarySuffixes,
            array_map(
                static fn (int $i): string => sprintf('-%02d', $i),
                range(3, 25)
            )
        );

        $available = $this->filterAvailable($this->buildCandidates($base, $primarySuffixes), $ignoreInvitationId);
        if (count($available) >= $limit) {
            return array_slice($available, 0, $limit);
        }

        $secondarySuffixes = array_map(
            static fn (int $i): string => sprintf('-%02d', $i),
            range(26, 99)
        );

        $available = array_merge(
            $available,
            $this->filterAvailable($this->buildCandidates($base, $secondarySuffixes), $ignoreInvitationId)
        );

        return array_slice(array_values(array_unique($available)), 0, $limit);
    }

    private function buildCandidates(string $base, array $suffixes): array
    {
        $candidates = [];

        foreach ($suffixes as $suffix) {
            $candidate = $base . $suffix;
            if ($candidate !== $base && ! in_array($candidate, $candidates, true)) {
                $candidates[] = $candidate;
            }
        }

        return $candidates;
    }

    private function filterAvailable(array $candidates, ?int $ignoreInvitationId = null): array
    {
        if ($candidates === []) {
            return [];
        }

        $query = Invitation::withTrashed()->whereIn('slug', $candidates);

        if ($ignoreInvitationId) {
            $query->where('id', '!=', $ignoreInvitationId);
        }

        $taken = $query->pluck('slug')->all();

        return array_values(array_diff($candidates, $taken));
    }
}
