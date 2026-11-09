import type { Vec3 } from '../../../config/types'
import { useMats } from '../materials'
import { B, C, Contact } from '../objects/primitives'
import { Glow, LanternPost, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

const GARDEN_LANTERNS: Vec3[] = [
  [14.4, 0, -22.4],
  [20.4, 0, -28.2],
  [25.6, 0, -38.8],
  [30.6, 0, -48.6],
  [33.6, 0, -57.4],
]

/**
 * Scene 3 · Taman Sari — hardscape of the garden (bench, planters, stepping stones, lanterns).
 * Plants, grass and the pond come from the shared vegetation/ground layers.
 */
export function GardenScene() {
  const m = useMats()
  return (
    <group>
      <StaticBatch>
        {/* stone bench by the pond */}
        <group position={[28.6, 0, -36.2]} rotation={[0, 0.9, 0]}>
          <Contact p={[0, 0, 0]} sx={2.4} sz={1.1} />
          <B s={[1.8, 0.1, 0.5]} p={[0, 0.45, 0]} m={m.stone} />
          <B s={[0.3, 0.42, 0.42]} p={[-0.65, 0.21, 0]} m={m.stoneDark} />
          <B s={[0.3, 0.42, 0.42]} p={[0.65, 0.21, 0]} m={m.stoneDark} />
        </group>
        {/* terracotta-stone planters with jasmine pots */}
        {(
          [
            [18.6, -24.6],
            [16.4, -29.8],
          ] as [number, number][]
        ).map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <C rt={0.42} rb={0.32} h={0.55} p={[0, 0.275, 0]} m={m.brick} seg={14} />
            <C rt={0.38} h={0.04} p={[0, 0.53, 0]} m={m.soil} seg={14} />
          </group>
        ))}
        {/* stepping stones to the pond */}
        {[0, 1, 2, 3].map((i) => (
          <C key={`s${i}`} rt={0.36} rb={0.4} h={0.08} seg={11} p={[27.4 + i * 1.05, 0.02, -33.9 - i * 0.65]} r={[0, i, 0]} m={m.paver} />
        ))}
        {GARDEN_LANTERNS.map((p, i) => (
          <LanternPost key={i} p={p} h={1.4} />
        ))}
      </StaticBatch>
      {GARDEN_LANTERNS.map((p, i) => (
        <Glow key={i} p={lanternGlowPos(p, 1.4)} size={1.1} />
      ))}
    </group>
  )
}
