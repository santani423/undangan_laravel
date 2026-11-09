import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../../../config/types'
import { journey } from '../../../state/journey'
import { hipRoofGeo } from '../geometry'
import { useMats } from '../materials'
import { StaticBatch } from '../StaticBatch'
import { B, Contact, RoofLayer } from './primitives'

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** One teak door leaf: frame, two parang insets, brass studs. Built extending along +X from its hinge. */
function DoorLeaf({ width, height, mirror }: { width: number; height: number; mirror: boolean }) {
  const m = useMats()
  const sx = mirror ? -1 : 1
  const studs: Vec3[] = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) studs.push([sx * (0.35 + c * (width - 0.7)), 0.5 + r * ((height - 1) / 3), 0.07])
  return (
    <group>
      <B s={[width, height, 0.1]} p={[(sx * width) / 2, height / 2, 0]} m={m.teakV} castShadow />
      <B s={[width - 0.36, height * 0.42, 0.03]} p={[(sx * width) / 2, height * 0.7, 0.055]} m={m.parangPanel} />
      <B s={[width - 0.36, height * 0.36, 0.03]} p={[(sx * width) / 2, height * 0.26, 0.055]} m={m.parangPanel} />
      <B s={[width - 0.2, 0.08, 0.04]} p={[(sx * width) / 2, height * 0.475, 0.06]} m={m.brass} />
      {studs.map((p, i) => (
        <mesh key={i} position={p} material={m.brass}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[sx * (width - 0.14), height * 0.48, 0.1]} material={m.brass} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.014, 6, 16]} />
      </mesh>
    </group>
  )
}

/**
 * Regol — paduraksa-style roofed gateway in red brick and stone with teak doors.
 * The two door leaves are separate pivoting objects, so the opening is real, driven by scroll.
 */
export function Gate({ position, passage = 3.2, wallReach = 22 }: { position: Vec3; passage?: number; wallReach?: number }) {
  const m = useMats()
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const pw = 1.9 // pillar width
  const pd = 2.6 // pillar depth
  const ph = 4.6 // pillar height
  const doorH = 3.55
  const doorW = passage / 2

  useFrame(() => {
    const open = smooth(0.008, 0.072, journey.progress) * THREE.MathUtils.degToRad(86)
    if (left.current) left.current.rotation.y = open
    if (right.current) right.current.rotation.y = -open
  })

  const px = passage / 2 + pw / 2
  const wallLen = wallReach - (passage / 2 + pw)
  const wallX = passage / 2 + pw + wallLen / 2

  return (
    <group position={position}>
      <StaticBatch>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * px, 0, 0]}>
            {/* stone plinth + brick body with stepped tiers (pradaksina rhythm) */}
            <B s={[pw + 0.4, 0.5, pd + 0.4]} p={[0, 0.25, 0]} m={m.stone} />
            <B s={[pw, ph - 0.5, pd]} p={[0, 0.5 + (ph - 0.5) / 2, 0]} m={m.brick} />
            <B s={[pw + 0.12, 0.14, pd + 0.12]} p={[0, 1.4, 0]} m={m.stone} />
            <B s={[pw + 0.16, 0.18, pd + 0.16]} p={[0, ph, 0]} m={m.stone} />
            <B s={[pw - 0.3, 0.55, pd - 0.3]} p={[0, ph + 0.36, 0]} m={m.brick} />
            <B s={[pw - 0.2, 0.1, pd - 0.2]} p={[0, ph + 0.66, 0]} m={m.stone} />
            <B s={[pw - 0.7, 0.45, pd - 0.7]} p={[0, ph + 0.92, 0]} m={m.brick} />
            <mesh geometry={hipRoofGeo(pw - 0.8, pd - 0.8, 0.08, 0.08, 0.9)} material={m.stone} position={[0, ph + 1.15, 0]} />
            {/* recessed panel on the front face */}
            <B s={[pw - 0.6, 2.1, 0.06]} p={[0, 2.6, pd / 2 + 0.01]} m={m.stoneDark} />
            <B s={[pw - 0.8, 1.7, 0.04]} p={[0, 2.6, pd / 2 + 0.04]} m={m.carvingDark} />
          </group>
        ))}
        {/* lintel & roofed top over the passage */}
        <B s={[passage + 0.3, 0.4, pd - 0.3]} p={[0, doorH + 0.2, 0]} m={m.teakDark} />
        <B s={[passage, ph - doorH - 0.2, pd - 0.5]} p={[0, doorH + 0.4 + (ph - doorH - 0.4) / 2, 0]} m={m.brick} />
        <B s={[1.4, 0.7, 0.08]} p={[0, doorH + 0.75, pd / 2 - 0.2]} m={m.carving} />
        <RoofLayer bw={passage + 2 * pw + 1.2} bd={pd + 1.6} tw={passage + 0.6} td={0.5} h={1.7} y={ph + 0.05} top={m.roof} under={m.teakDark} />
        <B s={[passage + 0.8, 0.14, 0.3]} p={[0, ph + 1.8, 0]} m={m.teakDark} />
        <mesh geometry={hipRoofGeo(0.42, 0.42, 0.02, 0.02, 0.8)} material={m.brass} position={[0, ph + 1.86, 0]} />
        {/* ground contact along both faces of the gate and wall */}
        <Contact p={[0, 0, pd / 2 + 0.55]} sx={passage + pw * 2 + 1.4} sz={1.1} strip />
        <Contact p={[0, 0, -pd / 2 - 0.55]} sx={passage + pw * 2 + 1.4} sz={1.1} strip ry={Math.PI} />
        {[-1, 1].map((s) => (
          <group key={`c${s}`}>
            <Contact p={[s * wallX, 0, 0.75]} sx={wallLen} sz={0.8} strip />
            <Contact p={[s * wallX, 0, -0.75]} sx={wallLen} sz={0.8} strip ry={Math.PI} />
          </group>
        ))}
        {/* threshold */}
        <B s={[passage, 0.12, pd]} p={[0, 0.06, 0]} m={m.stoneDark} />

        {/* compound walls (brick base, plaster body, teak coping) */}
        {[-1, 1].map((s) => (
          <group key={`w${s}`} position={[s * wallX, 0, 0]}>
            <B s={[wallLen, 0.7, 0.75]} p={[0, 0.35, 0]} m={m.brick} />
            <B s={[wallLen, 1.9, 0.6]} p={[0, 0.7 + 0.95, 0]} m={m.plaster} />
            <B s={[wallLen + 0.1, 0.12, 0.8]} p={[0, 2.66, 0]} m={m.brick} />
            <mesh geometry={hipRoofGeo(wallLen + 0.2, 0.95, wallLen - 0.3, 0.1, 0.38)} material={m.roof} position={[0, 2.72, 0]} />
            {/* brick pilasters along the wall */}
            {Array.from({ length: Math.floor(wallLen / 3.2) }).map((_, i) => (
              <B key={i} s={[0.5, 2.7, 0.85]} p={[-wallLen / 2 + 1.6 + i * 3.2, 1.35, 0]} m={m.brick} />
            ))}
          </group>
        ))}
      </StaticBatch>

      {/* door leaves — dynamic, pivot at the inner face of each pillar */}
      <group ref={left} position={[-passage / 2 + 0.02, 0.12, -0.25]} userData={{ dynamic: true }}>
        <DoorLeaf width={doorW - 0.03} height={doorH - 0.12} mirror={false} />
      </group>
      <group ref={right} position={[passage / 2 - 0.02, 0.12, -0.25]} userData={{ dynamic: true }}>
        <DoorLeaf width={doorW - 0.03} height={doorH - 0.12} mirror />
      </group>
    </group>
  )
}
