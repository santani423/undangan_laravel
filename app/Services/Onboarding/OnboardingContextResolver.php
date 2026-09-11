<?php

namespace App\Services\Onboarding;

use App\Models\EventType;
use App\Models\Package;
use App\Models\Theme;

/**
 * Turns a customer's pre-auth choice (a theme, a package, or nothing yet —
 * see the three landing-page entry points) into a validated context, and
 * resolves that context to the correct step of the existing invitation
 * wizard (Customer\InvitationController). Every id is re-checked against
 * the database here — the frontend only ever supplies an id, never a type
 * or a price.
 *
 * Theme and Package don't share a foreign key: Theme.event_type is matched
 * against EventType.name, Package.invitation_type against EventType.label
 * (the same string-matching convention already used by
 * InvitationController::selectTheme()).
 */
class OnboardingContextResolver
{
    /**
     * @return array{theme_id: ?int, package_id: ?int, package_tier: ?string, event_type_id: ?int}
     */
    public function resolve(?int $themeId, ?int $packageId, ?string $packageTier = null): array
    {
        $context = ['theme_id' => null, 'package_id' => null, 'package_tier' => null, 'event_type_id' => null];

        if ($themeId) {
            $theme = Theme::active()->find($themeId);
            if ($theme) {
                $eventType = EventType::active()->where('name', $theme->event_type)->first();
                if ($eventType) {
                    $context['theme_id'] = $theme->id;
                    $context['event_type_id'] = $eventType->id;
                }
            }
        }

        if ($packageId) {
            $package = Package::active()->find($packageId);
            if ($package) {
                $eventType = EventType::active()->where('label', $package->invitation_type)->first();
                if ($eventType && ($context['event_type_id'] === null || $context['event_type_id'] === $eventType->id)) {
                    $context['package_id'] = $package->id;
                    $context['event_type_id'] = $eventType->id;
                } elseif (! $context['event_type_id']) {
                    $context['package_id'] = $package->id;
                    $context['event_type_id'] = $eventType?->id;
                }
            }
        }

        if (! $context['package_id'] && in_array($packageTier, ['basic', 'premium', 'exclusive'], true)) {
            $context['package_tier'] = $packageTier;
        }

        return $context;
    }

    public function hasContext(array $context): bool
    {
        return (bool) ($context['theme_id'] ?? $context['package_id'] ?? $context['package_tier'] ?? $context['event_type_id'] ?? null);
    }

    /**
     * Build the wizard URL to send the customer to, given their (validated)
     * pre-auth context. Falls back to the plain "choose event type" start
     * of the wizard when nothing usable was captured.
     */
    public function resolveUrl(array $context): string
    {
        $eventTypeId = $context['event_type_id'] ?? null;
        $themeId = $context['theme_id'] ?? null;
        $packageId = $context['package_id'] ?? null;
        $packageTier = $context['package_tier'] ?? null;

        if (! $eventTypeId) {
            // Only a package tier was picked (no concrete theme/package, e.g.
            // from the landing page's tier cards, which aren't tied to one
            // invitation_type) — jenis undangan still needs to be chosen
            // first; the tier rides along so the package step can
            // pre-select within it once the type is known.
            return $packageTier
                ? route('customer.invitations.create', ['package_tier' => $packageTier])
                : route('customer.invitations.create');
        }

        $query = ['event_type_id' => $eventTypeId];
        if ($themeId) {
            $query['theme_id'] = $themeId;
        }
        if ($packageId) {
            $query['package_id'] = $packageId;
        } elseif ($packageTier) {
            $query['package_tier'] = $packageTier;
        }

        return route('customer.invitations.create.theme', $query);
    }
}
