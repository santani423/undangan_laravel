import { WORLD } from '../../lib/world';
import { useMats } from '../materials';
import { Gebyok } from '../objects/Joglo';
import { B } from '../objects/primitives';
import { Blencong, Glow, Gunungan, Lectern, Limasan } from '../objects/Props';
import { StaticBatch } from '../StaticBatch';

/** Scene 6 · Serat Katresnan — a manuscript room: carved walls, gunungan, lontar on a lectern. */
export function StoryScene() {
    const m = useMats();
    const [sx, , sz] = WORLD.story.position;
    const size = WORLD.story.size;
    const half = size / 2;
    const fl = 0.3;
    const wallH = 3.0;
    return (
        <group>
            <StaticBatch>
                <Limasan p={[sx, 0, sz]} w={size - 0.6} d={size - 0.6} h={wallH} platform={fl} floor="planks" steps={false} />
                {/* west wall: carved gebyok either side of the gunungan */}
                <B s={[0.25, wallH, size - 0.6]} p={[sx - half + 0.35, fl + wallH / 2, sz]} m={m.teakDark} />
                <Gebyok position={[sx - half + 0.5, fl, sz - 2.45]} width={2.6} height={2.7} cols={2} rotationY={Math.PI / 2} />
                <Gebyok position={[sx - half + 0.5, fl, sz + 2.45]} width={2.6} height={2.7} cols={2} rotationY={Math.PI / 2} />
                <B s={[0.06, 2.9, 2.1]} p={[sx - half + 0.5, fl + 1.5, sz]} m={m.parangPanel} />
                <Gunungan p={[sx - half + 0.56, fl + 0.25, sz]} h={2.4} ry={Math.PI / 2} />
                {/* south wall */}
                <B s={[size - 0.6, wallH, 0.25]} p={[sx, fl + wallH / 2, sz - half + 0.35]} m={m.plaster} />
                <B s={[size - 0.6, 0.9, 0.05]} p={[sx, fl + 0.45, sz - half + 0.5]} m={m.teak} />
                <B s={[size - 1.4, 1.1, 0.04]} p={[sx + 0.2, fl + 1.85, sz - half + 0.5]} m={m.carvingDark} />
                {/* batik carpet (6 mm proud of the planks) */}
                <B s={[3.6, 0.01, 2.6]} p={[sx - 0.6, fl + 0.011, sz]} m={m.batikParang} />
                <Lectern p={[sx - 1.6, fl, sz]} ry={Math.PI / 2} />
                <Blencong p={[sx - 1.0, fl, sz - 1.7]} />
                <Blencong p={[sx - 1.0, fl, sz + 1.7]} />
            </StaticBatch>
            <Glow p={[sx - 0.84, fl + 1.68, sz - 1.7]} size={0.9} />
            <Glow p={[sx - 0.84, fl + 1.68, sz + 1.7]} size={0.9} />
        </group>
    );
}
