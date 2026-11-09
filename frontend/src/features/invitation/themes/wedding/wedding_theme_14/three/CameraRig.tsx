import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { INTRO_OFFSET } from '../lib/camera';
import { journey } from '../lib/journey';
import { SCENES } from '../lib/scenes';
import { CameraPath } from './cameraPath';

/** Shared look-at point (read by the sun to centre its shadow frustum). */
export const cameraTarget = new THREE.Vector3();

const introPos = new THREE.Vector3(...INTRO_OFFSET.position);
const introTgt = new THREE.Vector3(...INTRO_OFFSET.target);

/**
 * Drives the one camera from journey.progress. Also:
 *  - eases the cover "pull-back" offset away when the invitation opens
 *  - adds a very small pointer parallax on desktop
 *  - shifts the projection (view offset) so the scene's focal point sits beside the open panel,
 *    or above the bottom sheet on phones, instead of underneath it.
 */
export function CameraRig({ isMobile }: { isMobile: boolean }) {
    const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
    const size = useThree((s) => s.size);
    const path = useMemo(() => new CameraPath(), []);
    const pos = useMemo(() => new THREE.Vector3(), []);
    const tgt = useMemo(() => new THREE.Vector3(), []);
    const right = useMemo(() => new THREE.Vector3(), []);
    const state = useMemo(() => ({ px: 0, py: 0, offX: 0, offY: 0, fov: 50, first: true }), []);
    const smoothPos = useMemo(() => new THREE.Vector3(), []);
    const smoothTgt = useMemo(() => new THREE.Vector3(), []);

    useEffect(() => {
        camera.near = 0.1;
        camera.far = 900;
        camera.updateProjectionMatrix();
        return () => camera.clearViewOffset();
    }, [camera]);

    useFrame((_, dt) => {
        const p = journey.progress;
        path.sample(p, pos, tgt, journey.reducedMotion);

        // cover pull-back
        pos.addScaledVector(introPos, journey.intro);
        tgt.addScaledVector(introTgt, journey.intro);

        // pointer parallax (damped; off for reduced motion / touch)
        const k = 1 - Math.exp(-dt * 2.5);
        const allowParallax = !journey.reducedMotion && !isMobile;
        state.px += ((allowParallax ? journey.pointerX : 0) - state.px) * k;
        state.py += ((allowParallax ? journey.pointerY : 0) - state.py) * k;
        right.subVectors(tgt, pos).cross(camera.up).normalize();
        pos.addScaledVector(right, state.px * 0.22);
        pos.y += state.py * 0.1;

        pos.y = Math.max(pos.y, 0.6); // never dip into the ground

        // Critically-damped follow on top of the scrubbed path: removes any residual jitter from
        // wheel/trackpad bursts without adding noticeable lag. Large jumps (restart) snap instantly.
        const kp = 1 - Math.exp(-dt * 9);
        if (state.first || journey.reducedMotion || smoothPos.distanceTo(pos) > 25) {
            smoothPos.copy(pos);
            smoothTgt.copy(tgt);
        } else {
            smoothPos.lerp(pos, kp);
            smoothTgt.lerp(tgt, kp);
        }
        camera.position.copy(smoothPos);
        camera.lookAt(smoothTgt);
        cameraTarget.copy(smoothTgt);

        // focal shift beside panels
        let side: 'left' | 'right' | 'center' = 'center';
        for (const s of SCENES) {
            if (p >= s.panel.in && p <= s.panel.out && !journey.hiddenPanels.has(s.id)) side = s.panel.side;
        }
        const W = size.width;
        const H = size.height;
        let tx = 0;
        let ty = 0;
        if (isMobile) {
            ty = side === 'center' || journey.intro > 0.5 ? 0 : H * 0.2;
        } else {
            tx = side === 'right' ? W * 0.16 : side === 'left' ? -W * 0.16 : 0;
        }
        const ko = state.first ? 1 : 1 - Math.exp(-dt * 2.2);
        state.offX += (tx - state.offX) * ko;
        state.offY += (ty - state.offY) * ko;
        const aspect = W / H;
        const fovTarget = aspect < 0.8 ? 64 : aspect < 1.2 ? 56 : 48;
        state.fov += (fovTarget - state.fov) * (state.first ? 1 : ko);
        state.first = false;
        if (Math.abs(camera.fov - state.fov) > 0.01) camera.fov = state.fov;
        camera.setViewOffset(W, H, state.offX, state.offY, W, H);
        camera.updateProjectionMatrix();
    });

    return null;
}
