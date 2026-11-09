import { useEffect } from 'react';

const TEXT_TYPES = new Set(['text', 'email', 'tel', 'number', 'search', 'url', 'password']);

const isTextField = (el: EventTarget | null) => el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && TEXT_TYPES.has(el.type));

/**
 * Flags `body[data-typing]` while a text field is focused so fixed chrome can
 * step aside on small screens (the on-screen keyboard leaves little room).
 */
export function useTypingState() {
    useEffect(() => {
        const onIn = (e: FocusEvent) => {
            if (isTextField(e.target)) document.body.dataset.typing = 'true';
        };
        const onOut = (e: FocusEvent) => {
            if (isTextField(e.target)) delete document.body.dataset.typing;
        };
        document.addEventListener('focusin', onIn);
        document.addEventListener('focusout', onOut);
        return () => {
            document.removeEventListener('focusin', onIn);
            document.removeEventListener('focusout', onOut);
            delete document.body.dataset.typing;
        };
    }, []);
}
