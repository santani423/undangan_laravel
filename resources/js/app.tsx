import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

// VITE_APP_NAME is baked in at build time and has shipped as the framework's "Laravel" placeholder
// before, which then ended up in every page title Google indexed.
const envAppName = import.meta.env.VITE_APP_NAME;
const appName = envAppName && envAppName !== 'Laravel' ? envAppName : 'Undesia';

createInertiaApp({
    // Titles that already carry the brand (e.g. the landing page's SEO title) are used as-is.
    title: (title) => (!title ? appName : title.includes(appName) ? title : `${title} - ${appName}`),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
