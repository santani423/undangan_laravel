import { API_BASE_PATH, API_BASE_URL, BACKEND_URL } from '@/lib/env';
import type { ApiEnvelope, HttpMethod, RequestOptions, ValidationErrors } from './types';

/**
 * Central HTTP client for the Laravel REST API.
 *
 * Authentication is Laravel Sanctum's SPA mode: the session lives in an
 * HttpOnly cookie (never readable by JavaScript, nothing is kept in
 * localStorage), and every state-changing request echoes the XSRF-TOKEN
 * cookie in the X-XSRF-TOKEN header.
 */

export class ApiError extends Error {
    readonly status: number;
    readonly body: ApiEnvelope;

    constructor(status: number, body: ApiEnvelope) {
        super(body.message || `Request failed with status ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }

    get errors(): ValidationErrors {
        return this.body.errors ?? {};
    }

    get isValidation(): boolean {
        return this.status === 422 && !!this.body.errors && Object.keys(this.body.errors).length > 0;
    }
}

/** Network failure (offline, CORS, DNS…) — no HTTP response at all. */
export class NetworkError extends Error {
    constructor(message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.') {
        super(message);
        this.name = 'NetworkError';
    }
}

// ─── URLs ────────────────────────────────────────────────────────────────────

const apiOrigin = new URL(API_BASE_URL).origin;

function appendQuery(url: string, query?: Record<string, unknown>): string {
    if (!query) return url;
    const qs = toQueryString(query);
    if (!qs) return url;
    return url + (url.includes('?') ? '&' : '?') + qs;
}

/**
 * Absolute API URL for a path. Accepts:
 *  - an API-relative path ("/customer/invitations")
 *  - a path that already contains the API prefix ("/api/v1/customer")
 *  - an absolute URL (returned as is, unless it is a frontend URL, in which
 *    case its path is treated as API-relative — Ziggy-style absolute links)
 */
export function apiUrl(path: string, query?: Record<string, unknown>): string {
    let url: string;

    if (/^https?:\/\//i.test(path)) {
        const parsed = new URL(path);
        if (parsed.origin === apiOrigin && parsed.pathname.startsWith(API_BASE_PATH)) {
            url = path;
        } else if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
            url = API_BASE_URL + parsed.pathname + parsed.search;
        } else {
            url = path;
        }
    } else {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        url = normalized.startsWith(API_BASE_PATH + '/') || normalized === API_BASE_PATH ? apiOrigin + normalized : API_BASE_URL + normalized;
    }

    return appendQuery(url, query);
}

/** Absolute URL on the backend host (Google OAuth redirect, exports, Sanctum). */
export function backendUrl(path: string, query?: Record<string, unknown>): string {
    return appendQuery(BACKEND_URL + (path.startsWith('/') ? path : `/${path}`), query);
}

/** Download link of an API GET endpoint (CSV/Excel/PDF exports): the session cookie authenticates it. */
export function downloadUrl(path: string, query?: Record<string, unknown>): string {
    return apiUrl(path, query);
}

// ─── Query string / FormData (Inertia-compatible encoding) ───────────────────

function flatten(prefix: string, value: unknown, out: [string, string][]) {
    if (value === undefined) return;
    if (value === null) {
        out.push([prefix, '']);
    } else if (Array.isArray(value)) {
        value.forEach((v, i) => flatten(`${prefix}[${i}]`, v, out));
    } else if (typeof value === 'object' && !(value instanceof Date)) {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => flatten(`${prefix}[${k}]`, v, out));
    } else if (typeof value === 'boolean') {
        out.push([prefix, value ? '1' : '0']);
    } else {
        out.push([prefix, value instanceof Date ? value.toISOString() : String(value)]);
    }
}

export function toQueryString(query: Record<string, unknown>): string {
    const out: [string, string][] = [];
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        flatten(k, v, out);
    });
    return out.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

export function hasFiles(value: unknown): boolean {
    if (value instanceof Blob || value instanceof FileList) return true;
    if (Array.isArray(value)) return value.some(hasFiles);
    if (value && typeof value === 'object' && !(value instanceof Date)) return Object.values(value).some(hasFiles);
    return false;
}

function appendFormData(form: FormData, key: string, value: unknown) {
    if (value === undefined) return;
    if (value === null) {
        form.append(key, '');
    } else if (value instanceof Blob) {
        form.append(key, value);
    } else if (value instanceof FileList) {
        Array.from(value).forEach((file, i) => form.append(`${key}[${i}]`, file));
    } else if (value instanceof Date) {
        form.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
        value.forEach((v, i) => appendFormData(form, `${key}[${i}]`, v));
    } else if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => appendFormData(form, `${key}[${k}]`, v));
    } else if (typeof value === 'boolean') {
        form.append(key, value ? '1' : '0');
    } else {
        form.append(key, String(value));
    }
}

/** Object → multipart FormData, with the same bracket notation Inertia used (a[b][0]). */
export function toFormData(data: Record<string, unknown>): FormData {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => appendFormData(form, k, v));
    return form;
}

// ─── CSRF ────────────────────────────────────────────────────────────────────

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

let csrfPromise: Promise<void> | null = null;

/** GET /sanctum/csrf-cookie once per page load (or again after a 419). */
export function ensureCsrfCookie(force = false): Promise<void> {
    if (!force && csrfPromise) return csrfPromise;
    if (!force && readCookie('XSRF-TOKEN')) {
        csrfPromise = Promise.resolve();
        return csrfPromise;
    }

    csrfPromise = fetch(backendUrl('/sanctum/csrf-cookie'), {
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
        .then(() => undefined)
        .catch(() => {
            csrfPromise = null;
        });

    return csrfPromise;
}

// ─── Transport ───────────────────────────────────────────────────────────────

interface RawResponse {
    status: number;
    body: ApiEnvelope;
}

function send(method: HttpMethod, url: string, body: XMLHttpRequestBodyInit | null, headers: Record<string, string>, options: RequestOptions): Promise<RawResponse> {
    // XMLHttpRequest instead of fetch: it reports upload progress (Inertia's `progress`).
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method.toUpperCase(), url, true);
        xhr.withCredentials = true;
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

        if (options.onUploadProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                options.onUploadProgress?.({
                    loaded: event.loaded,
                    total: event.lengthComputable ? event.total : undefined,
                    percentage: event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : undefined,
                });
            };
        }

        const onAbort = () => xhr.abort();
        options.signal?.addEventListener('abort', onAbort, { once: true });

        xhr.onload = () => {
            options.signal?.removeEventListener('abort', onAbort);
            let parsed: ApiEnvelope;
            try {
                parsed = xhr.responseText ? JSON.parse(xhr.responseText) : { success: xhr.status < 400 };
            } catch {
                parsed = { success: false, message: xhr.status >= 500 ? 'Terjadi kesalahan pada server.' : 'Respons server tidak valid.' };
            }
            resolve({ status: xhr.status, body: parsed });
        };
        xhr.onerror = () => reject(new NetworkError());
        xhr.onabort = () => reject(new DOMException('Request aborted', 'AbortError'));

        xhr.send(body);
    });
}

/**
 * Perform an API request and return the parsed envelope.
 * Throws ApiError for HTTP errors (4xx/5xx) and NetworkError when offline.
 */
export async function request<T = unknown>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
    let effectiveMethod = method;
    const url = apiUrl(path, method === 'get' ? options.query ?? (options.data as Record<string, unknown> | undefined) : options.query);

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };

    let body: XMLHttpRequestBodyInit | null = null;

    if (method !== 'get' && options.data !== undefined) {
        const data = options.data;
        if (data instanceof FormData) {
            body = data;
        } else if (options.forceFormData || hasFiles(data)) {
            body = toFormData((data ?? {}) as Record<string, unknown>);
        } else {
            body = JSON.stringify(data);
            headers['Content-Type'] = 'application/json';
        }

        // PHP only parses multipart bodies on POST: spoof PUT/PATCH/DELETE (Laravel's _method).
        if (body instanceof FormData && method !== 'post') {
            body.append('_method', method.toUpperCase());
            effectiveMethod = 'post';
        }
    }

    if (method !== 'get') {
        await ensureCsrfCookie();
    }

    const attempt = async (): Promise<RawResponse> => {
        const xsrf = readCookie('XSRF-TOKEN');
        const finalHeaders = method !== 'get' && xsrf ? { ...headers, 'X-XSRF-TOKEN': xsrf } : headers;
        return send(effectiveMethod, url, body, finalHeaders, options);
    };

    let response = await attempt();

    // 419: CSRF token expired (session timed out) → refresh it once and retry.
    if (response.status === 419) {
        await ensureCsrfCookie(true);
        response = await attempt();
    }

    if (response.status >= 400) {
        throw new ApiError(response.status, response.body);
    }

    return response.body as ApiEnvelope<T>;
}

export const api = {
    request,
    get: <T = unknown>(path: string, query?: Record<string, unknown>, options: Omit<RequestOptions, 'query'> = {}) =>
        request<T>('get', path, { ...options, query }),
    post: <T = unknown>(path: string, data?: unknown, options: RequestOptions = {}) => request<T>('post', path, { ...options, data }),
    put: <T = unknown>(path: string, data?: unknown, options: RequestOptions = {}) => request<T>('put', path, { ...options, data }),
    patch: <T = unknown>(path: string, data?: unknown, options: RequestOptions = {}) => request<T>('patch', path, { ...options, data }),
    delete: <T = unknown>(path: string, data?: unknown, options: RequestOptions = {}) => request<T>('delete', path, { ...options, data }),
};

/** First message of each field — the shape Inertia exposed as `errors`. */
export function firstErrors(errors: ValidationErrors | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    Object.entries(errors ?? {}).forEach(([key, messages]) => {
        out[key] = Array.isArray(messages) ? String(messages[0] ?? '') : String(messages);
    });
    return out;
}

/** Human message of any thrown request error. */
export function errorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
    if (error instanceof ApiError || error instanceof NetworkError) return error.message || fallback;
    if (error instanceof Error && error.name !== 'AbortError') return error.message || fallback;
    return fallback;
}
