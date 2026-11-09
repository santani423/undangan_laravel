/**
 * Page a guest was heading to before being sent to /login (the route guard
 * adds ?redirect=/that/page). Sent to POST /auth/login as `intended`; the
 * backend only honours same-site relative paths (ResolvesPostAuthRedirect).
 */
export function intendedPath(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const value = new URLSearchParams(window.location.search).get('redirect');
    return value && value.startsWith('/') && !value.startsWith('//') ? value : undefined;
}
