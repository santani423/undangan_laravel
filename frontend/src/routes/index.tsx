import { FullScreenLoader } from '@/components/app/full-screen-loader';
import { GlobalErrorToast } from '@/components/app/global-error-toast';
import { ProgressBar } from '@/components/app/progress-bar';
import { setAppRouter, type NavigationState } from '@/lib/navigation/app-router';
import { PageContext, setCurrentPage } from '@/lib/navigation/page-context';
import type { Page } from '@/lib/navigation/types';
import ErrorPage from '@/pages/error';
import { appStore } from '@/store/app';
import { useAuthUser } from '@/store/auth';
import { clearErrors, clearFlash, showErrorPage, useErrorPage, useErrors, useFlash } from '@/store/page';
import { useMemo } from 'react';
import {
    createBrowserRouter,
    isRouteErrorResponse,
    Outlet,
    ScrollRestoration,
    useLoaderData,
    useLocation,
    useParams,
    useRouteError,
    type RouteObject,
} from 'react-router';
import { pageRoutes, redirectRoutes, type PageRoute } from './definitions';
import { pageLoader, redirectLoader, type PageLoaderData, type RouteErrorData } from './loaders';

/**
 * Renders a page with the props Inertia used to give it: shared props + its
 * API data. The page bundle was already loaded by the route loader.
 */
function PageRenderer({ route }: { route: PageRoute }) {
    const { data, name, Component } = useLoaderData() as PageLoaderData;
    const location = useLocation();
    const params = useParams();
    const user = useAuthUser();
    const app = appStore.use();
    const flash = useFlash();
    const errors = useErrors();
    const errorPage = useErrorPage();

    const page = useMemo<Page>(() => {
        const query = new URLSearchParams(location.search);
        const extra = route.props?.({ data, params, query, flash }) ?? {};
        return {
            props: { name: app.name, quote: app.quote, auth: { user }, ...data, ...extra, flash, errors },
            url: location.pathname + location.search,
            component: name,
        };
    }, [route, data, params, location.pathname, location.search, user, app, flash, errors, name]);

    setCurrentPage(page);

    // Fresh visits remount the page (fresh local state); same-page reloads after
    // a submit or a preserveState visit keep it mounted — Inertia's semantics.
    const state = (location.state ?? {}) as NavigationState;
    const key = state.preserveState ? location.pathname : `${location.pathname}#${state.visitId ?? 0}`;

    if (errorPage) {
        return <ErrorPage status={errorPage.status} debug={errorPage.debug} />;
    }

    return (
        <PageContext.Provider value={page}>
            <Component key={key} {...page.props} />
        </PageContext.Provider>
    );
}

function RouteErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        const body = (error.data ?? {}) as RouteErrorData;
        return <ErrorPage status={body.status ?? error.status} debug={body.debug} />;
    }

    if (import.meta.env.DEV && error instanceof Error) {
        console.error(error);
        return (
            <ErrorPage
                status={500}
                debug={{ exception: error.name, message: error.message, file: 'frontend', line: 0, trace: (error.stack ?? '').split('\n').slice(1, 11) }}
            />
        );
    }

    return <ErrorPage status={500} />;
}

function RootLayout() {
    return (
        <>
            <ProgressBar />
            <Outlet />
            <GlobalErrorToast />
            <ScrollRestoration />
        </>
    );
}

export function createAppRouter() {
    const children: RouteObject[] = [
        ...pageRoutes.map<RouteObject>((route) => ({
            path: route.path,
            loader: pageLoader(route),
            element: <PageRenderer route={route} />,
            errorElement: <RouteErrorBoundary />,
        })),
        ...redirectRoutes.map<RouteObject>((route) => ({
            path: route.path,
            loader: redirectLoader(route),
            element: <FullScreenLoader />,
            errorElement: <RouteErrorBoundary />,
        })),
        { path: '*', element: <ErrorPage status={404} /> },
    ];

    const router = createBrowserRouter([
        {
            element: <RootLayout />,
            hydrateFallbackElement: <FullScreenLoader />,
            errorElement: <RouteErrorBoundary />,
            children,
        },
    ]);

    // Back/forward navigation starts clean, like a fresh visit.
    router.subscribe((state) => {
        if (state.historyAction === 'POP' && state.navigation.state === 'loading') {
            clearFlash();
            clearErrors();
            showErrorPage(null);
        }
    });

    setAppRouter(router);

    return router;
}
