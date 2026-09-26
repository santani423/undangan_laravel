// VITE_APP_NAME is baked in at build time and has shipped as the framework's "Laravel" placeholder
// before, which then ended up in every page title Google indexed.
const envAppName = import.meta.env.VITE_APP_NAME;
const appName = envAppName && envAppName !== 'Laravel' ? envAppName : 'Undesia';

// Shared by the browser (app.tsx) and SSR (ssr.jsx) entries so both render the same <title>.
// Titles that already carry the brand (e.g. the landing page's SEO title) are used as-is.
export const pageTitle = (title: string) => (!title ? appName : title.includes(appName) ? title : `${title} - ${appName}`);
