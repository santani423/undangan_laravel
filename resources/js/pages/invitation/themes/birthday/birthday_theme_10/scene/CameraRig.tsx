import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_STOPS } from '../lib/journey';
import { clamp, damp, easeInOutCubic, lerp } from '../lib/math';
import { INTRO_CAMERA } from '../lib/world';
import { journey } from '../store/journey';
import { cameraLookCurve, cameraPositionCurve, journeyToT } from './core/curves';
import { rigState } from './core/rigState';

/**
 * Screen-space framing per stop. On wide screens the subject is shifted away
 * from the HTML panel; on portrait screens it moves into the upper area above
 * the bottom panel. Values are fractions of the viewport.
 */
function framingFor(stop: number, wide: boolean) {
    const panel = CAMERA_STOPS[stop]?.panel ?? 'center';
    if (wide) return { x: panel === 'left' ? -0.17 : panel === 'right' ? 0.17 : 0, y: stop === 0 ? -0.14 : 0 };
    return { x: 0, y: stop === 0 ? -0.1 : 0.17 };
}

/**
 * The only code that moves the camera. Reads `journey` (written by the
 * ScrollTrigger hook and the intro tween), eases it in the render loop and
 * samples the position/look-target CatmullRom curves. Because the eased value
 * is a curve *parameter*, even very fast scrolling flies along the path and
 * can never cut through buildings.
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
    const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
    const size = useThree((s) => s.size);
    const pointer = useRef({ x: 0, y: 0 });
    const tmp = useMemo(
        () => ({
            pos: new THREE.Vector3(),
            look: new THREE.Vector3(),
            introPos: new THREE.Vector3(),
            introLook: new THREE.Vector3(...INTRO_CAMERA.look),
            right: new THREE.Vector3(),
            up: new THREE.Vector3(),
            forward: new THREE.Vector3(),
            parallax: new THREE.Vector2(),
            view: { x: NaN, y: NaN, w: 0, h: 0, fov: 0 },
        }),
        [],
    );

    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const onMove = (e: PointerEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    useFrame((state, rawDelta) => {
        const dt = Math.min(rawDelta, 0.1);

        // 1. Ease towards the scroll target.
        if (journey.snap || reducedMotion) journey.value = journey.target;
        else {
            journey.value = damp(journey.value, journey.target, 2.6, dt);
            if (Math.abs(journey.value - journey.target) < 0.0005) journey.value = journey.target;
        }

        // 2. Sample the journey curves.
        const t = journeyToT(journey.value);
        cameraPositionCurve.getPoint(t, tmp.pos);
        cameraLookCurve.getPoint(t, tmp.look);

        // 3. Blend in from the establishing shot (before/while opening the invitation).
        const intro = easeInOutCubic(clamp(journey.intro, 0, 1));
        if (intro < 1) {
            const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 3;
            tmp.introPos.set(INTRO_CAMERA.pos[0] + sway, INTRO_CAMERA.pos[1], INTRO_CAMERA.pos[2]);
            tmp.pos.lerpVectors(tmp.introPos, tmp.pos, intro);
            tmp.look.lerpVectors(tmp.introLook, tmp.look, intro);
        }

        // 4. Portrait screens: pull back along the view direction so subjects fit.
        const aspect = size.width / Math.max(1, size.height);
        const wide = size.width >= 768 && aspect >= 1;
        if (!wide) {
            const pull = 1 + clamp(1 - aspect, 0, 0.6) * 0.36;
            tmp.pos.sub(tmp.look).multiplyScalar(pull).add(tmp.look);
        }

        // 5. Gentle pointer parallax (fine pointers only, never with reduced motion).
        const targetX = reducedMotion ? 0 : pointer.current.x;
        const targetY = reducedMotion ? 0 : pointer.current.y;
        tmp.parallax.x = damp(tmp.parallax.x, targetX, 2, dt);
        tmp.parallax.y = damp(tmp.parallax.y, targetY, 2, dt);
        tmp.forward.subVectors(tmp.look, tmp.pos).normalize();
        tmp.right.crossVectors(tmp.forward, camera.up).normalize();
        tmp.up.crossVectors(tmp.right, tmp.forward).normalize();
        camera.position
            .copy(tmp.pos)
            .addScaledVector(tmp.right, tmp.parallax.x * 0.3)
            .addScaledVector(tmp.up, -tmp.parallax.y * 0.18);
        camera.lookAt(tmp.look);

        // 6. Framing: field of view + projection offset (subject beside / above the panel).
        const last = CAMERA_STOPS.length - 1;
        const j = clamp(journey.value, 0, last);
        const a = Math.floor(j);
        const b = Math.min(last, a + 1);
        const fa = framingFor(a, wide);
        const fb = framingFor(b, wide);
        const fx = lerp(fa.x, fb.x, j - a) * intro;
        const fy = lerp(fa.y, fb.y, j - a) * intro;
        const fov = wide ? 42 : clamp((2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(22)) / aspect) * 180) / Math.PI, 42, 68);
        const v = tmp.view;
        const w = size.width;
        const h = size.height;
        if (Math.abs(v.x - fx) > 1e-4 || Math.abs(v.y - fy) > 1e-4 || v.w !== w || v.h !== h || Math.abs(v.fov - fov) > 1e-3) {
            camera.fov = fov;
            camera.setViewOffset(w, h, fx * w, fy * h, w, h);
            v.x = fx;
            v.y = fy;
            v.w = w;
            v.h = h;
            v.fov = fov;
        }

        // 7. Let the sun's shadow frustum follow what the camera is looking at.
        rigState.focus.lerpVectors(camera.position, tmp.look, 0.72);
        rigState.shadowSpan = lerp(48, 17, intro);
    });

    return null;
}
