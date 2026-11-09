import { useMemo } from 'react'
import type { QualitySettings } from '../../hooks/useQualityTier'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { Ground, Mountains, PLANTERS, Sky } from './objects/Environment'
import { Grass } from './objects/Grass'
import { Bananas, Jasmine, Palms, PlantContacts, TreeVariant, type PlantInstance } from './objects/Vegetation'
import { CeremonyScene } from './scenes/CeremonyScene'
import { ClosingScene } from './scenes/ClosingScene'
import { EntranceScene } from './scenes/EntranceScene'
import { GalleryScene } from './scenes/GalleryScene'
import { GardenScene } from './scenes/GardenScene'
import { GiftScene } from './scenes/GiftScene'
import { PendopoScene } from './scenes/PendopoScene'
import { ReceptionScene } from './scenes/ReceptionScene'
import { StoryScene } from './scenes/StoryScene'
import { buildVegetation } from './scenes/vegetationLayout'

const POINT_LIGHTS: { position: [number, number, number] }[] = [
  { position: [-20.2, 2.4, -31.6] }, // gift table
  { position: [0, 3.4, -22] }, // pendhapa
  { position: [-19, 2.4, -46.4] }, // reception
]

/** Jasmine planted inside the garden's brick planters (two or three per bed). */
function planterShrubs(): PlantInstance[] {
  const out: PlantInstance[] = []
  PLANTERS.forEach(([x, z, w, , r], i) => {
    const n = Math.max(2, Math.round(w / 1.1))
    for (let k = 0; k < n; k++) {
      const off = -w / 2 + (w / n) * (k + 0.5)
      out.push({ p: [x + Math.cos(r) * off, 0.07, z - Math.sin(r) * off], s: 0.85 + ((i + k) % 3) * 0.1, r: k * 1.7 + i, hue: ((i * 3 + k) % 5) / 5 })
    }
  })
  return out
}

/** The single continuous world. Every scene sits at its own place along the camera route. */
export function World({ quality, isMobile }: { quality: QualitySettings; isMobile: boolean }) {
  const veg = useMemo(() => buildVegetation(quality.treeDensity), [quality.treeDensity])
  const shrubs = useMemo(() => [...veg.jasmine, ...planterShrubs()], [veg])
  const shadows = quality.shadows
  return (
    <>
      {/* order matters: the camera moves first, then the sun centres its shadow frustum on it */}
      <CameraRig isMobile={isMobile} />
      <Lighting shadows={shadows} shadowMap={quality.shadowMap} pointLights={POINT_LIGHTS.slice(0, quality.pointLights)} />
      <Sky />
      <Mountains />
      <Ground />

      <EntranceScene />
      <PendopoScene />
      <GardenScene />
      <CeremonyScene />
      <GalleryScene />
      <StoryScene />
      <ReceptionScene />
      <GiftScene />
      <ClosingScene particles={quality.particles} />

      {veg.trees.map((g) => (
        <TreeVariant key={`${g.style}-${g.seed}`} group={g} shadows={shadows} />
      ))}
      <Palms items={veg.palms} shadows={shadows} />
      <Bananas items={veg.bananas} shadows={shadows} />
      <Jasmine items={shrubs} shadows={shadows && quality.tier === 'high'} />
      <PlantContacts spots={veg.contacts} />
      <Grass count={quality.grassCount} fade={quality.grassFade} />
    </>
  )
}
