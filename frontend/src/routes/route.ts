import { toQueryString } from '@/services/api/client';
import { ROUTES, type RouteName } from './manifest';

/**
 * Named-route URL builder — drop-in for the Ziggy `route()` helper the pages
 * used under Inertia, backed by the static manifest in ./manifest.ts.
 *
 *   route('customer.invitations.edit', 'abc')            → /customer/invitations/abc/edit
 *   route('admin.themes.update', { theme: 3 })           → /admin/themes/3
 *   route('themes.index', { event_type: 'wedding' })     → /themes?event_type=wedding
 *
 * The result is a path: a SPA URL for links/navigation, and — passed to
 * router.post/patch/… or the API client — the endpoint under /api/v1.
 */
type ParamValue = string | number | boolean | null | undefined | { id?: string | number; slug?: string };
type Params = ParamValue | ParamValue[] | Record<string, unknown>;

const PARAM = /\{([^}?]+)(\?)?\}/g;

function toSegment(value: unknown): string {
    if (value !== null && typeof value === 'object') {
        // Ziggy resolved model objects by their route key (slug for invitations, else id).
        const model = value as { slug?: unknown; id?: unknown };
        return encodeURIComponent(String(model.slug ?? model.id ?? ''));
    }
    return encodeURIComponent(String(value));
}

export function route(name: RouteName | string, params?: Params, absolute = false): string {
    const template = (ROUTES as Record<string, string>)[name];
    if (template === undefined) {
        throw new Error(`route(): unknown route name "${name}". Add it to src/routes/manifest.ts.`);
    }

    const names = Array.from(template.matchAll(PARAM)).map((m) => m[1]);
    let named: Record<string, unknown> = {};

    if (params === undefined || params === null) {
        named = {};
    } else if (Array.isArray(params)) {
        params.forEach((value, i) => {
            if (names[i] !== undefined) named[names[i]] = value;
        });
    } else if (typeof params === 'object' && !names.some((n) => n in (params as object)) && ('id' in params || 'slug' in params) && names.length > 0) {
        // A single model object for a single-parameter route.
        named = { [names[0]]: params };
    } else if (typeof params === 'object') {
        named = { ...(params as Record<string, unknown>) };
    } else if (names.length > 0) {
        named = { [names[0]]: params };
    }

    const used = new Set<string>();
    let path = template.replace(PARAM, (_, key: string, optional?: string) => {
        used.add(key);
        const value = named[key];
        if (value === undefined || value === null || value === '') {
            if (optional) return '';
            throw new Error(`route(): missing parameter "${key}" for route "${name}".`);
        }
        return toSegment(value);
    });

    // Optional trailing segments leave a dangling slash: /{code}/{visitor?} → /abc/
    path = path.replace(/\/+$/, '') || '/';

    const extra: Record<string, unknown> = {};
    Object.entries(named).forEach(([key, value]) => {
        if (!used.has(key)) extra[key] = value;
    });
    const qs = toQueryString(extra);
    const url = qs ? `${path}?${qs}` : path;

    return absolute && typeof window !== 'undefined' ? window.location.origin + url : url;
}

/** Whether a route name exists in the manifest. */
route.has = (name: string): boolean => name in ROUTES;

export type { RouteName };
