import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../lib/world';
import { mergeParts, type Part } from './core/geometry';
import { getMaterials, palette } from './core/materials';

const FLAG_COLORS = [palette.coral, palette.butter, palette.mint, palette.sky, palette.lavender];

function flagGeometry() {
    const g = new THREE.BufferGeometry();
    // Triangle hanging below its top edge; aWind grows towards the tip (set in mergeParts).
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.17, 0, 0, 0.17, 0, 0, 0, -0.42, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2));
    g.computeVertexNormals();
    return g;
}

/**
 * Triangle-flag bunting strung between poles. The flags use the shared wind
 * material: top edges stay on the string, tips flutter with the gusts.
 */
export function Bunting({ points, sag = 0.45, spacing = 0.46 }: { points: Vec3[]; sag?: number; spacing?: number }) {
    const geometry = useMemo(() => {
        const parts: Part[] = [];
        const flag = flagGeometry();
        let colorIndex = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const a = new THREE.Vector3(...points[i]);
            const b = new THREE.Vector3(...points[i + 1]);
            const len = a.distanceTo(b);
            const n = Math.max(2, Math.floor(len / spacing));
            const yaw = Math.atan2(-(b.z - a.z), b.x - a.x);
            const curvePoint = (t: number) => new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -Math.sin(t * Math.PI) * sag, 0));
            // string
            const pts = Array.from({ length: 13 }, (_, k) => curvePoint(k / 12));
            parts.push({
                geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.014, 4, false),
                color: '#f5efe4',
                wind: 0.08,
            });
            for (let k = 1; k < n; k++) {
                const t = k / n;
                const p = curvePoint(t);
                parts.push({
                    geometry: flag,
                    color: FLAG_COLORS[colorIndex++ % FLAG_COLORS.length],
                    position: [p.x, p.y, p.z],
                    rotation: [0, yaw, 0],
                    wind: (v) => THREE.MathUtils.clamp((p.y - v.y) / 0.42, 0, 1) * 0.9 + 0.08,
                });
            }
        }
        return mergeParts(parts);
    }, [points, sag, spacing]);

    return <mesh geometry={geometry} material={getMaterials().flags} castShadow />;
}
