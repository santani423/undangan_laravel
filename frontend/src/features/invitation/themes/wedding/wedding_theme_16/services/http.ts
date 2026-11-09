/** JSON request helpers for the invitation's public API (Laravel). */

export const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function newId(prefix: string): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** First validation message of a Laravel 422 response, or the response message. */
async function errorMessage(response: Response, fallback: string): Promise<string> {
    const body = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
    const first = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return first || body?.message || fallback;
}

/** POSTs JSON; resolves to `{ sample }` (true when a theme-preview invitation accepted but did not store it). */
export async function postJson(url: string, body: Record<string, unknown>, fallback: string): Promise<{ sample: boolean }> {
    let response: Response;
    try {
        response = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });
    } catch {
        throw new Error('Server tidak dapat dihubungi. Periksa koneksi internet Anda.');
    }
    if (!response.ok) throw new Error(await errorMessage(response, fallback));
    const data = (await response.json().catch(() => ({}))) as { sample?: boolean };
    return { sample: Boolean(data.sample) };
}
