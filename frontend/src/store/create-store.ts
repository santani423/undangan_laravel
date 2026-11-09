import { useSyncExternalStore } from 'react';

/**
 * Minimal external store (no extra dependency): get/set/subscribe plus a
 * React hook built on useSyncExternalStore. Selectors must return values
 * that are stable between renders (a slice of the state, not a new object).
 */
export interface Store<T> {
    get(): T;
    set(next: T | ((previous: T) => T)): void;
    subscribe(listener: () => void): () => void;
    use<S = T>(selector?: (state: T) => S): S;
}

export function createStore<T>(initial: T): Store<T> {
    let state = initial;
    const listeners = new Set<() => void>();

    const store: Store<T> = {
        get: () => state,
        set(next) {
            const value = typeof next === 'function' ? (next as (previous: T) => T)(state) : next;
            if (Object.is(value, state)) return;
            state = value;
            listeners.forEach((listener) => listener());
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        use<S = T>(selector?: (state: T) => S): S {
            const select = selector ?? ((s: T) => s as unknown as S);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useSyncExternalStore(store.subscribe, () => select(state), () => select(state));
        },
    };

    return store;
}
