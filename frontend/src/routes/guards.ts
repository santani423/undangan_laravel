import { dashboardPath } from '@/store/auth';
import type { User } from '@/types';
import type { Guard } from './definitions';

/**
 * Role-based access for SPA routes — mirrors the backend middleware
 * (`auth:sanctum`, `guest.api`, `area:admin|customer`), which stays the
 * real enforcement: the API answers 401/403 regardless of the frontend.
 *
 * Returns the path to redirect to, 'forbidden' for a 403, or null to allow.
 */
export function checkGuard(guard: Guard | undefined, user: User | null, url: URL): string | 'forbidden' | null {
    if (!guard) return null;

    if (guard === 'guest') {
        return user ? (dashboardPath(user) ?? '/') : null;
    }

    if (!user) {
        return `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
    }

    if (guard === 'auth') return null;

    if (user.area === guard) return null;

    // Signed in, but the other area: go to the user's own dashboard (EnsureUserArea).
    return dashboardPath(user) ?? 'forbidden';
}
