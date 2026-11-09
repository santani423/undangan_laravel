import { createStore } from './create-store';

/**
 * Per-visit page messages, the SPA counterpart of Laravel's session flash and
 * error bag that Inertia exposed as `flash` and `errors` props:
 *  - flash: set from an API response's `message` / `status`, shown by the page
 *    it lands on, cleared on the next user navigation;
 *  - errors: first validation message per field of the last failed submit;
 *  - errorPage: an HTTP error (403/404/410/5xx) that replaces the page, like
 *    the Inertia `error` page did.
 */
export interface Flash {
    success?: string | null;
    error?: string | null;
    info?: string | null;
    status?: string | null;
}

export interface ErrorPageState {
    status: number;
    message?: string;
    debug?: {
        exception: string;
        message: string;
        file: string;
        line: number;
        trace: string[];
    };
}

export interface PageMessages {
    flash: Flash;
    errors: Record<string, string>;
    errorPage: ErrorPageState | null;
    /** Network / unexpected failures with no page to show them on. */
    globalError: string | null;
}

const EMPTY_FLASH: Flash = {};
const EMPTY_ERRORS: Record<string, string> = {};

export const pageStore = createStore<PageMessages>({ flash: EMPTY_FLASH, errors: EMPTY_ERRORS, errorPage: null, globalError: null });

export const useFlash = () => pageStore.use((s) => s.flash);
export const useErrors = () => pageStore.use((s) => s.errors);
export const useErrorPage = () => pageStore.use((s) => s.errorPage);
export const useGlobalError = () => pageStore.use((s) => s.globalError);

export function setFlash(flash: Flash): void {
    pageStore.set((s) => ({ ...s, flash: { ...flash } }));
}

export function clearFlash(): void {
    pageStore.set((s) => (s.flash === EMPTY_FLASH ? s : { ...s, flash: EMPTY_FLASH }));
}

export function setErrors(errors: Record<string, string>): void {
    pageStore.set((s) => ({ ...s, errors }));
}

export function clearErrors(): void {
    pageStore.set((s) => (s.errors === EMPTY_ERRORS ? s : { ...s, errors: EMPTY_ERRORS }));
}

export function showErrorPage(errorPage: ErrorPageState | null): void {
    pageStore.set((s) => ({ ...s, errorPage }));
}

export function setGlobalError(message: string | null): void {
    pageStore.set((s) => ({ ...s, globalError: message }));
}

/**
 * Flash passed through the URL by backend browser redirects (Google OAuth
 * callback: ?flash_error=…). Moved into the store and removed from the URL.
 */
export function takeFlashFromUrl(): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const flash: Flash = {};
    let found = false;

    for (const key of ['success', 'error', 'info', 'status'] as const) {
        const value = url.searchParams.get(`flash_${key}`);
        if (value !== null) {
            flash[key] = value;
            url.searchParams.delete(`flash_${key}`);
            found = true;
        }
    }

    if (found) {
        setFlash(flash);
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
}
