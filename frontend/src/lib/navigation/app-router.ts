import type { createBrowserRouter } from 'react-router';

/** The React Router data router of the app (created in src/routes/index.tsx). */
export type AppRouter = ReturnType<typeof createBrowserRouter>;

let instance: AppRouter | null = null;

export function setAppRouter(router: AppRouter): void {
    instance = router;
}

export function getAppRouter(): AppRouter {
    if (!instance) throw new Error('The app router is not created yet.');
    return instance;
}

/** State attached to history entries by the navigation layer. */
export interface NavigationState {
    /** Keep the flash message set by the request that caused this navigation. */
    keepFlash?: boolean;
    /** Keep the page component mounted for a same-page visit. */
    preserveState?: boolean;
    /** Changes on every fresh visit so the page remounts (Inertia's default). */
    visitId?: number;
}
