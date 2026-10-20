import type { ThreeEvent } from '@react-three/fiber';

const UI_SELECTOR = '[data-ui], .wt15-panel, button, a, input, textarea, select, label, nav, header, dialog, [role="dialog"]';

/**
 * Pointer events reach the canvas from the whole theme root (eventSource = .wt15).
 * Only treat them as 3D interactions when the pointer is over empty space,
 * never over readable HTML content or controls.
 */
export function isFreeSpace(e: ThreeEvent<PointerEvent | MouseEvent>) {
    const target = e.nativeEvent.target as Element | null;
    return !target?.closest?.(UI_SELECTOR);
}

let hoverCount = 0;
export function setHoverCursor(on: boolean) {
    hoverCount = Math.max(0, hoverCount + (on ? 1 : -1));
    document.body.classList.toggle('wt15-3d-hover', hoverCount > 0);
}

export function resetHoverCursor() {
    hoverCount = 0;
    document.body.classList.remove('wt15-3d-hover');
}
