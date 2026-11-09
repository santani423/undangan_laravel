import { appStore } from '@/store/app';
import { authStore } from '@/store/auth';
import { pageStore } from '@/store/page';
import { createContext } from 'react';
import type { Page, SharedPageProps } from './types';

/** Shared props from the stores (used outside a routed page, e.g. before the first load). */
export function sharedProps(): SharedPageProps {
    const app = appStore.get();
    const page = pageStore.get();

    return {
        name: app.name,
        quote: app.quote,
        auth: { user: authStore.get().user },
        flash: page.flash,
        errors: page.errors,
    };
}

export const PageContext = createContext<Page | null>(null);

/** Latest rendered page, so router callbacks (onSuccess(page)) can hand it out. */
let currentPage: Page | null = null;

export function setCurrentPage(page: Page): void {
    currentPage = page;
}

export function getCurrentPage(): Page {
    if (currentPage) return currentPage;
    const url = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    return { props: sharedProps(), url, component: '' };
}
