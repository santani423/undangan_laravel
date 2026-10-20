import { WORLD } from '../../lib/world';
import { useMats } from '../materials';
import { Gebyok, Joglo } from '../objects/Joglo';
import { B, C, Contact } from '../objects/primitives';
import { Glow, HangingLantern, hangingGlowPos } from '../objects/Props';
import { StaticBatch } from '../StaticBatch';

/** A small gamelan corner: two saron and a hanging gong — quiet set dressing for the pendhapa. */
function GamelanCorner({ x, z }: { x: number; z: number }) {
    const m = useMats();
    const saron = (ox: number, oz: number, ry: number) => (
        <group position={[x + ox, 0.6, z + oz]} rotation={[0, ry, 0]}>
            <B s={[1.1, 0.26, 0.42]} p={[0, 0.13, 0]} m={m.teak} />
            <B s={[1.0, 0.04, 0.34]} p={[0, 0.27, 0]} m={m.maroon} />
            {Array.from({ length: 7 }).map((_, i) => (
                <B key={i} s={[0.09, 0.025, 0.3 - i * 0.012]} p={[-0.42 + i * 0.14, 0.3, 0]} m={m.brass} />
            ))}
        </group>
    );
    return (
        <group>
            <Contact p={[x + 0.2, 0.6, z + 0.55]} sx={2.6} sz={2.2} />
            {saron(0, 0, 0.25)}
            {saron(0.4, 1.1, 0.25)}
            <group position={[x - 1.3, 0.6, z + 0.6]} rotation={[0, Math.PI / 2 + 0.25, 0]}>
                <B s={[0.1, 1.9, 0.1]} p={[-0.75, 0.95, 0]} m={m.teakV} />
                <B s={[0.1, 1.9, 0.1]} p={[0.75, 0.95, 0]} m={m.teakV} />
                <B s={[1.8, 0.14, 0.12]} p={[0, 1.9, 0]} m={m.carving} />
                <C rt={0.5} h={0.12} p={[0, 1.15, 0]} r={[Math.PI / 2, 0, 0]} m={m.brass} seg={28} />
                <C rt={0.12} h={0.12} p={[0, 1.15, 0.08]} r={[Math.PI / 2, 0, 0]} m={m.gold} seg={14} />
            </group>
        </group>
    );
}

/** Scene 2 · Pendhapa — open joglo pavilion with the carved gebyok at the back. */
export function PendopoScene() {
    const m = useMats();
    const { position, size, platform } = WORLD.pendopo;
    const [px, , pz] = position;
    const lanterns: [number, number, number][] = [
        [px - 2.2, 4.2, pz + 3.6],
        [px + 2.2, 4.2, pz + 3.6],
        [px - 2.2, 4.2, pz - 3.6],
        [px + 2.2, 4.2, pz - 3.6],
    ];
    return (
        <group>
            <StaticBatch>
                <Joglo position={position} size={size} platform={platform} />
                <Gebyok position={[px, platform, pz - 5.25]} width={7.2} height={3.1} cols={5} />
                <GamelanCorner x={px - 4.2} z={pz + 1.5} />
                {/* batik floor mat in front of the gebyok */}
                <B s={[3.2, 0.012, 2.0]} p={[px, platform + 0.008, pz - 3.4]} m={m.batikParang} />
                {lanterns.map((l, i) => (
                    <HangingLantern key={i} p={l} drop={0.5} />
                ))}
            </StaticBatch>
            {lanterns.map((l, i) => (
                <Glow key={i} p={hangingGlowPos(l, 0.5)} size={1.1} />
            ))}
        </group>
    );
}
