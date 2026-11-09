import type { RequestProgress } from '@/services/api';
import type { Flash } from '@/store/page';
import type { User } from '@/types';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Props every page receives, on top of its own API data (the old Inertia shared props). */
export interface SharedPageProps {
    name: string;
    quote: { message: string; author: string };
    auth: { user: User | null };
    flash: Flash;
    errors: Record<string, string>;
    [key: string]: unknown;
}

export interface Page<P = Record<string, unknown>> {
    /** Shared props + the page's API data. */
    props: P & SharedPageProps;
    /** Current SPA URL (path + query). */
    url: string;
    /** Page component name, e.g. "customer/invitations/edit". */
    component: string;
}

export type FormDataLike = Record<string, unknown> | FormData;

export interface PendingVisit {
    url: string;
    method: Method;
    data: FormDataLike | undefined;
}

export interface VisitOptions {
    method?: Method;
    data?: FormDataLike;
    replace?: boolean;
    preserveScroll?: boolean;
    /** true keeps the page mounted (local state) on GET visits to the same page. */
    preserveState?: boolean | 'errors';
    /** Accepted for compatibility; the API always returns the whole page data. */
    only?: string[];
    except?: string[];
    headers?: Record<string, string>;
    forceFormData?: boolean;
    errorBag?: string;
    onBefore?: (visit: PendingVisit) => boolean | void;
    onStart?: (visit: PendingVisit) => void;
    onProgress?: (progress: RequestProgress) => void;
    onSuccess?: (page: Page) => void | Promise<unknown>;
    onError?: (errors: Record<string, string>) => void;
    onFinish?: (visit: PendingVisit) => void;
    onCancel?: () => void;
    onCancelToken?: (token: { cancel: () => void }) => void;
}

export interface ReloadOptions extends Omit<VisitOptions, 'method' | 'replace'> {}
