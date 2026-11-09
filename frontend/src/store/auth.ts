import { api, ApiError } from '@/services/api';
import type { User } from '@/types';
import { createStore } from './create-store';

/**
 * Authenticated user of the session (GET /api/v1/auth/me) — what Inertia
 * used to share with every page as `auth.user`. The session itself is an
 * HttpOnly cookie managed by Laravel Sanctum; nothing is stored client-side.
 */
export interface AuthState {
    user: User | null;
    /** True once the first /auth/me answered (route guards wait for it). */
    ready: boolean;
}

export const authStore = createStore<AuthState>({ user: null, ready: false });

export const useAuthUser = () => authStore.use((s) => s.user);

export function setAuthUser(user: User | null): void {
    authStore.set((s) => ({ ...s, user, ready: true }));
}

let loading: Promise<User | null> | null = null;

/** Load (once, or again with force) the current user from the API. */
export function loadAuthUser(force = false): Promise<User | null> {
    if (loading && !force) return loading;

    loading = api
        .get<{ user: User | null }>('/auth/me')
        .then((res) => {
            const user = res.data?.user ?? null;
            setAuthUser(user);
            return user;
        })
        .catch((error: unknown) => {
            // Treat an unreachable API as "guest"; protected pages will show their own error.
            if (!(error instanceof ApiError) || error.status === 401) setAuthUser(null);
            else authStore.set((s) => ({ ...s, ready: true }));
            return authStore.get().user;
        });

    return loading;
}

/** Resolves when the first /auth/me finished. */
export function authReady(): Promise<User | null> {
    return authStore.get().ready ? Promise.resolve(authStore.get().user) : loadAuthUser();
}

/** SPA path of the dashboard for the user's role area (null: no recognised role). */
export function dashboardPath(user: User | null): string | null {
    if (!user) return null;
    if (user.area === 'admin') return '/admin';
    if (user.area === 'customer') return '/customer';
    return null;
}
