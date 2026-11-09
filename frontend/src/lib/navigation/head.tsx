import { pageTitle } from '@/lib/page-title';
import { useLayoutEffect, useState, type ReactNode } from 'react';

/**
 * Document <title> manager. Several <Head> can be mounted (layout + page);
 * the one registered last wins and the previous title comes back when it
 * unmounts. Titles go through pageTitle() ("Judul - Undesia").
 */
const stack: { id: number; title: string }[] = [];
let nextId = 0;

function applyTitle(): void {
    const top = stack[stack.length - 1];
    document.title = pageTitle(top?.title ?? '');
}

export function useDocumentTitle(title: string | undefined): void {
    const [id] = useState(() => ++nextId);

    useLayoutEffect(() => {
        if (title === undefined) return;
        stack.push({ id, title });
        applyTitle();

        return () => {
            const index = stack.findIndex((entry) => entry.id === id);
            if (index !== -1) stack.splice(index, 1);
            applyTitle();
        };
    }, [id, title]);
}

/**
 * Page head (the old Inertia <Head>): sets the document title; children such
 * as <link>/<meta> are rendered by React 19, which hoists them into <head>.
 */
export function Head({ title, children }: { title?: string; children?: ReactNode }) {
    useDocumentTitle(title);

    return children ? <>{children}</> : null;
}
