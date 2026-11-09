import { useRef, type PointerEvent } from 'react';

/**
 * Horizontal swipe detection with pointer events. Vertical drags are ignored so
 * the page keeps scrolling normally (pair with `touch-action: pan-y`).
 */
export function useSwipe(onPrev: () => void, onNext: () => void, threshold = 45) {
    const start = useRef<{ x: number; y: number; id: number } | null>(null);
    const swiped = useRef(false);

    return {
        /** True right after a swipe so the click that follows can be ignored. */
        wasSwipe: () => swiped.current,
        handlers: {
            onPointerDown(e: PointerEvent) {
                start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
                swiped.current = false;
            },
            onPointerUp(e: PointerEvent) {
                const s = start.current;
                start.current = null;
                if (!s || s.id !== e.pointerId) return;
                const dx = e.clientX - s.x;
                const dy = e.clientY - s.y;
                if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.3) {
                    swiped.current = true;
                    if (dx > 0) onPrev();
                    else onNext();
                }
            },
            onPointerCancel() {
                start.current = null;
            },
        },
    };
}
