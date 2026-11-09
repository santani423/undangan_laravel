import { forwardRef, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { router, toFrontendPath } from './router';
import type { FormDataLike, Method, VisitOptions } from './types';

type LinkOwnProps = {
    href: string;
    method?: Method | Uppercase<Method>;
    data?: FormDataLike;
    as?: ElementType;
    replace?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
    only?: string[];
    headers?: Record<string, string>;
    /** Accepted for compatibility (Inertia prefetching); no effect. */
    prefetch?: boolean | string | string[];
    onSuccess?: VisitOptions['onSuccess'];
    onError?: VisitOptions['onError'];
    onFinish?: VisitOptions['onFinish'];
    onStart?: VisitOptions['onStart'];
    children?: ReactNode;
};

export type LinkProps = LinkOwnProps & Omit<React.AllHTMLAttributes<HTMLElement>, keyof LinkOwnProps | 'as'>;

function isModifiedClick(event: MouseEvent): boolean {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * Client-side link (the old Inertia <Link>): navigates without a full page
 * load; `method="post"` etc. sends a request instead (e.g. logout).
 * Modified clicks (new tab), target="_blank" and external URLs behave natively.
 */
export const Link = forwardRef<HTMLElement, LinkProps>(function Link(
    { href, method = 'get', data, as, replace, preserveScroll, preserveState, only, headers, prefetch, onSuccess, onError, onFinish, onStart, onClick, children, ...rest },
    ref,
) {
    void prefetch;
    const visitMethod = method.toLowerCase() as Method;
    const target = toFrontendPath(href);
    const Tag: ElementType = as ?? 'a';

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        (onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
        if (event.defaultPrevented) return;

        if (visitMethod === 'get') {
            if (Tag === 'a' && (isModifiedClick(event) || rest.target === '_blank' || 'download' in rest)) return;
            if (target === null) return; // external link: let the browser follow it
        }

        event.preventDefault();
        void router.visit(href, { method: visitMethod, data, replace, preserveScroll, preserveState, only, headers, onSuccess, onError, onFinish, onStart });
    };

    if (Tag === 'a') {
        return (
            <a ref={ref as React.Ref<HTMLAnchorElement>} href={target ?? href} onClick={handleClick} {...rest}>
                {children}
            </a>
        );
    }

    return (
        <Tag ref={ref} onClick={handleClick} {...(Tag === 'button' ? { type: 'button' } : {})} {...rest}>
            {children}
        </Tag>
    );
});
