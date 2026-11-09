import { useAuthUser } from '@/store/auth';
import { appStore } from '@/store/app';
import { useErrors, useFlash } from '@/store/page';
import { useContext, useMemo } from 'react';
import { PageContext } from './page-context';
import type { Page } from './types';

/**
 * The current page: its props (API data + shared props), URL and component
 * name — same shape as Inertia's usePage(). Outside a routed page it still
 * returns the shared props.
 */
export function usePage<P = Record<string, unknown>>(): Page<P> {
    const page = useContext(PageContext);
    const user = useAuthUser();
    const app = appStore.use();
    const flash = useFlash();
    const errors = useErrors();

    return useMemo(() => {
        if (page) return page as Page<P>;

        return {
            props: { name: app.name, quote: app.quote, auth: { user }, flash, errors } as Page<P>['props'],
            url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
            component: '',
        };
    }, [page, user, app, flash, errors]);
}
