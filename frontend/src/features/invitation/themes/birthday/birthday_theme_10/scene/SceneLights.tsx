import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { QualitySettings } from '../lib/device';
import { rigState } from './core/rigState';

/** Direction *towards* the sun: late-afternoon light from the west, high enough for short soft shadows. */
export const SUN_DIRECTION = new THREE.Vector3(-0.62, 0.92, 0.36).normalize();

/** Soft image-based fill so plastic and painted surfaces get gentle highlights. */
function SoftEnvironment() {
    const gl = useThree((s) => s.gl);
    const scene = useThree((s) => s.scene);
    useEffect(() => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const room = new RoomEnvironment();
        const env = pmrem.fromScene(room, 0.04).texture;
        room.dispose();
        scene.environment = env;
        scene.environmentIntensity = 0.38;
        return () => {
            scene.environment = null;
            env.dispose();
            pmrem.dispose();
        };
    }, [gl, scene]);
    return null;
}

export function SceneLights({ quality }: { quality: QualitySettings }) {
    const light = useRef<THREE.DirectionalLight>(null!);
    const scene = useThree((s) => s.scene);
    const span = useRef(0);
    const work = useMemo(() => {
        const forward = SUN_DIRECTION.clone().negate();
        const right = new THREE.Vector3(0, 1, 0).cross(forward).normalize();
        const up = forward.clone().cross(right).normalize();
        return { forward, right, up, snapped: new THREE.Vector3() };
    }, []);

    useEffect(() => {
        const target = light.current.target;
        scene.add(target);
        return () => {
            scene.remove(target);
        };
    }, [scene]);

    useFrame(() => {
        const l = light.current;
        const s = rigState.shadowSpan;
        const cam = l.shadow.camera;
        if (Math.abs(span.current - s) > 0.05) {
            cam.left = -s;
            cam.right = s;
            cam.top = s;
            cam.bottom = -s;
            cam.updateProjectionMatrix();
            span.current = s;
        }
        // Snap the frustum centre to whole shadow-map texels so shadows don't shimmer while travelling.
        const texel = (2 * s) / quality.shadowMapSize;
        const f = rigState.focus;
        const x = Math.round(f.dot(work.right) / texel) * texel;
        const y = Math.round(f.dot(work.up) / texel) * texel;
        work.snapped.copy(work.right).multiplyScalar(x).addScaledVector(work.up, y).addScaledVector(work.forward, f.dot(work.forward));
        l.target.position.copy(work.snapped);
        l.position.copy(work.snapped).addScaledVector(SUN_DIRECTION, 45);
        l.target.updateMatrixWorld();
    });

    return (
        <>
            <SoftEnvironment />
            <hemisphereLight args={['#dff3ff', '#f5ddb4', 1.25]} />
            <ambientLight intensity={0.12} />
            <directionalLight
                ref={light}
                color="#fff1d8"
                intensity={2.3}
                castShadow={quality.shadows}
                shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
                shadow-bias={-0.0004}
                shadow-normalBias={0.035}
                shadow-radius={5}
                shadow-camera-near={5}
                shadow-camera-far={100}
            />
        </>
    );
}
