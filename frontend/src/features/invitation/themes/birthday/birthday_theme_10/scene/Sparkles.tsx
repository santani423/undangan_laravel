import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { toyAssets } from '../lib/assets';
import { seededRandom } from '../lib/math';
import type { Vec3 } from '../lib/world';
import { fallbackSoftParticle, useSafeTexture } from './core/criticalTextures';

interface SparklesProps {
    position?: Vec3;
    count?: number;
    radius?: number;
    height?: number;
    color?: string;
    size?: number;
    animate: boolean;
}

/** Restrained floating glow motes (pack soft-particle sprite) around a focal point. */
export function Sparkles({ position, count = 22, radius = 3, height = 3.5, color = '#fff1b8', size = 0.32, animate }: SparklesProps) {
    const map = useSafeTexture(toyAssets.sprites.softParticle) ?? fallbackSoftParticle();
    const ref = useRef<THREE.Points>(null!);
    const seeds = useMemo(() => {
        const rand = seededRandom(count * 13 + Math.round(radius * 10));
        return Array.from({ length: count }, () => ({
            a: rand() * Math.PI * 2,
            r: radius * (0.35 + rand() * 0.65),
            y: rand() * height,
            speed: 0.18 + rand() * 0.25,
            phase: rand() * Math.PI * 2,
        }));
    }, [count, radius, height]);

    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, height / 2, 0), radius + height);
        return g;
    }, [count, radius, height]);

    const material = useMemo(() => {
        map.colorSpace = THREE.SRGBColorSpace;
        return new THREE.PointsMaterial({
            map,
            color,
            size,
            sizeAttenuation: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.85,
        });
    }, [map, color, size]);

    useFrame(({ clock }) => {
        const t = animate ? clock.elapsedTime : 0;
        const attr = geometry.attributes.position as THREE.BufferAttribute;
        seeds.forEach((s, i) => {
            const y = (s.y + t * s.speed) % height;
            const a = s.a + Math.sin(t * 0.3 + s.phase) * 0.4;
            attr.setXYZ(i, Math.cos(a) * s.r, y, Math.sin(a) * s.r);
        });
        attr.needsUpdate = true;
        material.opacity = 0.55 + Math.sin(t * 1.3) * 0.2;
    });

    return <points ref={ref} position={position} geometry={geometry} material={material} />;
}
