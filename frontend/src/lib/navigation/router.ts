import { API_BASE_PATH, API_BASE_URL } from '@/lib/env';
import { ApiError, type ApiEnvelope, firstErrors, NetworkError, request, toQueryString } from '@/services/api';
import { setAuthUser } from '@/store/auth';
import { trackRequest } from '@/store/progress';
import { clearErrors, clearFlash, type Flash, setErrors, setFlash, setGlobalError, showErrorPage } from '@/store/page';
import { getAppRouter, type NavigationState } from './app-router';
import { getCurrentPage } from './page-context';
import type { FormDataLike, Method, Page, PendingVisit, ReloadOptions, VisitOptions } from './types';

/**
 * Navigation & data layer of the SPA (`router` of @/lib/navigation).
 *
 * It keeps the API the pages were written against under Inertia, on top of
 * React Router + the REST API:
 *
 *  • GET visits are client-side navigations: the route's loader fetches the
 *    page data from GET /api/v1{path} (see src/routes).
 *  • post/put/patch/delete call the API endpoint at the same path, then
 *    follow the response like Inertia followed Laravel's redirect:
 *      - `location`          → full page load (payment gateway checkout)
 *      - `redirect`          → navigate there, flash message kept
 *      - neither             → reload the current page's data ("back()")
 *      - 422 + field errors  → onError(errors), page `errors`
 *      - other 4xx message   → flash.error (+ redirect / reload), like a
 *                              redirect()->with('error') used to
 *      - 401                 → login page
 *      - 403/404/410/5xx     → error page
 */

let visitCounter = 0;
const apiOrigin = new URL(API_BASE_URL).origin;

/** SPA path for an href, or null when it points to another site. */
export function toFrontendPath(href: string): string | null {
    if (!/^https?:\/\//i.test(href)) {
        if (href.startsWith(API_BASE_PATH + '/')) return href.slice(API_BASE_PATH.length) || '/';
        return href;
    }

    const url = new URL(href);

    if (url.origin === window.location.origin) {
        const path = url.pathname.startsWith(API_BASE_PATH + '/') ? url.pathname.slice(API_BASE_PATH.length) : url.pathname;
        return path + url.search + url.hash;
    }

    // An API URL (e.g. a paginator link built by Laravel): same page in the SPA.
    if (url.origin === apiOrigin && url.pathname.startsWith(API_BASE_PATH + '/')) {
        return url.pathname.slice(API_BASE_PATH.length) + url.search + url.hash;
    }

    return null;
}

function withQuery(href: string, data?: FormDataLike): string {
    if (!data || data instanceof FormData) return href;
    const qs = toQueryString(data);
    if (!qs) return href;

    const [base, hash = ''] = href.split('#');
    const [path, existing = ''] = base.split('?');
    // Like Inertia, `data` replaces the query string of a GET visit.
    void existing;
    return `${path}?${qs}${hash ? `#${hash}` : ''}`;
}

function currentPath(): string {
    return window.location.pathname + window.location.search;
}

function isSamePage(target: string): boolean {
    return target.split('#')[0] === currentPath();
}

function applyFlash(body: ApiEnvelope, fallbackType: 'success' | 'error'): void {
    const flash: Flash = {};
    if (body.message) {
        const type = body.message_type ?? fallbackType;
        flash[type] = body.message;
    }
    if (typeof body.status === 'string') flash.status = body.status;
    if (Object.keys(flash).length > 0) setFlash(flash);
}

function applyAuth(body: ApiEnvelope): void {
    if (body.auth && 'user' in body.auth) setAuthUser(body.auth.user);
}

async function goTo(target: string, { replace = false, preserveScroll = false, keepFlash = false } = {}): Promise<void> {
    if (/^https?:\/\//i.test(target)) {
        const path = toFrontendPath(target);
        if (path === null) {
            window.location.href = target;
            return new Promise(() => undefined);
        }
        target = path;
    }

    // Following a mutation: keep the page mounted when it stays on the same page (Inertia's
    // post/put/patch/delete default to preserveState: true).
    const state: NavigationState = { keepFlash, preserveState: true, visitId: ++visitCounter };
    await getAppRouter().navigate(target, { replace, preventScrollReset: preserveScroll, state });
}

async function reloadPage({ preserveScroll = true } = {}): Promise<void> {
    await getAppRouter().revalidate();
    if (!preserveScroll) window.scrollTo(0, 0);
}

function loginPath(): string {
    const here = currentPath();
    return here.startsWith('/login') ? '/login' : `/login?redirect=${encodeURIComponent(here)}`;
}

// ─── GET visits ──────────────────────────────────────────────────────────────

async function visitGet(href: string, options: VisitOptions): Promise<void> {
    const pending: PendingVisit = { url: href, method: 'get', data: options.data };
    if (options.onBefore?.(pending) === false) return;

    const target = toFrontendPath(withQuery(href, options.data));
    if (target === null) {
        window.location.href = href;
        return;
    }

    options.onStart?.(pending);

    // A user-initiated visit starts clean: no stale flash, errors or error page.
    clearFlash();
    clearErrors();
    showErrorPage(null);

    const state: NavigationState = {
        preserveState: options.preserveState === true,
        visitId: ++visitCounter,
    };

    try {
        await getAppRouter().navigate(target, {
            replace: options.replace ?? false,
            preventScrollReset: options.preserveScroll === true,
            state,
        });
        await options.onSuccess?.(getCurrentPage());
    } finally {
        options.onFinish?.(pending);
    }
}

// ─── Mutations ───────────────────────────────────────────────────────────────

let activeController: AbortController | null = null;

async function visitMutation(href: string, method: Exclude<Method, 'get'>, options: VisitOptions): Promise<void> {
    const pending: PendingVisit = { url: href, method, data: options.data };
    if (options.onBefore?.(pending) === false) return;

    const controller = new AbortController();
    activeController = controller;
    options.onCancelToken?.({ cancel: () => controller.abort() });
    options.onStart?.(pending);

    const preserveScroll = options.preserveScroll === true;

    try {
        const body = await trackRequest(request(method, href, {
            data: options.data,
            headers: options.headers,
            forceFormData: options.forceFormData,
            signal: controller.signal,
            onUploadProgress: options.onProgress,
        }));

        clearErrors();
        applyAuth(body);
        applyFlash(body, 'success');

        if (body.location) {
            window.location.href = body.location;
            return;
        }

        if (body.redirect && !isSamePage(body.redirect)) {
            await goTo(body.redirect, { keepFlash: true, preserveScroll });
        } else {
            await reloadPage({ preserveScroll });
        }

        await options.onSuccess?.(getCurrentPage());
    } catch (error) {
        await handleMutationError(error, options, preserveScroll);
    } finally {
        if (activeController === controller) activeController = null;
        options.onFinish?.(pending);
    }
}

async function handleMutationError(error: unknown, options: VisitOptions, preserveScroll: boolean): Promise<void> {
    if (error instanceof DOMException && error.name === 'AbortError') {
        options.onCancel?.();
        return;
    }

    if (error instanceof NetworkError) {
        setGlobalError(error.message);
        options.onError?.({});
        return;
    }

    if (!(error instanceof ApiError)) {
        setGlobalError('Terjadi kesalahan tak terduga. Silakan coba lagi.');
        options.onError?.({});
        throw error;
    }

    const body = error.body;

    if (error.isValidation) {
        const errors = firstErrors(body.errors);
        setErrors(errors);
        options.onError?.(errors);
        return;
    }

    if (error.status === 401) {
        setAuthUser(null);
        await goTo(body.redirect && body.redirect !== '/login' ? body.redirect : loginPath(), { replace: true });
        return;
    }

    if (body.redirect) {
        // e.g. 403 from the area guard, 409 "already logged in", payment errors.
        applyFlash(body, 'error');
        await goTo(body.redirect, { keepFlash: true, preserveScroll });
        await options.onSuccess?.(getCurrentPage());
        return;
    }

    if (error.status === 422 || error.status === 409 || error.status === 429 || error.status === 419) {
        // A business-rule refusal: Laravel used to redirect back with a flash error.
        applyFlash(body, 'error');
        await reloadPage({ preserveScroll: true });
        await options.onSuccess?.(getCurrentPage());
        return;
    }

    // 403 / 404 / 410 / 5xx: show the error page, like Inertia rendered `error`.
    showErrorPage({ status: error.status, message: body.message, debug: body.debug });
    options.onError?.({});
}

// ─── Public API ──────────────────────────────────────────────────────────────

function visit(href: string, options: VisitOptions = {}): Promise<void> {
    const method = (options.method ?? 'get').toLowerCase() as Method;
    return method === 'get' ? visitGet(href, options) : visitMutation(href, method, options);
}

export const router = {
    visit,

    get(href: string, data?: FormDataLike, options: Omit<VisitOptions, 'method' | 'data'> = {}) {
        return visit(href, { ...options, method: 'get', data });
    },

    post(href: string, data?: FormDataLike, options: Omit<VisitOptions, 'method' | 'data'> = {}) {
        return visit(href, { ...options, method: 'post', data });
    },

    put(href: string, data?: FormDataLike, options: Omit<VisitOptions, 'method' | 'data'> = {}) {
        return visit(href, { ...options, method: 'put', data });
    },

    patch(href: string, data?: FormDataLike, options: Omit<VisitOptions, 'method' | 'data'> = {}) {
        return visit(href, { ...options, method: 'patch', data });
    },

    delete(href: string, options: Omit<VisitOptions, 'method'> = {}) {
        return visit(href, { ...options, method: 'delete' });
    },

    /** Re-fetch the current page's data (Inertia's router.reload). */
    async reload(options: ReloadOptions = {}): Promise<void> {
        const pending: PendingVisit = { url: currentPath(), method: 'get', data: undefined };
        options.onStart?.(pending);
        try {
            await reloadPage({ preserveScroll: options.preserveScroll ?? true });
            await options.onSuccess?.(getCurrentPage());
        } finally {
            options.onFinish?.(pending);
        }
    },

    /** Abort the mutation in flight, if any. */
    cancel(): void {
        activeController?.abort();
    },

    /** The page currently shown. */
    page(): Page {
        return getCurrentPage();
    },
};

export type Router = typeof router;
