import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { QualityTier } from '../../lib/device';
import { mulberry32 } from '../../lib/random';
import { GlowPoints, type GlowPointsData } from '../effects/GlowPoints';
import { envState } from '../envState';
import { useDisposable } from '../Instanced';
import { MOON_DIR } from '../layout';
import { glowTexture, moonTexture } from '../textures';

const moonDir = new THREE.Vector3(...MOON_DIR).normalize();

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uFog;
  uniform vec3 uMoonDir;
  uniform float uMoon;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.02, 0.3, h));
    col = mix(col, uTop, smoothstep(0.3, 0.9, h));
    // Lingering dusk glow just above the horizon.
    col += uGlow * exp(-abs(h - 0.05) * 11.0) * 0.16;
    // Blend into the fog colour below the horizon so distant trees dissolve seamlessly.
    col = mix(col, uFog, smoothstep(0.12, -0.08, h));
    float m = max(dot(d, uMoonDir), 0.0);
    col += vec3(0.95, 0.88, 0.7) * pow(m, 48.0) * 0.28 * uMoon;
    col += vec3(0.7, 0.78, 0.98) * pow(m, 6.0) * 0.08 * uMoon;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function buildStars(count: number): GlowPointsData {
    const rng = mulberry32(42);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const tints = [new THREE.Color('#fff8ee'), new THREE.Color('#b9d5f2'), new THREE.Color('#f5d58b'), new THREE.Color('#f2c5d2')];
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
        // Bias toward the zenith; keep a clear band above the horizon.
        const y = 0.08 + Math.pow(rng(), 0.7) * 0.92;
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(1 - y * y);
        v.set(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(250);
        positions.set([v.x, v.y, v.z], i * 3);
        const c = tints[rng() < 0.7 ? 0 : 1 + Math.floor(rng() * 3)].clone().multiplyScalar(0.7 + rng() * 0.9);
        colors.set([c.r, c.g, c.b], i * 3);
        sizes[i] = 0.5 + Math.pow(rng(), 3) * 1.8;
        phases[i] = rng();
    }
    return { positions, colors, sizes, phases };
}

/**
 * Twilight sky dome, stars and moon. The whole group follows the camera, so
 * they behave like they are infinitely far away.
 */
export function Sky({ quality }: { quality: QualityTier }) {
    const group = useRef<THREE.Group>(null);
    const moonMat = useRef<THREE.SpriteMaterial>(null);
    const haloMat = useRef<THREE.SpriteMaterial>(null);

    const skyMaterial = useDisposable(
        () =>
            new THREE.ShaderMaterial({
                uniforms: {
                    uTop: { value: new THREE.Color('#0c0e29') },
                    uMid: { value: new THREE.Color('#24294B') },
                    uHorizon: { value: new THREE.Color('#5d5790') },
                    uGlow: { value: new THREE.Color('#F2C5D2') },
                    uFog: { value: envState.fog.clone() },
                    uMoonDir: { value: moonDir },
                    uMoon: { value: 1 },
                },
                vertexShader: skyVertex,
                fragmentShader: skyFragment,
                side: THREE.BackSide,
                depthWrite: false,
                fog: false,
            }),
        [],
    );
    const skyGeometry = useDisposable(() => new THREE.SphereGeometry(300, 40, 20), []);
    const stars = useMemo(() => buildStars(quality === 'high' ? 1400 : quality === 'medium' ? 900 : 500), [quality]);
    const moonPos = useMemo(() => moonDir.clone().multiplyScalar(230), []);

    useFrame(({ camera, clock }) => {
        group.current?.position.copy(camera.position);
        skyMaterial.uniforms.uFog.value.copy(envState.fog);
        skyMaterial.uniforms.uMoon.value = envState.moon;
        if (moonMat.current) moonMat.current.color.setScalar(1.15 + envState.moon * 0.35);
        if (haloMat.current) haloMat.current.opacity = 0.22 + envState.moon * 0.12 + Math.sin(clock.elapsedTime * 0.6) * 0.02;
    });

    return (
        <group ref={group}>
            <mesh geometry={skyGeometry} material={skyMaterial} renderOrder={-10} frustumCulled={false} />
            <GlowPoints data={stars} twinkle={0.85} fadeNear={1000} fadeFar={2000} opacity={0.9} renderOrder={-9} />
            <sprite position={moonPos} scale={110} renderOrder={-8}>
                <spriteMaterial
                    ref={haloMat}
                    map={glowTexture()}
                    color="#f5d58b"
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                    fog={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </sprite>
            <sprite position={moonPos} scale={26} renderOrder={-7}>
                <spriteMaterial ref={moonMat} map={moonTexture()} transparent depthWrite={false} fog={false} toneMapped={false} />
            </sprite>
        </group>
    );
}
