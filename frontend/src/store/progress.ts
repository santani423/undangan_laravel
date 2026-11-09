import { createStore } from './create-store';

/** Number of API mutations in flight (drives the top progress bar, like Inertia's). */
export const pendingRequests = createStore(0);

export const usePendingRequests = () => pendingRequests.use();

export function trackRequest<T>(promise: Promise<T>): Promise<T> {
    pendingRequests.set((n) => n + 1);
    return promise.finally(() => pendingRequests.set((n) => Math.max(0, n - 1)));
}
