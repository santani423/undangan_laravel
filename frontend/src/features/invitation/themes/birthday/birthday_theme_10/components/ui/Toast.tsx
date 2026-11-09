import { CircleAlert } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { PackIcon } from './PackIcon';

type ToastTone = 'success' | 'info' | 'error';
interface ToastItem {
    id: number;
    message: string;
    tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => undefined);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const nextId = useRef(1);
    const timers = useRef(new Set<number>());

    const show = useCallback((message: string, tone: ToastTone = 'success') => {
        const id = nextId.current++;
        setItems((list) => [...list.slice(-2), { id, message, tone }]);
        const timer = window.setTimeout(() => {
            setItems((list) => list.filter((t) => t.id !== id));
            timers.current.delete(timer);
        }, 3200);
        timers.current.add(timer);
    }, []);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((t) => window.clearTimeout(t));
    }, []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className="bt10-toasts" role="status" aria-live="polite">
                {items.map((t) => (
                    <div key={t.id} className="bt10-toast">
                        {t.tone === 'error' ? (
                            <CircleAlert size={18} aria-hidden="true" className="bt10-text-coral" />
                        ) : (
                            <PackIcon name="check" size={18} className="bt10-text-mint" />
                        )}
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
