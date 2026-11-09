import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useTheme } from '../../lib/context';
import { playOpening } from '../../lib/opening';
import { sceneFx } from '../../lib/sceneFx';
import { getApp } from '../../lib/store';
import { useDisposable } from '../Instanced';
import { buildGlowData, GlowPoints } from '../effects/GlowPoints';
import { heartShape } from '../geometry';
import { isFreeSpace, setHoverCursor } from '../interaction';
import { FOCI } from '../layout';
import { clayMaterial } from '../materials';
import { glowTexture, letterTexture } from '../textures';

const W = 1.2;
const H = 0.8;

function flapShape() {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.quadraticCurveTo(0.08, -0.42, 0, -0.47);
    s.quadraticCurveTo(-0.08, -0.42, -W / 2, 0);
    return s;
}

function pocketShape() {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, -H / 2);
    s.lineTo(W / 2, -H / 2);
    s.lineTo(W / 2, H / 2 - 0.02);
    s.quadraticCurveTo(0.1, 0.02, 0, -0.03);
    s.quadraticCurveTo(-0.1, 0.02, -W / 2, H / 2 - 0.02);
    s.lineTo(-W / 2, -H / 2);
    return s;
}

/** Sparkle burst on opening: ballistic points animated in the vertex shader. */
function SparkleBurst() {
    const material = useDisposable(
        () =>
            new THREE.ShaderMaterial({
                uniforms: { uT: { value: -1 }, uScale: { value: 600 } },
                vertexShader: /* glsl */ `
          uniform float uT;
          uniform float uScale;
          attribute vec3 aVel;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vA;
          void main() {
            float t = max(uT, 0.0);
            vec3 p = position + aVel * t + vec3(0.0, -0.9, 0.0) * t * t;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vA = uT < 0.0 ? 0.0 : (1.0 - smoothstep(0.6, 2.2, t)) * smoothstep(0.0, 0.08, t);
            vColor = color;
            gl_PointSize = 0.09 * uScale / -mv.z;
          }
        `,
                fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float a = exp(-d * d * 6.0) * vA;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor, a);
          }
        `,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                toneMapped: false,
            }),
        [],
    );
    const geometry = useDisposable(() => {
        const n = 90;
        const pos = new Float32Array(n * 3);
        const vel = new Float32Array(n * 3);
        const col = new Float32Array(n * 3);
        const c = new THREE.Color();
        const palette = ['#fff1a8', '#F2C5D2', '#FFF8EE', '#B9D5F2'];
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 0.6 + Math.random() * 1.6;
            pos.set([(Math.random() - 0.5) * 0.4, 0.1 + Math.random() * 0.3, 0.05], i * 3);
            vel.set([Math.cos(a) * sp, Math.abs(Math.sin(a)) * sp * 0.9 + 0.5, (Math.random() - 0.3) * 0.8], i * 3);
            c.set(palette[i % palette.length]).multiplyScalar(1.8);
            col.set([c.r, c.g, c.b], i * 3);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return g;
    }, []);
    useFrame(({ size, camera, viewport }) => {
        const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
        material.uniforms.uScale.value = (size.height * viewport.dpr) / (2 * Math.tan(fov / 2));
        material.uniforms.uT.value = sceneFx.burstAt > 0 ? performance.now() / 1000 - sceneFx.burstAt : -1;
    });
    return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}

export function Envelope() {
    const { wedding, music } = useTheme();
    const monogram = wedding.couple.monogram;
    const root = useRef<THREE.Group>(null);
    const body = useRef<THREE.Group>(null);
    const flap = useRef<THREE.Group>(null);
    const seal = useRef<THREE.Group>(null);
    const letter = useRef<THREE.Mesh>(null);
    const halo = useRef<THREE.Sprite>(null);
    const hover = useRef(0);
    const hovered = useRef(false);

    const geos = useDisposable(() => {
        const list = {
            body: new RoundedBoxGeometry(W, H, 0.05, 3, 0.022),
            flap: new THREE.ShapeGeometry(flapShape(), 12),
            pocket: new THREE.ShapeGeometry(pocketShape(), 12),
            letter: new THREE.PlaneGeometry(W * 0.86, H * 0.84),
            seal: new THREE.CylinderGeometry(0.095, 0.1, 0.03, 24).rotateX(Math.PI / 2),
            heart: new THREE.ExtrudeGeometry(heartShape(0.05), {
                depth: 0.012,
                bevelEnabled: true,
                bevelSize: 0.006,
                bevelThickness: 0.006,
                bevelSegments: 2,
            }),
        };
        return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) };
    }, []);
    const mats = useDisposable(() => {
        const list = {
            paper: clayMaterial({
                color: '#f9e6ec',
                emissive: '#f4cfdb',
                emissiveIntensity: 0.5,
                rim: '#ffffff',
                rimStrength: 0.35,
                transparent: true,
            }),
            pocket: clayMaterial({
                color: '#f3d3de',
                emissive: '#efc2d1',
                emissiveIntensity: 0.46,
                rim: '#ffffff',
                rimStrength: 0.3,
                transparent: true,
                side: THREE.DoubleSide,
            }),
            flap: clayMaterial({
                color: '#f0c9d6',
                emissive: '#e9b6c7',
                emissiveIntensity: 0.42,
                rim: '#ffffff',
                rimStrength: 0.3,
                transparent: true,
                side: THREE.DoubleSide,
            }),
            letter: new THREE.MeshBasicMaterial({
                map: letterTexture(monogram),
                transparent: true,
                toneMapped: false,
                color: new THREE.Color(1.05, 1.05, 1.05),
            }),
            seal: clayMaterial({ color: '#c96a86', rim: '#ffd0dc', rimStrength: 0.4, roughness: 0.55, transparent: true }),
            gold: clayMaterial({ color: '#F5D58B', emissive: '#6a5020', emissiveIntensity: 0.8, roughness: 0.4, transparent: true }),
        };
        return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) };
    }, [monogram]);
    const sparkles = useMemo(
        () =>
            buildGlowData(
                Array.from({ length: 14 }, (_, i) => {
                    const a = (i / 14) * Math.PI * 2;
                    return {
                        p: [Math.cos(a) * 0.95, Math.sin(a) * 0.62, 0.05] as [number, number, number],
                        color: i % 3 ? '#fff1a8' : '#F2C5D2',
                        size: 0.09,
                        intensity: 1.6,
                    };
                }),
            ),
        [],
    );

    useFrame(({ clock }, dt) => {
        const g = root.current;
        if (!g) return;
        const away = sceneFx.away;
        g.visible = away < 0.999;
        if (!g.visible) return;
        const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime;
        hover.current = THREE.MathUtils.damp(hover.current, hovered.current && !getApp().opening ? 1 : 0, 8, dt);

        const [x, y, z] = FOCI.envelope;
        g.position.set(x, y + Math.sin(t * 1.3) * 0.045 + away * 1.8, z - away * 2.5);
        g.rotation.set(
            Math.sin(t * 0.9) * 0.03 - away * 0.4,
            Math.sin(t * 0.55) * 0.12 + sceneFx.pointerX * 0.12,
            Math.sin(t * 0.8) * 0.035 + away * 0.6,
        );
        g.scale.setScalar((1 + hover.current * 0.06 + Math.sin(t * 6) * 0.004 * hover.current) * (1 - away * 0.75));

        const fade = 1 - THREE.MathUtils.smoothstep(away, 0.35, 0.95);
        for (const m of [mats.paper, mats.pocket, mats.flap, mats.seal, mats.gold, mats.letter]) m.opacity = fade;

        // Seal pops off, flap swings forward and up, letter slides out toward the guest.
        if (seal.current) {
            const s = sceneFx.seal;
            seal.current.scale.setScalar(Math.max(0.001, 1 + Math.sin(s * Math.PI) * 0.35 - s));
        }
        if (flap.current) flap.current.rotation.x = -sceneFx.flap * Math.PI * 0.97;
        if (letter.current) {
            const l = sceneFx.letter;
            letter.current.position.set(0, l * 0.62, 0.027 + l * 0.08);
            letter.current.rotation.x = -l * 0.12;
        }
        if (halo.current) {
            const mat = halo.current.material as THREE.SpriteMaterial;
            mat.opacity = (0.55 + Math.sin(t * 2) * 0.08 + hover.current * 0.2 + sceneFx.letter * 0.25) * fade;
        }
    });

    const onOver = (e: ThreeEvent<PointerEvent>) => {
        if (!isFreeSpace(e) || getApp().opened) return;
        e.stopPropagation();
        hovered.current = true;
        setHoverCursor(true);
    };
    const onOut = () => {
        if (!hovered.current) return;
        hovered.current = false;
        setHoverCursor(false);
    };
    const onClick = (e: ThreeEvent<MouseEvent>) => {
        if (!isFreeSpace(e)) return;
        e.stopPropagation();
        onOut();
        // A tap on the envelope is a user gesture too, so music may start with it.
        playOpening(music && wedding.music.autoplay ? music : null);
    };

    return (
        <>
            <group ref={root} position={FOCI.envelope}>
                <sprite ref={halo} position={[0, 0.1, -0.2]} scale={[3.4, 2.8, 1]} renderOrder={1}>
                    <spriteMaterial
                        map={glowTexture()}
                        color="#f5c9a8"
                        transparent
                        opacity={0.55}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </sprite>
                <group ref={body} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
                    <mesh geometry={geos.body} material={mats.paper} />
                    <mesh ref={letter} geometry={geos.letter} material={mats.letter} position={[0, 0, 0.027]} renderOrder={2} />
                    <mesh geometry={geos.pocket} material={mats.pocket} position={[0, 0, 0.033]} renderOrder={3} />
                    <group ref={flap} position={[0, H / 2 - 0.005, 0.038]}>
                        <mesh geometry={geos.flap} material={mats.flap} renderOrder={4} />
                        <group ref={seal} position={[0, -0.4, 0.012]}>
                            <mesh geometry={geos.seal} material={mats.seal} />
                            <mesh geometry={geos.heart} material={mats.gold} position={[0, 0, 0.012]} />
                        </group>
                    </group>
                </group>
                <GlowPoints data={sparkles} twinkle={1} drift={0.06} fadeNear={30} fadeFar={60} />
            </group>
            <group position={FOCI.envelope}>
                <SparkleBurst />
            </group>
        </>
    );
}
