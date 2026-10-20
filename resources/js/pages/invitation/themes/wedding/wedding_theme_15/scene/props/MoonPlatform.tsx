import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getZonedClock } from '../../lib/date';
import { sceneFx } from '../../lib/sceneFx';
import { Instanced, useDisposable, type InstanceItem } from '../Instanced';
import { buildGlowData, GlowPoints } from '../effects/GlowPoints';
import { rockGeometry } from '../geometry';
import { FOCI } from '../layout';
import { clayMaterial, glowMaterial, PALETTE } from '../materials';
import { glowTexture, runeRingTexture } from '../textures';

function crescentShape(r: number) {
    // Outer arc around the left side, then back along an offset inner arc.
    const s = new THREE.Shape();
    s.absarc(0, 0, r, Math.PI * 0.25, Math.PI * 1.75, false);
    s.absarc(r * 0.42, 0, r * 0.82, Math.PI * 1.62, Math.PI * 0.38, true);
    return s;
}

/** Scene 3: a moonlit stone platform with a floating magical timepiece that shows the real local time. */
export function MoonPlatform() {
    const [px, , pz] = FOCI.countdown;
    const clock = useRef<THREE.Group>(null);
    const rune = useRef<THREE.Mesh>(null);
    const crystals = useRef<THREE.Group>(null);
    const hourHand = useRef<THREE.Group>(null);
    const minuteHand = useRef<THREE.Group>(null);
    const secondHand = useRef<THREE.Group>(null);
    const yaw = Math.atan2(2.3 - px, -23.6 - pz);

    const geos = useDisposable(() => {
        const list = {
            tier1: new THREE.CylinderGeometry(2.25, 2.45, 0.32, 11),
            tier2: new THREE.CylinderGeometry(1.85, 2.0, 0.26, 10),
            moss: new THREE.CylinderGeometry(1.7, 1.75, 0.06, 24),
            ring: new THREE.TorusGeometry(1.0, 0.055, 12, 80),
            ringInner: new THREE.TorusGeometry(0.86, 0.016, 8, 80),
            face: new THREE.CircleGeometry(0.86, 48),
            mark: new THREE.SphereGeometry(0.035, 10, 8),
            star: new THREE.OctahedronGeometry(0.075),
            hour: new THREE.BoxGeometry(0.05, 0.4, 0.02).translate(0, 0.17, 0),
            minute: new THREE.BoxGeometry(0.034, 0.6, 0.02).translate(0, 0.26, 0),
            second: new THREE.BoxGeometry(0.012, 0.68, 0.01).translate(0, 0.26, 0),
            hub: new THREE.SphereGeometry(0.05, 12, 10),
            moon: new THREE.ExtrudeGeometry(crescentShape(0.3), {
                depth: 0.05,
                bevelEnabled: true,
                bevelSize: 0.02,
                bevelThickness: 0.02,
                bevelSegments: 3,
            }),
            rune: new THREE.PlaneGeometry(3.3, 3.3),
            crystal: new THREE.OctahedronGeometry(0.11, 0),
            stone: rockGeometry(9),
        };
        list.moon.center();
        return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) };
    }, []);
    const mats = useDisposable(() => {
        const list = {
            stone: clayMaterial({ color: '#6f6b95', rim: '#b9d5f2', rimStrength: 0.35, roughness: 0.92, flatShading: true }),
            moss: clayMaterial({ color: '#4f6d63', rimStrength: 0.2 }),
            gold: clayMaterial({ color: PALETTE.gold, emissive: '#6b4f1c', emissiveIntensity: 1, roughness: 0.4, rim: '#fff3c4', rimStrength: 0.55 }),
            face: new THREE.MeshBasicMaterial({ color: '#b9d5f2', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
            mark: glowMaterial('#fff8ee', 1.6),
            blush: glowMaterial('#f2a5c0', 1.4),
            moon: clayMaterial({ color: '#fff3d6', emissive: '#a08a5a', emissiveIntensity: 0.7, rim: '#ffffff', rimStrength: 0.5 }),
            rune: new THREE.MeshBasicMaterial({
                map: runeRingTexture(),
                color: new THREE.Color('#f5d58b').multiplyScalar(1.5),
                transparent: true,
                opacity: 0.85,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                toneMapped: false,
            }),
            crystal: clayMaterial({
                color: '#c9b8f0',
                emissive: '#5b4f9a',
                emissiveIntensity: 1.2,
                rim: '#ffffff',
                rimStrength: 0.7,
                flatShading: true,
                roughness: 0.3,
            }),
        };
        return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) };
    }, []);

    const stones: InstanceItem[] = useMemo(
        () =>
            Array.from({ length: 6 }, (_, i) => {
                const a = (i / 6) * Math.PI * 2 + 0.3;
                if (Math.abs(((a - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.5) return null;
                return {
                    p: [Math.cos(a) * 2.9, 0.2, Math.sin(a) * 2.9],
                    r: [0, a, 0.05],
                    s: [0.32, 1.25 + (i % 3) * 0.25, 0.3],
                    c: '#7a76a2',
                } as InstanceItem;
            }).filter(Boolean) as InstanceItem[],
        [yaw],
    );
    const glow = useMemo(
        () =>
            buildGlowData([
                ...stones.map((s) => ({
                    p: [s.p[0], 0.2 + (s.s as number[])[1] * 0.75, s.p[2]] as [number, number, number],
                    color: '#b9d5f2',
                    size: 0.7,
                    intensity: 0.9,
                })),
                { p: [0, 2.45, 0], color: '#b9d5f2', size: 4.2, intensity: 0.3 },
            ]),
        [stones],
    );
    const marks = useMemo(() => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2), []);

    const lastSecond = useRef(-1);
    useFrame(({ clock: c }) => {
        const t = sceneFx.reducedMotion ? 0 : c.elapsedTime;
        if (clock.current) {
            clock.current.position.y = 2.45 + Math.sin(t * 0.9) * 0.08;
            clock.current.rotation.z = Math.sin(t * 0.5) * 0.03;
        }
        if (rune.current) rune.current.rotation.z = t * 0.08;
        if (crystals.current) {
            crystals.current.rotation.y = t * 0.35;
            crystals.current.children.forEach((m, i) => {
                m.position.y = Math.sin(t * 1.3 + i) * 0.15;
                m.rotation.y = t * 1.2 + i;
            });
        }
        const sec = Math.floor(Date.now() / 1000);
        if (sec !== lastSecond.current) {
            lastSecond.current = sec;
            const { h, m, s } = getZonedClock();
            if (hourHand.current) hourHand.current.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2;
            if (minuteHand.current) minuteHand.current.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
            if (secondHand.current) secondHand.current.rotation.z = -(s / 60) * Math.PI * 2;
        }
    });

    return (
        <group position={[px, 0, pz]}>
            <mesh geometry={geos.tier1} material={mats.stone} position={[0, 0.1, 0]} />
            <mesh geometry={geos.tier2} material={mats.stone} position={[0, 0.38, 0]} />
            <mesh geometry={geos.moss} material={mats.moss} position={[0, 0.52, 0]} />
            <mesh ref={rune} geometry={geos.rune} material={mats.rune} position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4} />
            <Instanced geometry={geos.stone} material={mats.stone} items={stones} />

            <group ref={clock} position={[0, 2.45, 0]} rotation={[0, yaw, 0]}>
                <sprite scale={[3.6, 3.6, 1]} position={[0, 0, -0.15]}>
                    <spriteMaterial
                        map={glowTexture()}
                        color="#b9d5f2"
                        transparent
                        opacity={0.35}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </sprite>
                <mesh geometry={geos.face} material={mats.face} />
                <mesh geometry={geos.ring} material={mats.gold} />
                <mesh geometry={geos.ringInner} material={mats.gold} />
                {marks.map((a, i) => (
                    <mesh
                        key={i}
                        geometry={i % 3 === 0 ? geos.star : geos.mark}
                        material={i === 0 ? mats.blush : mats.mark}
                        position={[Math.sin(a) * 0.74, Math.cos(a) * 0.74, 0.02]}
                        rotation={[0, 0, a]}
                    />
                ))}
                <mesh geometry={geos.moon} material={mats.moon} position={[-0.05, -0.32, -0.02]} rotation={[0, 0, 0.35]} scale={0.75} />
                <group ref={hourHand} position={[0, 0, 0.04]}>
                    <mesh geometry={geos.hour} material={mats.gold} />
                </group>
                <group ref={minuteHand} position={[0, 0, 0.06]}>
                    <mesh geometry={geos.minute} material={mats.gold} />
                </group>
                <group ref={secondHand} position={[0, 0, 0.08]}>
                    <mesh geometry={geos.second} material={mats.blush} />
                </group>
                <mesh geometry={geos.hub} material={mats.gold} position={[0, 0, 0.08]} />
            </group>

            <group ref={crystals} position={[0, 2.45, 0]}>
                {Array.from({ length: 6 }, (_, i) => {
                    const a = (i / 6) * Math.PI * 2;
                    return (
                        <group key={i}>
                            <mesh
                                geometry={geos.crystal}
                                material={mats.crystal}
                                position={[Math.cos(a) * 1.45, 0, Math.sin(a) * 1.45]}
                                scale={[1, 1.6, 1]}
                            />
                        </group>
                    );
                })}
            </group>
            <GlowPoints data={glow} twinkle={0.25} fadeNear={30} fadeFar={60} />
        </group>
    );
}
