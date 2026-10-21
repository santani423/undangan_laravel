import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
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

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div key={toast.id} className="toast" data-tone={toast.tone}>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
