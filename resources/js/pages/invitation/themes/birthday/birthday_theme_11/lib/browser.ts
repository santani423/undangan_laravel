/* Browser-only helpers: storage, clipboard and fonts. Each one fails softly. */

/** localStorage read that never throws (private mode, blocked storage). */
export function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

/** Reports whether the value was really persisted. */
export function writeJson(key: string, value: unknown): boolean {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/** Copies text with the async Clipboard API, falling back to execCommand for older/insecure contexts. */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall through to the legacy path
    }
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    } catch {
        return false;
    }
}

const FONT_ID = 'bt11-font';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap';
let stylesheetReady: Promise<void> = Promise.resolve();

/** Installs the Fredoka + Nunito stylesheet and returns the cleanup. */
export function installFonts(): () => void {
    if (document.getElementById(FONT_ID)) return () => {};
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    stylesheetReady = new Promise<void>((resolve) => {
        link.onload = () => resolve();
        link.onerror = () => resolve();
        window.setTimeout(resolve, 4000);
    });
    document.head.appendChild(link);
    return () => link.remove();
}

/**
 * Resolves once the faces used by the canvas-drawn 3D artwork are loaded, so labels are
 * painted in Fredoka/Nunito rather than a fallback face. Never waits more than a few seconds.
 */
export async function waitForFonts() {
    await stylesheetReady;
    if (!document.fonts?.load) return;
    const faces = ['700 64px Fredoka', '600 64px Fredoka', '800 32px Nunito', '700 32px Nunito'];
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2500));
    await Promise.race([Promise.all(faces.map((f) => document.fonts.load(f))), timeout]).catch(() => {});
}
