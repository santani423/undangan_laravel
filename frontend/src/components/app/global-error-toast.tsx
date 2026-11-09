import { setGlobalError, useGlobalError } from '@/store/page';
import { useEffect } from 'react';

/**
 * Last-resort message for failures no page handles itself (network down,
 * unexpected errors during a submit). Page flash messages are still shown by
 * the pages, exactly as before.
 */
export function GlobalErrorToast() {
    const message = useGlobalError();

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setGlobalError(null), 6000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    return (
        <div role="alert" className="fixed right-4 bottom-4 z-[2147483646] max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <p className="flex-1">{message}</p>
                <button type="button" onClick={() => setGlobalError(null)} className="text-red-400 hover:text-red-600" aria-label="Tutup">
                    ×
                </button>
            </div>
        </div>
    );
}
