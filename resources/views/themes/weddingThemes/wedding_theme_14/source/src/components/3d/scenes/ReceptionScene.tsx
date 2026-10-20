import type { Vec3 } from '../../../config/types'
import { WORLD } from '../../../config/world'
import { useMats } from '../materials'
import { Gebyok } from '../objects/Joglo'
import { B } from '../objects/primitives'
import { Chair, Glow, Guestbook, LanternHead, LanternPost, Limasan, Table, Vase, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

/** Scene 7 · Among Tamu — the guest reception table with the guestbook. */
export function ReceptionScene() {
  const m = useMats()
  const [rx, , rz] = WORLD.reception.position
  const fl = 0.3
  const posts: Vec3[] = [
    [rx - 2.6, 0, rz - 4.1],
    [rx + 2.6, 0, rz - 4.1],
  ]
  return (
    <group>
      <StaticBatch>
        <Limasan p={[rx, 0, rz]} w={6.4} d={5} h={2.8} platform={fl} />
        <Gebyok position={[rx, fl, rz + 1.9]} width={4.4} height={2.4} cols={3} rotationY={Math.PI} />
        <Table p={[rx, fl, rz + 0.5]} w={2.6} d={0.9} cloth={m.batikKawung} ry={Math.PI} />
        <Guestbook p={[rx - 0.25, fl + 0.79, rz + 0.45]} ry={Math.PI + 0.08} />
        <LanternHead p={[rx + 0.95, fl + 0.79, rz + 0.55]} scale={0.7} />
        <Vase p={[rx + 0.5, fl + 0.79, rz + 0.65]} />
        <Chair p={[rx - 0.6, fl, rz + 1.3]} ry={Math.PI} />
        <Chair p={[rx + 0.6, fl, rz + 1.3]} ry={Math.PI} />
        {/* standing sign easel */}
        <group position={[rx - 2.1, fl, rz - 1.2]} rotation={[0, 0.5, 0]}>
          <B s={[0.05, 1.5, 0.05]} p={[-0.3, 0.75, 0]} m={m.teakV} r={[0.12, 0, 0]} />
          <B s={[0.05, 1.5, 0.05]} p={[0.3, 0.75, 0]} m={m.teakV} r={[0.12, 0, 0]} />
          <B s={[0.8, 1.0, 0.04]} p={[0, 1.15, -0.06]} m={m.teakDark} r={[0.12, 0, 0]} />
          <B s={[0.66, 0.86, 0.02]} p={[0, 1.15, -0.03]} m={m.batikKawung} r={[0.12, 0, 0]} />
        </group>
        {posts.map((p, i) => (
          <LanternPost key={i} p={p} />
        ))}
      </StaticBatch>
      <Glow p={[rx + 0.95, fl + 0.79 + 0.13, rz + 0.55]} size={0.7} />
      {posts.map((p, i) => (
        <Glow key={i} p={lanternGlowPos(p)} size={1.2} />
      ))}
    </group>
  )
}
