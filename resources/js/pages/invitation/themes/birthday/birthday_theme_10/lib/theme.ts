/** Toy World colours, shared by the CSS tokens (birthday-theme-10.css) and the 3D palette (scene/core/materials.ts). */
export const THEME_COLORS = {
    sky: '#7cc7f0',
    coral: '#ff7b84',
    butter: '#ffd166',
    mint: '#7fdcb0',
    lavender: '#b9a6f2',
    cream: '#fff6e5',
    ink: '#3b3355',
} as const;

const FONT_ID = 'bt10-font';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap';

let fontsReady: Promise<void> = Promise.resolve();

/**
 * Installs the theme's Google Fonts stylesheet and returns the cleanup. 3D
 * labels (scene/ToyText.tsx) wait for `whenFontsReady()` so their Canvas2D
 * glyphs are drawn in Fredoka rather than a fallback face.
 */
export function installFonts(): () => void {
    if (document.getElementById(FONT_ID)) return () => {};
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    fontsReady = new Promise<void>((resolve) => {
        link.onload = () => resolve();
        link.onerror = () => resolve();
        // Never hold labels back for long on a slow or blocked font CDN.
        window.setTimeout(resolve, 4000);
    });
    document.head.appendChild(link);
    return () => link.remove();
}

export function whenFontsReady(): Promise<void> {
    return fontsReady;
}
