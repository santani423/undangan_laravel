import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../../../config/types'
import { hipRoofGeo, planeGeo } from '../geometry'
import { useMats } from '../materials'
import { B, BeamRing, Contact, Pillar, RoofLayer } from './primitives'

/**
 * Raised stone platform (bebatur): andesite base, andesite coping, polished tile floor inset, a
 * soft contact-shadow band on the ground all around. Floor surface is exactly at y = height.
 */
export function Platform({ w, d, height, floor = 'tile', coping = 0.18 }: { w: number; d: number; height: number; floor?: 'tile' | 'planks' | 'stone'; coping?: number }) {
  const m = useMats()
  const slab = 0.05
  const floorMat = floor === 'tile' ? m.floorTile : floor === 'planks' ? m.planks : m.stone
  const iw = w - coping * 2
  const id = d - coping * 2
  return (
    <group>
      <B s={[w, height - slab, d]} p={[0, (height - slab) / 2, 0]} m={m.stoneDark} />
      <B s={[iw, slab, id]} p={[0, height - slab / 2, 0]} m={floorMat} />
      {/* coping stones flush with the floor */}
      <B s={[w, slab, coping]} p={[0, height - slab / 2, d / 2 - coping / 2]} m={m.stoneDark} />
      <B s={[w, slab, coping]} p={[0, height - slab / 2, -d / 2 + coping / 2]} m={m.stoneDark} />
      <B s={[id, slab, coping]} p={[w / 2 - coping / 2, height - slab / 2, 0]} r={[0, Math.PI / 2, 0]} m={m.stoneDark} />
      <B s={[id, slab, coping]} p={[-w / 2 + coping / 2, height - slab / 2, 0]} r={[0, Math.PI / 2, 0]} m={m.stoneDark} />
      {/* plinth moulding */}
      <B s={[w + 0.08, 0.1, d + 0.08]} p={[0, 0.05, 0]} m={m.stoneDark} />
      {/* ground contact (AO) */}
      <Contact p={[0, 0, d / 2 + 0.45]} sx={w + 0.9} sz={0.9} strip />
      <Contact p={[0, 0, -d / 2 - 0.45]} sx={w + 0.9} sz={0.9} strip ry={Math.PI} />
      <Contact p={[w / 2 + 0.45, 0, 0]} sx={d + 0.9} sz={0.9} strip ry={Math.PI / 2} />
      <Contact p={[-w / 2 - 0.45, 0, 0]} sx={d + 0.9} sz={0.9} strip ry={-Math.PI / 2} />
    </group>
  )
}

/** Stone stair flight descending towards +Z from a platform edge (top tread flush with the floor). */
export function Steps({ x = 0, z, width, height, treads }: { x?: number; z: number; width: number; height: number; treads: number }) {
  const m = useMats()
  const rise = height / treads
  const run = 0.36
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: treads - 0 }).map((_, i) => {
        const top = height - rise * (i + 1)
        if (top <= 0.001) return null
        return <B key={i} s={[width, top, run]} p={[0, top / 2, run * i + run / 2]} m={m.stoneDark} />
      })}
      {/* side cheeks */}
      {[-1, 1].map((s) => (
        <B key={s} s={[0.22, height - 0.02, run * (treads - 1) + 0.02]} p={[(s * (width + 0.22)) / 2, (height - 0.02) / 2, (run * (treads - 1)) / 2]} m={m.stoneDark} />
      ))}
      <Contact p={[0, 0, run * (treads - 1) + 0.35]} sx={width + 0.6} sz={0.7} strip />
    </group>
  )
}

/**
 * Procedural joglo pavilion (pendhapa). Proportions follow the classic layout:
 * 4 soko guru carrying a stepped tumpang sari ceiling and the steep brunjung roof, 12 soko
 * pengarak under the penanggap roof, and an emper eave. Roof tiers overlap like real courses.
 */
export function Joglo({
  position,
  rotationY = 0,
  size = 14,
  platform = 0.6,
  children,
}: {
  position: Vec3
  rotationY?: number
  size?: number
  platform?: number
  children?: ReactNode
}) {
  const m = useMats()
  const k = size / 14
  const guru = 2.2 * k
  const outer = 5.5 * k
  const outerZ = [-5.5, -1.8, 1.8, 5.5].map((v) => v * k)
  const guruH = 5.0 * k
  const outerH = 3.4 * k
  const y0 = platform

  const outerPillars: Vec3[] = []
  for (const x of outerZ) outerPillars.push([x, y0, outer], [x, y0, -outer])
  for (const z of outerZ.slice(1, 3)) outerPillars.push([outer, y0, z], [-outer, y0, z])

  const tumpang = [0, 1, 2, 3].map((i) => ({ w: guru * 2 + 0.3 + i * 0.3 * k, y: y0 + guruH + 0.12 + i * 0.18 * k }))
  const brunjungBase = y0 + guruH + 0.95 * k

  // roof tiers — each upper tier's eave overhangs and sits below the lower tier's top edge
  const emper = { bw: size + 2.6 * k, tw: outer * 2 + 0.5, y: y0 + outerH - 0.5 * k, top: y0 + outerH + 0.22 * k }
  const pen = { bw: outer * 2 + 1.3, tw: tumpang[3].w + 0.5, y: y0 + outerH + 0.06 * k, top: brunjungBase + 0.12 }
  const brun = { bw: tumpang[3].w + 1.15, tw: 3.4 * k, td: 0.24 * k, y: brunjungBase - 0.06, h: 3.5 * k }

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Platform w={size} d={size} height={platform} />
      <Steps z={size / 2} width={4.2 * k} height={platform} treads={3} />

      {/* soko guru */}
      {[
        [guru, guru],
        [-guru, guru],
        [guru, -guru],
        [-guru, -guru],
      ].map(([x, z], i) => (
        <Pillar key={`g${i}`} p={[x, y0, z]} h={guruH} w={0.34 * k} m={m.teakV} collar={m.brass} />
      ))}
      {outerPillars.map((p, i) => (
        <Pillar key={`o${i}`} p={p} h={outerH} w={0.24 * k} m={m.teakV} />
      ))}

      {/* beams */}
      <BeamRing w={guru * 2} d={guru * 2} y={y0 + guruH + 0.02} t={0.22 * k} h={0.26 * k} m={m.teak} />
      <BeamRing w={outer * 2} d={outer * 2} y={y0 + outerH + 0.02} t={0.18 * k} h={0.22 * k} m={m.teak} />
      {/* dudur (hip rafters) from outer ring to soko guru */}
      {[
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ].map(([sx, sz], i) => {
        const len = Math.hypot(outer - guru, outer - guru)
        const rise = guruH - outerH
        const yMid = y0 + (outerH + guruH) / 2 + 0.1
        return (
          <B
            key={`d${i}`}
            s={[0.14 * k, 0.16 * k, Math.hypot(len, rise)]}
            p={[(sx * (outer + guru)) / 2, yMid, (sz * (outer + guru)) / 2]}
            rotation={[Math.atan2(rise, len), Math.atan2(sx, sz), 0, 'YXZ']}
            m={m.teak}
          />
        )
      })}

      {/* tumpang sari — alternating plain and carved courses */}
      {tumpang.map((t, i) => (
        <BeamRing key={`t${i}`} w={t.w} d={t.w} y={t.y} t={0.16 * k} h={0.17 * k} m={i % 2 ? m.carvingDark : m.teak} />
      ))}
      <mesh geometry={planeGeo(tumpang[3].w + 0.1, tumpang[3].w + 0.1)} material={m.carving} position={[0, tumpang[3].y + 0.095, 0]} rotation={[Math.PI, 0, 0]} />

      {/* roofs: emper → penanggap → brunjung */}
      <RoofLayer bw={emper.bw} bd={emper.bw} tw={emper.tw} td={emper.tw} h={emper.top - emper.y} y={emper.y} top={m.roof} under={m.ceiling} />
      <RoofLayer bw={pen.bw} bd={pen.bw} tw={pen.tw} td={pen.tw} h={pen.top - pen.y} y={pen.y} top={m.roof} under={m.ceiling} />
      <RoofLayer bw={brun.bw} bd={brun.bw} tw={brun.tw} td={brun.td} h={brun.h} y={brun.y} top={m.roof} under={m.ceiling} ridge />
      {/* molo ridge beam + brass mustaka finials */}
      {[-1, 1].map((s) => (
        <group key={`mu${s}`} position={[s * 1.72 * k, brun.y + brun.h + 0.1, 0]}>
          <mesh geometry={hipRoofGeo(0.3 * k, 0.3 * k, 0.02, 0.02, 0.62 * k)} material={m.brass} position={[0, 0.06, 0]} />
          <B s={[0.32 * k, 0.1 * k, 0.32 * k]} p={[0, 0.02, 0]} m={m.brass} />
        </group>
      ))}
      {children}
    </group>
  )
}

/** Makutha crest silhouette (three-lobed crown) used on top of gebyok screens and chairs. */
function crestGeometry(width: number, height: number) {
  const s = new THREE.Shape()
  const w = width / 2
  s.moveTo(-w, 0)
  s.bezierCurveTo(-w * 0.95, height * 0.35, -w * 0.62, height * 0.42, -w * 0.48, height * 0.3)
  s.bezierCurveTo(-w * 0.38, height * 0.62, -w * 0.18, height * 0.7, -w * 0.1, height * 0.62)
  s.bezierCurveTo(-w * 0.06, height * 0.9, -w * 0.02, height, 0, height)
  s.bezierCurveTo(w * 0.02, height, w * 0.06, height * 0.9, w * 0.1, height * 0.62)
  s.bezierCurveTo(w * 0.18, height * 0.7, w * 0.38, height * 0.62, w * 0.48, height * 0.3)
  s.bezierCurveTo(w * 0.62, height * 0.42, w * 0.95, height * 0.35, w, 0)
  s.lineTo(-w, 0)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 20 })
  g.translate(0, 0, -0.025)
  return g
}

export function Crest({ p, width, height, rich }: { p: Vec3; width: number; height: number; rich?: boolean }) {
  const m = useMats()
  const g = useMemo(() => crestGeometry(width, height), [width, height])
  return <mesh geometry={g} material={rich ? m.carving : m.carvingDark} position={p} />
}

/** Gebyok — carved teak screen: recessed relief panels in chamfered rails, crest on top. */
export function Gebyok({ position, width = 7, height = 3.2, cols = 5, rotationY = 0, rich = false }: { position: Vec3; width?: number; height?: number; cols?: number; rotationY?: number; rich?: boolean }) {
  const m = useMats()
  const frame = 0.13
  const cw = width / cols
  const lowerH = height * 0.62
  const upperH = height - lowerH
  const trim = rich ? m.gold : m.teak
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* back board */}
      <B s={[width + 0.12, height, 0.08]} p={[0, height / 2, -0.06]} m={m.teakDark} />
      {Array.from({ length: cols }).map((_, c) =>
        [0, 1].map((r) => {
          const h = r === 0 ? lowerH : upperH
          const y = r === 0 ? lowerH / 2 : lowerH + upperH / 2
          const x = -width / 2 + cw * (c + 0.5)
          return (
            <group key={`${c}-${r}`} position={[x, y, 0]}>
              <B s={[cw - frame, h - frame, 0.03]} p={[0, 0, -0.005]} m={r === 0 ? m.carving : m.carvingDark} />
              {/* inner bead moulding */}
              <B s={[cw - frame, 0.025, 0.03]} p={[0, h / 2 - frame / 2 - 0.012, 0.02]} m={trim} />
              <B s={[cw - frame, 0.025, 0.03]} p={[0, -h / 2 + frame / 2 + 0.012, 0.02]} m={trim} />
            </group>
          )
        }),
      )}
      {/* stiles & rails stand proud of the panels */}
      {Array.from({ length: cols + 1 }).map((_, c) => (
        <B key={`v${c}`} s={[frame, height, 0.1]} p={[-width / 2 + cw * c, height / 2, 0.02]} m={m.teakV} />
      ))}
      <B s={[width + frame, frame, 0.11]} p={[0, height - frame / 2, 0.02]} m={m.teak} />
      <B s={[width + frame, frame, 0.116]} p={[0, lowerH, 0.02]} m={m.teak} />
      <B s={[width + frame, frame * 1.4, 0.12]} p={[0, (frame * 1.4) / 2, 0.02]} m={m.teak} />
      <B s={[width + frame + 0.08, 0.07, 0.16]} p={[0, height + 0.035, 0.02]} m={m.teakDark} />
      <Crest p={[0, height + 0.07, 0.02]} width={width * 0.42} height={Math.min(0.75, width * 0.12)} rich={rich} />
      <Contact p={[0, 0, 0.25]} sx={width + 0.4} sz={0.6} strip />
    </group>
  )
}
