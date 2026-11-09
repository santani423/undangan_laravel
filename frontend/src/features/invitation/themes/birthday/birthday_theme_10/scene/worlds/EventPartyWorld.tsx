import { useEffect, useRef, useState } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { sfx } from '../../hooks/useMusic';
import { STOP_INDEX } from '../../lib/journey';
import { DESTINATIONS, type Vec3 } from '../../lib/world';
import { celebrate } from '../../store/celebrations';
import { useExperience } from '../../store/experience';
import { BalloonCluster } from '../Balloons';
import { BirthdayCake } from '../BirthdayCake';
import { Bunting } from '../Bunting';
import { cached, cylinder, mergeParts, sphere, torus, type Part } from '../core/geometry';
import { getMaterials, palette } from '../core/materials';
import { GIFT_STYLES, GiftBox } from '../GiftBox';
import { Sparkles } from '../Sparkles';

const PLATFORM_TOP = 0.36;

const POLES: [number, number][] = [
    [-4.5, -1.5],
    [-1.6, -4.0],
    [1.8, -4.0],
    [4.5, -1.4],
];

const platformGeometry = () =>
    cached('party-platform', () => {
        const parts: Part[] = [
            { geometry: cylinder(3.3, 3.45, PLATFORM_TOP, 56), color: '#ffe3ad', colorTop: '#fff1d2', position: [0, PLATFORM_TOP / 2, 0] },
            { geometry: torus(3.32, 0.1, Math.PI * 2, 10, 64), color: palette.coral, position: [0, PLATFORM_TOP, 0], rotation: [Math.PI / 2, 0, 0] },
        ];
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            parts.push({
                geometry: sphere(0.09, 10, 8),
                color: [palette.sky, palette.butter, palette.mint][i % 3],
                position: [Math.cos(a) * 3.4, 0.18, Math.sin(a) * 3.4],
            });
        }
        // bunting poles
        for (const [x, z] of POLES) {
            parts.push({ geometry: cylinder(0.06, 0.08, 3.4, 10), color: palette.white, position: [x, 1.7, z] });
            parts.push({ geometry: sphere(0.13, 12, 10), color: palette.coral, position: [x, 3.45, z] });
            parts.push({ geometry: cylinder(0.22, 0.26, 0.12, 14), color: palette.lavenderDeep, position: [x, 0.06, z] });
        }
        return mergeParts(parts);
    });

const GIFTS: { position: Vec3; size: number; style: number; rotation: number }[] = [
    { position: [-2.25, PLATFORM_TOP, 1.25], size: 0.7, style: 1, rotation: 0.3 },
    { position: [2.3, PLATFORM_TOP, 1.05], size: 0.58, style: 2, rotation: -0.4 },
    { position: [-1.55, PLATFORM_TOP, -2.2], size: 0.62, style: 3, rotation: 0.6 },
    { position: [2.6, 0, 3.4], size: 0.66, style: 4, rotation: -0.2 },
    { position: [-3.7, 0, 2.5], size: 0.82, style: 0, rotation: 0.5 },
];

/** Small present that pops open with a little confetti when tapped, then closes again. */
function PartyGift({ position, size, style, rotation, animate }: (typeof GIFTS)[number] & { animate: boolean }) {
    const [open, setOpen] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    return (
        <GiftBox
            position={position}
            size={size}
            rotation={rotation}
            colors={GIFT_STYLES[style]}
            open={open}
            animate={animate}
            onActivate={() => {
                if (open) return;
                setOpen(true);
                celebrate('cake', 0.45);
                sfx('pop');
                timer.current = window.setTimeout(() => setOpen(false), 3200);
            }}
        />
    );
}

/** Destination 3 — the party garden with the giant cake, presents, balloons and bunting. */
export function EventPartyWorld({ animate }: { animate: boolean }) {
    const { center, rotation } = DESTINATIONS.party;
    const lit = useExperience((s) => s.activeStop >= STOP_INDEX.party) || !animate;
    const latched = useRef(false);
    if (lit) latched.current = true;
    const { child } = useInvitation().config;

    return (
        <group position={[center[0], 0, center[1]]} rotation-y={rotation}>
            <mesh geometry={platformGeometry()} material={getMaterials().toyMatte} castShadow receiveShadow />
            <BirthdayCake position={[0, PLATFORM_TOP, 0]} candles={child.age ?? 1} age={child.age ?? '★'} lit={latched.current} animate={animate} />
            {GIFTS.map((g, i) => (
                <PartyGift key={i} {...g} animate={animate} />
            ))}
            <BalloonCluster anchor={[-2.75, PLATFORM_TOP, -1.35]} count={5} height={3.4} seed={9} animate={animate} />
            <BalloonCluster anchor={[2.9, PLATFORM_TOP, -1.0]} count={4} height={3.1} seed={10} animate={animate} />
            <Bunting points={POLES.map(([x, z]) => [x, 3.3, z] as Vec3)} sag={0.5} />
            <Sparkles position={[0, 1.4, 0]} radius={2.2} height={2.6} color="#ffe6a8" count={16} animate={animate} />
        </group>
    );
}
