import { api, ApiError, NetworkError } from '@/services/api';
import { authReady, authStore, dashboardPath, setAuthUser } from '@/store/auth';
import { setFlash, type Flash } from '@/store/page';
import { data, redirect, type LoaderFunctionArgs } from 'react-router';
import type { PageRoute, RedirectRoute } from './definitions';
import { checkGuard } from './guards';
import { loadPageComponent, type PageComponent } from './pages';

export interface PageLoaderData {
    data: Record<string, unknown>;
    /** Page component name and its (already loaded) module. */
    name: string;
    Component: PageComponent;
}

/** Error thrown to the route error boundary (rendered by pages/error.tsx). */
export interface RouteErrorData {
    status: number;
    message?: string;
    debug?: ApiError['body']['debug'];
}

function routeError(status: number, body?: { message?: string; debug?: RouteErrorData['debug'] }) {
    return data<RouteErrorData>({ status, message: body?.message, debug: body?.debug }, { status });
}

async function guardOrThrow(guard: PageRoute['guard'], request: Request): Promise<void> {
    await authReady();
    const outcome = checkGuard(guard, authStore.get().user, new URL(request.url));
    if (outcome === 'forbidden') throw routeError(403);
    if (outcome) throw redirect(outcome);
}

function flashFrom(body: ApiError['body'], fallback: 'success' | 'error'): void {
    const flash: Flash = {};
    if (body.message) flash[body.message_type ?? fallback] = body.message;
    if (typeof body.status === 'string') flash.status = body.status;
    if (Object.keys(flash).length) setFlash(flash);
}

/** GET the page data from the API (mirror path by default). */
export function pageLoader(route: PageRoute) {
    return async ({ request, params }: LoaderFunctionArgs): Promise<PageLoaderData> => {
        await guardOrThrow(route.guard, request);

        // A verified user has nothing to do on /verify-email (old EmailVerificationPromptController).
        if (route.path === '/verify-email' && authStore.get().user?.email_verified_at) throw redirect('/dashboard');

        // Start loading the page bundle in parallel with its data.
        const staticName = typeof route.page === 'string' ? route.page : null;
        const preloaded = staticName ? loadPageComponent(staticName) : null;

        const withComponent = async (data: Record<string, unknown>): Promise<PageLoaderData> => {
            const name = staticName ?? (route.page as (d: Record<string, unknown>) => string)(data);
            return { data, name, Component: await (preloaded ?? loadPageComponent(name)) };
        };

        if (route.api === null) return withComponent({});

        const url = new URL(request.url);
        const path = route.api === undefined ? url.pathname : typeof route.api === 'function' ? route.api(params) : route.api;

        let body;
        try {
            body = await api.get<Record<string, unknown>>(path + url.search, undefined, { signal: request.signal });
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    setAuthUser(null);
                    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
                }
                if (error.body.redirect) {
                    // e.g. the area guard (403) sends the user to their own dashboard.
                    flashFrom(error.body, 'error');
                    throw redirect(error.body.redirect);
                }
                throw routeError(error.status, error.body);
            }
            // No HTTP response at all (offline, DNS, CORS rejected): "server unreachable", not "maintenance".
            if (error instanceof NetworkError) throw routeError(502, { message: error.message });
            throw error;
        }

        if (body.location) {
            window.location.href = body.location;
            return new Promise(() => undefined);
        }

        if (body.redirect) {
            // A page endpoint that answers "go elsewhere" (e.g. paid invitation → transaction).
            flashFrom(body, 'success');
            throw redirect(body.redirect);
        }

        return withComponent((body.data as Record<string, unknown>) ?? {});
    };
}

export function redirectLoader(route: RedirectRoute) {
    return async ({ request, params }: LoaderFunctionArgs) => {
        await guardOrThrow(route.guard, request);

        if (route.path === '/dashboard') {
            const target = dashboardPath(authStore.get().user);
            if (!target) throw routeError(403);
            const url = new URL(request.url);
            return redirect(target + url.search);
        }

        const target = route.redirect({ params, query: new URL(request.url).searchParams });
        if (target === 'external') return new Promise(() => undefined);
        if (target === null) throw routeError(403);
        return redirect(target);
    };
}

