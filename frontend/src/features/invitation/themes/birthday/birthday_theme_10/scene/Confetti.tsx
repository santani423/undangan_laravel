import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { toyAssets } from '../lib/assets';
import { CELEBRATION_SPOTS } from '../lib/world';
import { onCelebrate } from '../store/celebrations';
import { fallbackConfetti, useSafeTexture } from './core/criticalTextures';

const POOL = 700;

const VERTEX = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aSeed;     // x,y: sprite cell, z: spin seed
uniform float uScale;
uniform float uTime;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
varying float vFlip;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aSize * uScale / -mvPosition.z;
  vAlpha = aAlpha;
  vCell = aSeed.xy;
  vSpin = uTime * (2.0 + aSeed.z * 3.0) + aSeed.z * 6.2831;
  vFlip = uTime * (3.0 + aSeed.z * 4.0);
}`;

const FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
varying float vFlip;
void main() {
  if (vAlpha <= 0.01) discard;
  vec2 c = gl_PointCoord - 0.5;
  float s = sin(vSpin), co = cos(vSpin);
  c = mat2(co, -s, s, co) * c;
  c.x /= max(abs(cos(vFlip)), 0.2);           // tumbling paper
  if (abs(c.x) > 0.5 || abs(c.y) > 0.5) discard;
  vec4 tex = texture2D(uMap, (vCell + c + 0.5) * 0.25);
  if (tex.a < 0.25) discard;
  gl_FragColor = vec4(tex.rgb, tex.a * vAlpha);
  #include <colorspace_fragment>
}`;

/**
 * Celebration bursts (gift opening, cake, RSVP, finale). Each point samples a
 * random cell of the pack's confetti sprite sheet and spins/tumbles in the
 * fragment shader; physics runs on a small fixed pool on the CPU.
 */
export function Confetti({ reducedMotion }: { reducedMotion: boolean }) {
    const map = useSafeTexture(toyAssets.sprites.confetti) ?? fallbackConfetti();
    const size = useThree((s) => s.size);
    const dpr = useThree((s) => s.viewport.dpr);
    const points = useRef<THREE.Points>(null!);

    const sim = useMemo(
        () => ({
            pos: new Float32Array(POOL * 3),
            vel: new Float32Array(POOL * 3),
            life: new Float32Array(POOL),
            maxLife: new Float32Array(POOL).fill(1),
            alpha: new Float32Array(POOL),
            sizes: new Float32Array(POOL),
            seeds: new Float32Array(POOL * 3),
            next: 0,
            active: 0,
        }),
        [],
    );

    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(sim.pos, 3).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute('aAlpha', new THREE.BufferAttribute(sim.alpha, 1).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute('aSize', new THREE.BufferAttribute(sim.sizes, 1));
        g.setAttribute('aSeed', new THREE.BufferAttribute(sim.seeds, 3));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -35), 200);
        return g;
    }, [sim]);

    const material = useMemo(() => {
        map.colorSpace = THREE.SRGBColorSpace;
        return new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            transparent: true,
            depthWrite: false,
            uniforms: { uMap: { value: map }, uScale: { value: 400 }, uTime: { value: 0 } },
        });
    }, [map]);

    useEffect(
        () =>
            onCelebrate(({ spot, strength }) => {
                const [ox, oy, oz] = CELEBRATION_SPOTS[spot];
                const count = Math.round((reducedMotion ? 26 : 120) * strength);
                const speed = (reducedMotion ? 0.55 : 1) * (0.8 + strength * 0.35);
                for (let n = 0; n < count; n++) {
                    const i = sim.next;
                    sim.next = (sim.next + 1) % POOL;
                    const a = Math.random() * Math.PI * 2;
                    const h = (1.4 + Math.random() * 2.6) * speed;
                    sim.pos.set([ox + (Math.random() - 0.5) * 0.6, oy + Math.random() * 0.4, oz + (Math.random() - 0.5) * 0.6], i * 3);
                    sim.vel.set([Math.cos(a) * h, (4.2 + Math.random() * 4.2) * speed, Math.sin(a) * h], i * 3);
                    sim.maxLife[i] = 2.6 + Math.random() * 1.6;
                    sim.life[i] = sim.maxLife[i];
                    sim.sizes[i] = 0.5 + Math.random() * 0.4;
                    sim.seeds.set([Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.random()], i * 3);
                }
                sim.active = POOL;
                geometry.attributes.aSize.needsUpdate = true;
                geometry.attributes.aSeed.needsUpdate = true;
            }),
        [geometry, sim, reducedMotion],
    );

    useFrame((state, rawDt) => {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 42;
        material.uniforms.uScale.value = (size.height * dpr * 0.5) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
        if (sim.active === 0) return;
        const dt = Math.min(rawDt, 0.05);
        let alive = 0;
        const drag = Math.exp(-1.6 * dt);
        for (let i = 0; i < POOL; i++) {
            if (sim.life[i] <= 0) {
                sim.alpha[i] = 0;
                continue;
            }
            alive++;
            sim.life[i] -= dt;
            const k = i * 3;
            sim.vel[k] *= drag;
            sim.vel[k + 2] *= drag;
            sim.vel[k + 1] = sim.vel[k + 1] * drag - 6.2 * dt;
            if (sim.vel[k + 1] < -1.6) sim.vel[k + 1] = -1.6; // paper falls slowly
            sim.pos[k] += (sim.vel[k] + Math.sin(sim.life[i] * 5 + i) * 0.4) * dt;
            sim.pos[k + 1] = Math.max(0.05, sim.pos[k + 1] + sim.vel[k + 1] * dt);
            sim.pos[k + 2] += sim.vel[k + 2] * dt;
            sim.alpha[i] = Math.min(1, sim.life[i] / 0.6);
        }
        sim.active = alive;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.aAlpha.needsUpdate = true;
    });

    return <points ref={points} geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}
