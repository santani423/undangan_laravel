import { useCallback, useEffect, useRef, type MouseEvent } from 'react';

/**
 * Drives a native <dialog> as a modal: focus trap and Esc come from the browser, a click on
 * the backdrop closes it, and focus returns to whatever opened it (or to `fallbackOpener`
 * when it was opened from the 3D world, where nothing on the page had focus).
 */
export function useNativeDialog(open: boolean, onClose: () => void, fallbackOpener?: () => HTMLElement | null) {
    const ref = useRef<HTMLDialogElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const fallbackRef = useRef(fallbackOpener);
    fallbackRef.current = fallbackOpener;

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            const active = document.activeElement;
            opener.current = active instanceof HTMLElement && active !== document.body ? active : (fallbackRef.current?.() ?? null);
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        const handleClose = () => {
            onCloseRef.current();
            const target = opener.current;
            opener.current = null;
            if (target?.isConnected) target.focus({ preventScroll: true });
        };
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, []);

    // Clicks on the ::backdrop land on the dialog element itself.
    const onBackdropClick = useCallback((e: MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
    }, []);
    const close = useCallback(() => ref.current?.close(), []);

    return { ref, onBackdropClick, close };
}
