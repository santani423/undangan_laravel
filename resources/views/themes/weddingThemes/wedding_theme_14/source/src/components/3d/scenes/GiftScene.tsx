import type { Vec3 } from '../../../config/types'
import { WORLD } from '../../../config/world'
import { useMats } from '../materials'
import { Gebyok, Platform } from '../objects/Joglo'
import { Envelopes, GiftBox, Glow, LanternPost, Table, Vase, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

/** Scene 8 · Tanda Katresnan — a warm, intimate gift table with a carved chest and envelopes. */
export function GiftScene() {
  const m = useMats()
  const [gx, , gz] = WORLD.gift.position
  // face the arriving camera (which approaches from the south-east)
  const ry = Math.atan2(0.57, -0.82)
  const local = (x: number, z: number): Vec3 => {
    const c = Math.cos(ry)
    const s = Math.sin(ry)
    return [gx + x * c + z * s, 0, gz - x * s + z * c]
  }
  const posts = [local(-2.1, -0.4), local(2.1, -0.4)]
  return (
    <group>
      <StaticBatch>
        <group position={[gx, 0, gz]} rotation={[0, ry, 0]}>
          <group position={[0, 0, -0.6]}>
            <Platform w={5.2} d={3.2} height={0.16} floor="tile" coping={0.16} />
          </group>
          <Gebyok position={[0, 0.16, -1.7]} width={3.6} height={2.3} cols={3} rich />
          <Table p={[0, 0.16, 0]} w={1.9} d={0.8} cloth={m.batikParang} />
          <Envelopes p={[-0.45, 0.95, 0.05]} ry={0.2} />
          <Vase p={[0.75, 0.95, -0.15]} />
        </group>
        {posts.map((p, i) => (
          <LanternPost key={i} p={p} />
        ))}
      </StaticBatch>
      <group position={[gx, 0, gz]} rotation={[0, ry, 0]}>
        <GiftBox p={[0.25, 0.95, 0.02]} ry={-0.15} />
      </group>
      {posts.map((p, i) => (
        <Glow key={i} p={lanternGlowPos(p)} size={1.2} />
      ))}
    </group>
  )
}
