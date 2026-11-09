import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { sharedUniforms } from './sharedUniforms';
import { SPARKLE_ZONES, mulberry32 } from './worldLayout';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aSeed * 12.0) * 0.45;
    p.y += sin(uTime * 0.5 + aSeed * 7.0) * 0.3;
    p.z += cos(uTime * 0.3 + aSeed * 15.0) * 0.45;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (14.0 + aSeed * 10.0) * uPixelRatio / max(-mv.z, 0.5) * 6.0;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aSeed * 31.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uDusk;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 color = mix(vec3(1.0, 0.93, 0.7), vec3(1.0, 0.8, 0.42), uDusk);
    float intensity = (0.18 + uDusk * 0.82) * vTwinkle;
    gl_FragColor = vec4(color * (glow * 0.6 + core), (glow * 0.6 + core) * intensity);
  }
`;

/**
 * A handful of drifting light motes: pollen-like sparkles by day that become
 * warm fireflies at dusk. Motion is entirely in the vertex shader.
 */
export function Fireflies({ count, pixelRatio }: { count: number; pixelRatio: number }) {
    const geometry = useMemo(() => {
        const rand = mulberry32(512);
        const total = SPARKLE_ZONES.reduce((sum, zone) => sum + zone.weight, 0);
        const positions = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const pick = rand() * total;
            let zone = SPARKLE_ZONES[0];
            for (let z = 0, acc = 0; z < SPARKLE_ZONES.length; z++) {
                acc += SPARKLE_ZONES[z].weight;
                if (pick <= acc) {
                    zone = SPARKLE_ZONES[z];
                    break;
                }
            }
            for (let k = 0; k < 3; k++) positions[i * 3 + k] = zone.min[k] + rand() * (zone.max[k] - zone.min[k]);
            seeds[i] = rand();
        }
        const g = new BufferGeometry();
        g.setAttribute('position', new BufferAttribute(positions, 3));
        g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
        return g;
    }, [count]);

    const material = useMemo(
        () =>
            new ShaderMaterial({
                uniforms: { uTime: sharedUniforms.uTime, uDusk: sharedUniforms.uDusk, uPixelRatio: { value: pixelRatio } },
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: AdditiveBlending,
            }),
        [pixelRatio],
    );

    useEffect(() => () => geometry.dispose(), [geometry]);
    useEffect(() => () => material.dispose(), [material]);

    return <points geometry={geometry} material={material} frustumCulled={false} />;
}
