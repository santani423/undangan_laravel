import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sfx } from '../../hooks/useMusic';
import { CAMERA_KEYS, DESTINATIONS, PLAZA, facing, type Vec3 } from '../../lib/world';
import { celebrate } from '../../store/celebrations';
import { setExperience, useExperience } from '../../store/experience';
import { BalloonArch, BalloonCluster } from '../Balloons';
import { Bunting } from '../Bunting';
import { cached, cylinder, mergeParts, roundedBox, sphere, torus, type Part } from '../core/geometry';
import { getMaterials, palette } from '../core/materials';
import { GIFT_STYLES, GiftBox } from '../GiftBox';
import { hoverCursor } from '../interaction';
import { Bench, LampPosts } from '../Props';
import { Sparkles } from '../Sparkles';
import { ToyText } from '../ToyText';

const FLOOR_TOP = 0.12;
const ARCH_RADIUS = 3.6;
const TILE_COLORS = [palette.coral, palette.butter, palette.mint, palette.sky, palette.lavender];

const plazaGeometry = () =>
    cached('plaza', () => {
        const parts: Part[] = [
            {
                geometry: cylinder(PLAZA.radius, PLAZA.radius + 0.12, FLOOR_TOP, 72),
                color: '#f3e3c8',
                colorTop: '#fbf0dc',
                position: [0, FLOOR_TOP / 2, 0],
            },
            { geometry: cylinder(1.95, 2.05, 0.3, 48), color: palette.lavenderDeep, colorTop: palette.lavender, position: [0, FLOOR_TOP + 0.15, 0] },
        ];
        const segments = 30;
        for (let i = 0; i < segments; i++) {
            const g = new THREE.RingGeometry(7.25, 8.05, 3, 1, (i / segments) * Math.PI * 2 + 0.01, (Math.PI * 2) / segments - 0.02);
            parts.push({
                geometry: g,
                color: TILE_COLORS[i % TILE_COLORS.length],
                position: [0, FLOOR_TOP + 0.004, 0],
                rotation: [-Math.PI / 2, 0, 0],
            });
        }
        for (let i = 0; i < 16; i++) {
            const g = new THREE.RingGeometry(2.45, 3.0, 3, 1, (i / 16) * Math.PI * 2 + 0.015, (Math.PI * 2) / 16 - 0.03);
            parts.push({
                geometry: g,
                color: i % 2 ? '#efe4fb' : palette.white,
                position: [0, FLOOR_TOP + 0.004, 0],
                rotation: [-Math.PI / 2, 0, 0],
            });
        }
        // balloon arch weights
        for (const x of [-ARCH_RADIUS, ARCH_RADIUS]) {
            parts.push({ geometry: roundedBox(0.7, 0.5, 0.7, 0.12), color: palette.lavenderDeep, position: [x, FLOOR_TOP + 0.25, PLAZA.arch[2]] });
        }
        return mergeParts(parts);
    });

/* ---------------------------------------------------------------- mailbox */

const mailboxGeometry = () =>
    cached('mailbox', () =>
        mergeParts([
            { geometry: cylinder(0.08, 0.1, 1.25, 10), color: palette.wood, position: [0, 0.62, 0] },
            { geometry: roundedBox(0.64, 0.5, 0.95, 0.08), color: palette.coral, position: [0, 1.45, 0] },
            { geometry: cylinder(0.32, 0.32, 0.95, 24), color: palette.coral, position: [0, 1.7, 0], rotation: [Math.PI / 2, 0, 0] },
            { geometry: roundedBox(0.52, 0.62, 0.06, 0.06), color: palette.lavender, position: [0, 1.58, 0.47] },
            { geometry: sphere(0.05, 10, 8), color: palette.butter, position: [0, 1.48, 0.52] },
            { geometry: roundedBox(0.4, 0.06, 0.4, 0.03), color: palette.woodDark, position: [0, 0.03, 0] },
        ]),
    );

const flagGeometry = () =>
    cached('mailbox-flag', () =>
        mergeParts([
            { geometry: roundedBox(0.05, 0.52, 0.05, 0.02), color: palette.butterDeep, position: [0, 0.26, 0] },
            { geometry: roundedBox(0.04, 0.22, 0.3, 0.03), color: palette.butter, position: [0, 0.42, 0.13] },
        ]),
    );

function Mailbox({ position, rotation, raised, animate }: { position: Vec3; rotation: number; raised: boolean; animate: boolean }) {
    const flag = useRef<THREE.Group>(null!);
    const root = useRef<THREE.Group>(null!);
    const st = useRef({ flag: 0, wiggle: 0 });
    const mat = getMaterials().toySatin;

    useFrame((state, rawDt) => {
        const dt = Math.min(rawDt, 0.05);
        const s = st.current;
        s.flag = animate ? THREE.MathUtils.damp(s.flag, raised ? 1 : 0, 4, dt) : raised ? 1 : 0;
        s.wiggle = THREE.MathUtils.damp(s.wiggle, 0, 4, dt);
        flag.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, 0, s.flag);
        root.current.rotation.z = Math.sin(state.clock.elapsedTime * 22) * 0.05 * s.wiggle;
    });

    const onClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        st.current.wiggle = 1;
        sfx('boing');
        if (raised) celebrate('mailbox', 0.5);
    };

    return (
        <group position={position} rotation-y={rotation}>
            <group ref={root} onClick={onClick} {...hoverCursor}>
                <mesh geometry={mailboxGeometry()} material={mat} castShadow receiveShadow />
                <group ref={flag} position={[0.35, 1.4, 0.1]}>
                    <mesh geometry={flagGeometry()} material={mat} castShadow />
                </group>
                <ToyText position={[-0.325, 1.48, 0.05]} rotation-y={-Math.PI / 2} fontSize={0.17} color={palette.white}>
                    RSVP
                </ToyText>
                <ToyText position={[0.325, 1.48, -0.05]} rotation-y={Math.PI / 2} fontSize={0.17} color={palette.white}>
                    RSVP
                </ToyText>
            </group>
        </group>
    );
}

/* --------------------------------------------------------------- carousel */

const carouselGeometry = () =>
    cached('carousel', () => {
        const parts: Part[] = [
            { geometry: cylinder(2.2, 2.3, 0.3, 48), color: palette.skyDeep, colorTop: palette.sky, position: [0, 0.15, 0] },
            { geometry: torus(2.22, 0.07, Math.PI * 2, 8, 56), color: palette.butter, position: [0, 0.3, 0], rotation: [Math.PI / 2, 0, 0] },
            { geometry: cylinder(0.12, 0.12, 2.6, 12), color: palette.white, position: [0, 1.6, 0] },
            { geometry: sphere(0.16, 12, 10), color: palette.butter, position: [0, 3.55, 0] },
        ];
        const wedges = 12;
        for (let i = 0; i < wedges; i++) {
            parts.push({
                geometry: new THREE.CylinderGeometry(0, 2.3, 0.85, 4, 1, false, (i / wedges) * Math.PI * 2, (Math.PI * 2) / wedges),
                color: i % 2 ? palette.white : palette.coral,
                position: [0, 3.1, 0],
            });
        }
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            parts.push({ geometry: sphere(0.1, 8, 6), color: palette.butter, position: [Math.sin(a) * 2.3, 2.62, Math.cos(a) * 2.3] });
        }
        return mergeParts(parts);
    });

const teacupGeometry = (color: string) =>
    cached(`teacup:${color}`, () =>
        mergeParts([
            { geometry: cylinder(0.5, 0.52, 0.06, 24), color: palette.white, position: [0, 0.33, 0] },
            { geometry: cylinder(0.42, 0.3, 0.42, 24), color, position: [0, 0.57, 0] },
            { geometry: torus(0.42, 0.04, Math.PI * 2, 6, 24), color: palette.white, position: [0, 0.78, 0], rotation: [Math.PI / 2, 0, 0] },
            { geometry: torus(0.13, 0.04, Math.PI * 2, 6, 14), color: palette.white, position: [0.45, 0.58, 0] },
        ]),
    );

const CUP_COLORS = [palette.coral, palette.mint, palette.butter, palette.lavender];

function TeacupCarousel({ position, animate }: { position: Vec3; animate: boolean }) {
    const ring = useRef<THREE.Group>(null!);
    const mat = getMaterials().toySatin;
    useFrame((_, dt) => {
        if (!animate) return;
        ring.current.rotation.y += dt * 0.32;
        ring.current.children.forEach((c, i) => (c.rotation.y += dt * (0.5 + i * 0.1)));
    });
    return (
        <group position={position}>
            <mesh geometry={carouselGeometry()} material={mat} castShadow receiveShadow />
            <group ref={ring}>
                {CUP_COLORS.map((c, i) => {
                    const a = (i / CUP_COLORS.length) * Math.PI * 2;
                    return (
                        <mesh key={c} geometry={teacupGeometry(c)} material={mat} position={[Math.sin(a) * 1.35, 0, Math.cos(a) * 1.35]} castShadow />
                    );
                })}
            </group>
        </group>
    );
}

/* ------------------------------------------------------------------ plaza */

const LAMPS: Vec3[] = [
    [-6.0, FLOOR_TOP, 5.3],
    [6.0, FLOOR_TOP, 5.3],
    [-4.2, FLOOR_TOP, -6.9],
    [4.2, FLOOR_TOP, -6.9],
];

const { center } = DESTINATIONS.plaza;
const toWorld = (p: Vec3): [number, number] => [center[0] + p[0], center[1] + p[2]];
const rsvpCamera = CAMERA_KEYS.find((k) => k.stop === 4)!.pos;
const MAILBOX_ROTATION = facing(toWorld(PLAZA.mailbox), [rsvpCamera[0], rsvpCamera[2]]);

/** Destination 5 — the party plaza: RSVP mailbox, giant gift, teacup ride and balloon arch. */
export function RSVPAndGiftWorld({ animate }: { animate: boolean }) {
    const giftOpened = useExperience((s) => s.giftOpened);
    const rsvpSubmitted = useExperience((s) => s.rsvpSubmitted);

    const openGift = () => {
        if (giftOpened) return;
        setExperience({ giftOpened: true });
        celebrate('gift', 1.2);
        sfx('pop');
    };

    return (
        <group position={[center[0], 0, center[1]]} rotation-y={DESTINATIONS.plaza.rotation}>
            <mesh geometry={plazaGeometry()} material={getMaterials().toyMatte} receiveShadow castShadow />
            <GiftBox
                position={[0, FLOOR_TOP + 0.3, 0]}
                size={2.3}
                colors={GIFT_STYLES[0]}
                open={giftOpened}
                surprise
                animate={animate}
                onActivate={openGift}
            />
            <Mailbox
                position={[PLAZA.mailbox[0], FLOOR_TOP, PLAZA.mailbox[2]]}
                rotation={MAILBOX_ROTATION}
                raised={rsvpSubmitted}
                animate={animate}
            />
            <TeacupCarousel position={[PLAZA.carousel[0], FLOOR_TOP, PLAZA.carousel[2]]} animate={animate} />
            <BalloonArch position={[0, FLOOR_TOP, PLAZA.arch[2]]} radius={ARCH_RADIUS} count={34} animate={animate} />
            <BalloonCluster anchor={[5.6, FLOOR_TOP, -2.4]} count={5} height={3.6} seed={14} animate={animate} />
            <LampPosts positions={LAMPS} />
            <Bench position={[6.6, FLOOR_TOP, 0.4]} rotation={-Math.PI / 2} />
            <Bench position={[5.0, FLOOR_TOP, 4.6]} rotation={facing([5.0, 4.6], [0, 0])} />
            <Bunting
                points={[
                    [6.0, 3.0, 5.3],
                    [4.2, 3.0, -6.9],
                ]}
                sag={0.45}
            />
            {giftOpened && <Sparkles position={[0, 1.2, 0]} radius={2.4} height={3.2} count={20} animate={animate} />}
        </group>
    );
}
