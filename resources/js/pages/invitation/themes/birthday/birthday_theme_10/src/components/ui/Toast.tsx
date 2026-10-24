import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
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
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-pop-in items-center gap-2 rounded-full bg-toy-ink px-4 py-2.5 font-display text-base font-medium text-white shadow-lg"
          >
            {t.tone === 'error' ? (
              <CircleAlert size={18} aria-hidden="true" className="text-toy-coral" />
            ) : (
              <PackIcon name="check" size={18} className="text-toy-mint" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
