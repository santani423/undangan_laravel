import type { ThreeEvent } from '@react-three/fiber';

/** Pointer cursor feedback for clickable 3D objects. */
export const hoverCursor = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
        document.body.style.cursor = '';
    },
};
