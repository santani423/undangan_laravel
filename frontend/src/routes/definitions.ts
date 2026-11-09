import type { Flash } from '@/store/page';
import type { Params } from 'react-router';

/**
 * Route table of the SPA. URLs are exactly the ones the Laravel/Inertia app
 * had (bookmarks, shared invitation links and payment return URLs keep
 * working). Each page gets its data from the API:
 *
 *   api: undefined → GET /api/v1{same path}{query}   (default, "mirror")
 *   api: string / fn → that API path (+ the page's query string)
 *   api: null       → page without server data (rendered from shared props only)
 */
export type Guard = 'guest' | 'auth' | 'admin' | 'customer';

export interface PropsContext {
    data: Record<string, unknown>;
    params: Params;
    query: URLSearchParams;
    flash: Flash;
}

export interface PageRoute {
    path: string;
    /** Page component under src/pages (without .tsx), or a chooser based on the API data. */
    page: string | ((data: Record<string, unknown>) => string);
    api?: string | null | ((params: Params) => string);
    guard?: Guard;
    /** Extra props computed on the client (query string, flash status…). */
    props?: (ctx: PropsContext) => Record<string, unknown>;
}

export interface RedirectRoute {
    path: string;
    guard?: Guard;
    /** Where to go; return null to show 403. */
    redirect: (ctx: { params: Params; query: URLSearchParams }) => string | null | 'external';
}

const intOrNull = (value: string | null) => {
    const n = value ? Number.parseInt(value, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
};

const onboardingProps = ({ query }: PropsContext) => ({
    onboardingThemeId: intOrNull(query.get('theme_id')),
    onboardingPackageId: intOrNull(query.get('package_id')),
    onboardingPackageTier: query.get('package_tier') || null,
});

const statusFromFlash = ({ flash }: PropsContext) => ({ status: flash.status ?? null });

export const pageRoutes: PageRoute[] = [
    // ─── Public ───────────────────────────────────────────────────────────────
    { path: '/', page: 'welcome', api: '/landing' },
    { path: '/undangan/pernikahan', page: 'wedding/index', api: '/landing/wedding' },
    { path: '/themes', page: 'themes/index' },
    { path: '/themes/:theme/sample', page: 'invitation/show' },

    // ─── Auth ─────────────────────────────────────────────────────────────────
    {
        path: '/login',
        page: 'auth/login',
        api: '/auth/options',
        guard: 'guest',
        props: (ctx) => ({ ...onboardingProps(ctx), ...statusFromFlash(ctx) }),
    },
    { path: '/register', page: 'auth/register', api: null, guard: 'guest', props: onboardingProps },
    { path: '/forgot-password', page: 'auth/forgot-password', api: null, guard: 'guest', props: statusFromFlash },
    {
        path: '/reset-password/:token',
        page: 'auth/reset-password',
        api: null,
        guard: 'guest',
        props: ({ params, query }) => ({ token: params.token ?? '', email: query.get('email') ?? '' }),
    },
    { path: '/verify-email', page: 'auth/verify-email', api: null, guard: 'auth', props: statusFromFlash },
    { path: '/confirm-password', page: 'auth/confirm-password', api: null, guard: 'auth' },

    // ─── Settings (every signed-in user) ──────────────────────────────────────
    { path: '/settings/profile', page: 'settings/profile', guard: 'auth', props: statusFromFlash },
    { path: '/settings/password', page: 'settings/password', guard: 'auth', props: statusFromFlash },
    { path: '/settings/appearance', page: 'settings/appearance', api: null, guard: 'auth' },
    // System settings (admin)
    { path: '/settings/app', page: 'settings/app', guard: 'admin', props: statusFromFlash },
    { path: '/settings/payment', page: 'settings/payment', api: null, guard: 'admin' },
    { path: '/settings/packages', page: 'settings/packages', guard: 'admin' },

    // ─── Customer ─────────────────────────────────────────────────────────────
    {
        path: '/customer',
        // Customers without invitations get the focused onboarding screen.
        page: (data) => (data.view === 'onboarding' ? 'customer/onboarding' : 'customer/dashboard'),
        guard: 'customer',
    },
    { path: '/customer/invitations', page: 'customer/invitations/index', guard: 'customer' },
    { path: '/customer/invitations/create', page: 'customer/invitations/create', guard: 'customer' },
    { path: '/customer/invitations/create/theme', page: 'customer/invitations/select-theme', guard: 'customer' },
    { path: '/customer/invitations/create/detail', page: 'customer/invitations/create-detail', guard: 'customer' },
    { path: '/customer/invitations/:invitation', page: 'customer/invitations/show', api: null, guard: 'customer' },
    { path: '/customer/invitations/:invitation/payment', page: 'customer/invitations/payment', guard: 'customer' },
    { path: '/customer/invitations/:invitation/edit', page: 'customer/invitations/edit', guard: 'customer' },
    { path: '/customer/invitations/:slug/detail', page: 'customer/invitations/edit', guard: 'customer' },
    { path: '/customer/invitations/:slug/settings', page: 'customer/invitations/edit', guard: 'customer' },
    { path: '/customer/invitations/:invitation/guests', page: 'customer/invitations/guest-book/index', guard: 'customer' },
    { path: '/customer/invitations/:invitation/guests/operator', page: 'customer/invitations/guest-book/operator', guard: 'customer' },
    { path: '/customer/invitations/:invitation/comments', page: 'customer/invitations/comments/index', guard: 'customer' },
    { path: '/customer/invitations/:invitation/digital-wallets', page: 'customer/digital-wallets/invitation-wallets', guard: 'customer' },
    { path: '/customer/digital-wallets', page: 'customer/digital-wallets/index', guard: 'customer' },
    { path: '/customer/subscription', page: 'customer/subscription/index', api: null, guard: 'customer' },
    { path: '/customer/subscription/upgrade', page: 'customer/subscription/upgrade', api: null, guard: 'customer' },
    { path: '/customer/payments/success', page: 'customer/payments/success', guard: 'customer' },
    { path: '/customer/payments/failed', page: 'customer/payments/failed', guard: 'customer' },
    { path: '/customer/transactions', page: 'customer/transactions/index', guard: 'customer' },
    { path: '/customer/transactions/:transaction', page: 'customer/transactions/show', guard: 'customer' },
    { path: '/customer/profile', page: 'customer/profile/index', guard: 'customer' },

    // ─── Admin ────────────────────────────────────────────────────────────────
    { path: '/admin', page: 'admin/dashboard', api: null, guard: 'admin' },
    { path: '/admin/users', page: 'admin/users/index', guard: 'admin' },
    { path: '/admin/users/admins', page: 'admin/users/admins', api: null, guard: 'admin' },
    { path: '/admin/users/roles', page: 'admin/users/roles', api: null, guard: 'admin' },
    { path: '/admin/users/permissions', page: 'admin/users/permissions', api: null, guard: 'admin' },
    { path: '/admin/users/:user', page: 'admin/users/show', guard: 'admin' },
    { path: '/admin/invitations', page: 'admin/invitations/index', api: null, guard: 'admin' },
    { path: '/admin/invitations/custom-domains', page: 'admin/invitations/custom-domains', api: null, guard: 'admin' },
    { path: '/admin/invitations/:invitation', page: 'admin/invitations/show', guard: 'admin' },
    { path: '/admin/event-types', page: 'admin/event-types/index', guard: 'admin' },
    { path: '/admin/themes', page: 'admin/themes/index', guard: 'admin' },
    { path: '/admin/themes/categories', page: 'admin/themes/categories', api: null, guard: 'admin' },
    { path: '/admin/packages', page: 'admin/packages/index', api: null, guard: 'admin' },
    { path: '/admin/transactions', page: 'admin/transactions/index', guard: 'admin' },
    { path: '/admin/transactions/payments', page: 'admin/transactions/payments', guard: 'admin' },
    { path: '/admin/transactions/refunds', page: 'admin/transactions/refunds', api: null, guard: 'admin' },
    // The transaction detail is the list page with that transaction opened.
    { path: '/admin/transactions/:transaction', page: 'admin/transactions/index', guard: 'admin' },
    { path: '/admin/content/testimonials', page: 'admin/content/testimonials', api: null, guard: 'admin' },
    { path: '/admin/reports/platform', page: 'admin/reports/platform', api: null, guard: 'admin' },
    { path: '/admin/reports/revenue', page: 'admin/reports/revenue', api: null, guard: 'admin' },
    { path: '/admin/reports/activity-logs', page: 'admin/reports/activity-logs', guard: 'admin' },
    { path: '/admin/settings/general', page: 'admin/settings/general', api: null, guard: 'admin' },
    { path: '/admin/settings/packages', page: 'admin/settings/packages', guard: 'admin' },
    { path: '/admin/settings/payment', page: 'admin/settings/payment', guard: 'admin' },
    { path: '/admin/settings/whatsapp', page: 'admin/settings/whatsapp', api: null, guard: 'admin' },
    { path: '/admin/settings/notification', page: 'admin/settings/notification', api: null, guard: 'admin' },

    // ─── Public invitation viewer — /{code} and /{code}/{visitor} ─────────────
    // (React Router ranks static paths first, so these never shadow app pages.)
    { path: '/:code', page: 'invitation/show', api: (p) => `/invitations/${encodeURIComponent(p.code ?? '')}` },
    {
        path: '/:code/:visitor',
        page: 'invitation/show',
        api: (p) => `/invitations/${encodeURIComponent(p.code ?? '')}/visitors/${encodeURIComponent(p.visitor ?? '')}`,
    },
];

/** Entry files of the standalone HTML wedding themes in public/preview/themes/wedding/. */
const STATIC_PREVIEW_ENTRIES: Record<string, string> = {
    'bahagia-wedding': 'bahagia-wedding.html',
};

export const redirectRoutes: RedirectRoute[] = [
    { path: '/settings', guard: 'auth', redirect: () => '/settings/profile' },
    // Generic entry point: the dashboard of the user's role (resolved in the loader).
    { path: '/dashboard', guard: 'auth', redirect: () => '/dashboard' },
    {
        // Standalone HTML themes are static files of this frontend now.
        path: '/preview/themes/wedding/:theme',
        redirect: ({ params, query }) => {
            const theme = params.theme ?? '';
            const qs = query.toString();
            window.location.replace(`/preview/themes/wedding/${theme}/${STATIC_PREVIEW_ENTRIES[theme] ?? 'index.html'}${qs ? `?${qs}` : ''}`);
            return 'external';
        },
    },
];
