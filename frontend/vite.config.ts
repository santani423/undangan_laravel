import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

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
 * at VITE_API_BASE_URL (e.g. https://be.undesia.com/api/v1). See docs/DEPLOYMENT.md.
 */
const BACKEND_PATHS = ['/api', '/sanctum', '/storage', '/auth/google', '/verify-email', '/seo', '/images/theme-covers', '/audio'];

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'];

/**
 * Proxy options for one backend path.
 *
 * Local backend (`php artisan serve`): keep the Host header (changeOrigin: false)
 * so Laravel generates URLs for localhost:5173.
 *
 * Remote backend (e.g. https://be.undesia.com): the Host header MUST be the
 * remote host. Node derives the TLS SNI from it, and a CDN that receives
 * SNI "localhost" aborts the handshake ("tlsv1 alert internal error", SSL alert
 * number 80). Cookie domains are stripped so the session/XSRF cookies the
 * remote sets land on localhost:5173.
 */
function proxyOptions(target: string): ProxyOptions {
    const isLocal = LOCAL_HOSTS.includes(new URL(target).hostname);

    const options: ProxyOptions = isLocal
        ? { target, changeOrigin: false }
        : { target, changeOrigin: true, secure: true, cookieDomainRewrite: { '*': '' } };

    // Backend unreachable (e.g. `php artisan serve` not running): answer 502 with a
    // JSON body the SPA's error page can show, instead of Vite's empty 500.
    // Registered before Vite's own handler, which then only logs.
    options.configure = (proxy) => {
        proxy.on('error', (err, _req, res) => {
            if (!('writeHead' in res) || res.headersSent || res.writableEnded) return;
            const code = (err as NodeJS.ErrnoException).code ?? err.message;
            const hint = isLocal ? 'Jalankan "php artisan serve" di root project (port 8000).' : 'Periksa VITE_DEV_BACKEND_URL di frontend/.env.';
            res.writeHead(502, { 'Content-Type': 'application/json' }).end(
                JSON.stringify({
                    success: false,
                    message: `Backend ${target} tidak bisa dihubungi.`,
                    debug: {
                        exception: `Vite proxy: ${code}`,
                        message: `Backend ${target} tidak bisa dihubungi. ${hint}`,
                        file: 'frontend/vite.config.ts',
                        line: 0,
                        trace: [],
                    },
                }),
            );
        });
    };

    return options;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backend = (env.VITE_DEV_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 5173,
            proxy: Object.fromEntries(BACKEND_PATHS.map((path) => [path, proxyOptions(backend)])),
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
