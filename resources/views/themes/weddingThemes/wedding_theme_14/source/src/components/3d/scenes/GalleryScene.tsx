import { useMemo } from 'react'
import * as THREE from 'three'
import { wedding } from '../../../config/wedding'
import { WORLD } from '../../../config/world'
import { quadGeo } from '../geometry'
import { useMats, useWorldAssets } from '../materials'
import { B, Pillar } from '../objects/primitives'
import { Glow, HangingLantern, hangingGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

/** One gallery frame: teak box, the photo, and the asset pack's teak-gold SVG frame as an overlay. */
function PhotoFrame({ x, y, z, w, h, material }: { x: number; y: number; z: number; w: number; h: number; material: THREE.Material }) {
  const m = useMats()
  return (
    <group position={[x, y, z]}>
      <B s={[w + 0.22, h + 0.22, 0.08]} p={[0, 0, 0]} m={m.teakDark} />
      <B s={[w + 0.08, h + 0.08, 0.02]} p={[0, 0, 0.045]} m={m.gold} />
      <mesh geometry={quadGeo(w, h)} material={material} position={[0, 0, 0.058]} />
      <mesh geometry={quadGeo(w + 0.12, h + 0.12)} material={m.frameOverlay} position={[0, 0, 0.062]} userData={{ dynamic: true }} />
      <B s={[w * 0.5, 0.05, 0.12]} p={[0, -h / 2 - 0.2, 0.04]} m={m.brass} />
    </group>
  )
}

/** Scene 5 · Pringgitan — a covered gallery walk with framed prewedding photographs. */
export function GalleryScene() {
  const m = useMats()
  const assets = useWorldAssets()
  const { z, xStart, xEnd, width, floor } = WORLD.corridor
  const len = xStart - xEnd
  const cx = (xStart + xEnd) / 2
  const back = z - width / 2
  const front = z + width / 2
  const wallH = 3.3
  const frontH = 2.75

  const photoMats = useMemo(
    () =>
      wedding.gallery.map(
        (g) =>
          new THREE.MeshStandardMaterial({
            map: assets.photos[g.id] ?? null,
            color: assets.photos[g.id] ? '#ffffff' : '#5f3b27',
            roughness: 0.55,
          }),
      ),
    [assets],
  )

  const frames = wedding.gallery.map((g, i) => {
    const portrait = g.orientation === 'portrait'
    return { x: 15.5 - i * 4.1, w: portrait ? 1.05 : 1.6, h: portrait ? 1.4 : 1.1, i }
  })
  const pillarsX = Array.from({ length: Math.floor(len / 4) + 1 }).map((_, i) => xStart - i * 4)
  const overhang = 0.8
  const slopeAng = Math.atan2(wallH - frontH, width)
  const run = width + overhang
  const slopeLen = run / Math.cos(slopeAng)
  const roofZ = back + run / 2
  const roofY = floor + wallH - (Math.tan(slopeAng) * run) / 2

  return (
    <group>
      <StaticBatch>
        {/* floor */}
        <B s={[len, floor, width]} p={[cx, floor / 2, z]} m={m.floorTile} />
        <B s={[len - 0.4, 0.01, 1.4]} p={[cx, floor + 0.005, z + 0.2]} m={m.batikKawung} />
        {/* back wall: plaster with teak wainscot and a parang frieze */}
        <B s={[len, wallH, 0.3]} p={[cx, floor + wallH / 2, back - 0.15]} m={m.plaster} />
        <B s={[len, 0.95, 0.06]} p={[cx, floor + 0.475, back + 0.02]} m={m.teak} />
        <B s={[len, 0.04, 0.08]} p={[cx, floor + 0.97, back + 0.03]} m={m.brass} />
        <B s={[len, 0.32, 0.04]} p={[cx, floor + wallH - 0.32, back + 0.02]} m={m.parangPanel} />
        {/* front pillars + eave beam */}
        {pillarsX.map((x, i) => (
          <Pillar key={i} p={[x, floor, front - 0.2]} h={frontH} w={0.2} m={m.teakV} base={m.stone} />
        ))}
        <B s={[len + 0.2, 0.2, 0.18]} p={[cx, floor + frontH, front - 0.2]} m={m.teak} />
        {/* lean-to roof sloping from the wall down to the pillars (shingles over a teak ceiling) */}
        <B s={[len + 0.6, 0.08, slopeLen]} p={[cx, roofY + 0.14, roofZ]} r={[slopeAng, 0, 0]} m={m.roof} />
        <B s={[len + 0.6, 0.03, slopeLen]} p={[cx, roofY + 0.07, roofZ]} r={[slopeAng, 0, 0]} m={m.teakDark} />
        {/* rafters */}
        {pillarsX.map((x, i) => (
          <B key={`r${i}`} s={[0.1, 0.12, width]} p={[x, floor + (wallH + frontH) / 2 - 0.15, z]} m={m.teak} r={[Math.atan2(wallH - frontH, width), 0, 0]} />
        ))}
        {/* low teak bench */}
        <B s={[2.4, 0.08, 0.45]} p={[cx - 2, floor + 0.45, back + 0.5]} m={m.teak} />
        <B s={[0.08, 0.42, 0.4]} p={[cx - 3.1, floor + 0.21, back + 0.5]} m={m.teak} />
        <B s={[0.08, 0.42, 0.4]} p={[cx - 0.9, floor + 0.21, back + 0.5]} m={m.teak} />
        {frames.map((f) => (
          <PhotoFrame key={f.i} x={f.x} y={floor + 1.85} z={back + 0.05} w={f.w} h={f.h} material={photoMats[f.i]} />
        ))}
        {pillarsX.slice(0, -2).map((x, i) => (
          <HangingLantern key={`l${i}`} p={[x - 2, floor + frontH + 0.1, z + 1.5]} drop={0.25} />
        ))}
      </StaticBatch>
      {pillarsX.slice(0, -2).map((x, i) => (
        <Glow key={i} p={hangingGlowPos([x - 2, floor + frontH + 0.1, z + 1.5], 0.25)} size={1} />
      ))}
    </group>
  )
}
