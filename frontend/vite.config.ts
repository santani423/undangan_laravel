import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

/**
 * Undesia frontend (standalone React SPA).
 *
 * Development: `npm run dev` serves the SPA on http://localhost:5173 and proxies
 * the backend paths below to Laravel (`php artisan serve`, VITE_DEV_BACKEND_URL),
 * so the browser sees a single origin — session cookie, XSRF token and every
 * absolute URL Laravel generates (storage files, theme covers, default music,
 * RSVP endpoints) all resolve through this dev server. The Host header is kept
 * (changeOrigin: false) so Laravel builds those URLs for localhost:5173.
 *
 * Production: `npm run build` → dist/, deployed on its own host; the API lives
 * at VITE_API_BASE_URL (e.g. https://api.undesia.com/api/v1). See docs/DEPLOYMENT.md.
 */
const BACKEND_PATHS = ['/api', '/sanctum', '/storage', '/auth/google', '/verify-email', '/seo', '/images/theme-covers', '/audio'];

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backend = env.VITE_DEV_BACKEND_URL || 'http://127.0.0.1:8000';

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 5173,
            proxy: Object.fromEntries(BACKEND_PATHS.map((path) => [path, { target: backend, changeOrigin: false }])),
        },
        preview: {
            port: 4173,
        },
        build: {
            outDir: 'dist',
            // Theme bundles (three.js scenes, large art) are big by nature; they are
            // only loaded by the public invitation viewer.
            chunkSizeWarningLimit: 4096,
        },
    };
});
