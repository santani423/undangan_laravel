import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { envState } from '../envState';
import { MOON_DIR } from '../layout';

/**
 * Deliberately small light rig: sky/ground hemisphere fill, cool moonlight,
 * and one warm "lantern" light that travels with the current scene.
 * Everything else that glows is emissive + halo sprites (no extra real-time lights).
 */
export function Lighting() {
    const scene = useThree((s) => s.scene);
    const warm = useRef<THREE.PointLight>(null);
    const moon = useRef<THREE.DirectionalLight>(null);

    useLayoutEffect(() => {
        scene.fog = new THREE.Fog(envState.fog.clone(), envState.fogNear, envState.fogFar);
        scene.background = envState.fog.clone();
        return () => {
            scene.fog = null;
            scene.background = null;
        };
    }, [scene]);

    useFrame(({ clock }) => {
        const fog = scene.fog as THREE.Fog | null;
        if (fog) {
            fog.color.copy(envState.fog);
            fog.near = envState.fogNear;
            fog.far = envState.fogFar;
        }
        (scene.background as THREE.Color | null)?.copy(envState.fog);
        const t = clock.elapsedTime;
        if (warm.current) {
            warm.current.position.copy(envState.light);
            warm.current.intensity = envState.lightIntensity * (1 + Math.sin(t * 6.3) * 0.035 + Math.sin(t * 11.1) * 0.025);
        }
        if (moon.current) moon.current.intensity = 0.75 * envState.moon;
    });

    return (
        <>
            <hemisphereLight args={['#a3a6e6', '#2f2745', 1.05]} />
            <directionalLight ref={moon} color="#c7dcff" intensity={0.8} position={[MOON_DIR[0] * 60, MOON_DIR[1] * 60, MOON_DIR[2] * 60]} />
            <pointLight ref={warm} color="#ffc983" intensity={30} distance={24} decay={1.6} />
        </>
    );
}
