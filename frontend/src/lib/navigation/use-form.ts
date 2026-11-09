import type { RequestProgress } from '@/services/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from './router';
import type { FormDataLike, Method, Page, VisitOptions } from './types';

type FormErrors<T> = Partial<Record<keyof T | string, string>>;
type SubmitOptions = Omit<VisitOptions, 'method' | 'data'>;

export interface FormProps<T extends object> {
    data: T;
    isDirty: boolean;
    errors: FormErrors<T>;
    hasErrors: boolean;
    processing: boolean;
    progress: RequestProgress | null;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    setData: {
        (data: T): void;
        (callback: (previous: T) => T): void;
        <K extends keyof T>(key: K, value: T[K]): void;
        (key: string, value: unknown): void;
    };
    transform: (callback: (data: T) => object) => void;
    setDefaults: {
        (): void;
        (data: Partial<T>): void;
        <K extends keyof T>(key: K, value: T[K]): void;
    };
    reset: (...fields: (keyof T)[]) => void;
    clearErrors: (...fields: (keyof T | string)[]) => void;
    setError: {
        (field: keyof T | string, message: string): void;
        (errors: FormErrors<T>): void;
    };
    submit: (method: Method, url: string, options?: SubmitOptions) => Promise<void>;
    get: (url: string, options?: SubmitOptions) => Promise<void>;
    post: (url: string, options?: SubmitOptions) => Promise<void>;
    put: (url: string, options?: SubmitOptions) => Promise<void>;
    patch: (url: string, options?: SubmitOptions) => Promise<void>;
    delete: (url: string, options?: SubmitOptions) => Promise<void>;
    cancel: () => void;
}

/** Inertia's useForm(initial) / useForm(rememberKey, initial). */
export function useForm<T extends object>(initialOrKey: T | string, maybeInitial?: T): FormProps<T> {
    const initial = (typeof initialOrKey === 'string' ? maybeInitial : initialOrKey) ?? ({} as T);

    const [defaults, setDefaultsState] = useState<T>(initial);
    const [data, setDataState] = useState<T>(initial);
    const [errors, setErrorsState] = useState<FormErrors<T>>({});
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<RequestProgress | null>(null);
    const [wasSuccessful, setWasSuccessful] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const transformRef = useRef<(data: T) => object>((d) => d);
    const cancelRef = useRef<(() => void) | null>(null);
    const recentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dataRef = useRef(data);
    dataRef.current = data;

    useEffect(() => () => {
        if (recentTimer.current) clearTimeout(recentTimer.current);
    }, []);

    const setData = useCallback((keyOrData: unknown, value?: unknown) => {
        if (typeof keyOrData === 'string') {
            setDataState((previous) => ({ ...previous, [keyOrData]: value }));
        } else if (typeof keyOrData === 'function') {
            setDataState((previous) => (keyOrData as (p: T) => T)(previous));
        } else {
            setDataState(keyOrData as T);
        }
    }, []) as FormProps<T>['setData'];

    const setDefaults = useCallback((keyOrData?: unknown, value?: unknown) => {
        if (keyOrData === undefined) {
            setDefaultsState(dataRef.current);
        } else if (typeof keyOrData === 'string') {
            setDefaultsState((previous) => ({ ...previous, [keyOrData]: value }));
        } else {
            setDefaultsState((previous) => ({ ...previous, ...(keyOrData as Partial<T>) }));
        }
    }, []) as FormProps<T>['setDefaults'];

    const reset = useCallback(
        (...fields: (keyof T)[]) => {
            if (fields.length === 0) {
                setDataState(defaults);
            } else {
                setDataState((previous) => {
                    const next = { ...previous };
                    fields.forEach((field) => {
                        next[field] = defaults[field];
                    });
                    return next;
                });
            }
        },
        [defaults],
    );

    const clearErrors = useCallback((...fields: (keyof T | string)[]) => {
        setErrorsState((previous) => {
            if (fields.length === 0) return {};
            const next = { ...previous };
            fields.forEach((field) => delete next[field as keyof T]);
            return next;
        });
    }, []);

    const setError = useCallback((fieldOrErrors: unknown, message?: string) => {
        setErrorsState((previous) =>
            typeof fieldOrErrors === 'string' ? { ...previous, [fieldOrErrors]: message } : { ...previous, ...(fieldOrErrors as FormErrors<T>) },
        );
    }, []) as FormProps<T>['setError'];

    const submit = useCallback(
        (method: Method, url: string, options: SubmitOptions = {}) => {
            const payload = transformRef.current(dataRef.current) as FormDataLike;

            return router.visit(url, {
                ...options,
                method,
                data: payload,
                onCancelToken: (token) => {
                    cancelRef.current = token.cancel;
                    options.onCancelToken?.(token);
                },
                onStart: (visit) => {
                    setProcessing(true);
                    setWasSuccessful(false);
                    setRecentlySuccessful(false);
                    options.onStart?.(visit);
                },
                onProgress: (p) => {
                    setProgress(p);
                    options.onProgress?.(p);
                },
                onSuccess: async (page: Page) => {
                    setErrorsState({});
                    setWasSuccessful(true);
                    setRecentlySuccessful(true);
                    if (recentTimer.current) clearTimeout(recentTimer.current);
                    recentTimer.current = setTimeout(() => setRecentlySuccessful(false), 2000);
                    await options.onSuccess?.(page);
                },
                onError: (errs) => {
                    setErrorsState(errs as FormErrors<T>);
                    options.onError?.(errs);
                },
                onCancel: () => {
                    options.onCancel?.();
                },
                onFinish: (visit) => {
                    setProcessing(false);
                    setProgress(null);
                    cancelRef.current = null;
                    options.onFinish?.(visit);
                },
            });
        },
        [],
    );

    const isDirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(defaults), [data, defaults]);

    return {
        data,
        isDirty,
        errors,
        hasErrors: Object.keys(errors).length > 0,
        processing,
        progress,
        wasSuccessful,
        recentlySuccessful,
        setData,
        transform: (callback) => {
            transformRef.current = callback;
        },
        setDefaults,
        reset,
        clearErrors,
        setError,
        submit,
        get: (url, options) => submit('get', url, options),
        post: (url, options) => submit('post', url, options),
        put: (url, options) => submit('put', url, options),
        patch: (url, options) => submit('patch', url, options),
        delete: (url, options) => submit('delete', url, options),
        cancel: () => cancelRef.current?.(),
    };
}
