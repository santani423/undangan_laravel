import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastTone } from './contexts';

interface Toast {
    id: number;
    message: string;
    tone: ToastTone;
}

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

/** Small polite notifications (copy confirmations, form feedback). */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(1);
    const timers = useRef(new Set<number>());

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((timer) => window.clearTimeout(timer));
    }, []);

    const notify = useCallback((message: string, tone: ToastTone = 'success') => {
        const id = nextId.current++;
        setToasts((current) => [...current.slice(-2), { id, message, tone }]);
        const timer = window.setTimeout(() => {
            timers.current.delete(timer);
            setToasts((current) => current.filter((t) => t.id !== id));
        }, 2800);
        timers.current.add(timer);
    }, []);

    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="wt16-toasts" role="status" aria-live="polite">
                {toasts.map((toast) => {
                    const Icon = ICONS[toast.tone];
                    return (
                        <div key={toast.id} className="wt16-toast" data-tone={toast.tone}>
                            <Icon aria-hidden="true" size={16} />
                            <span>{toast.message}</span>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
