import type * as THREE from 'three'
import type { QualityTier } from '../../../config/types'
import type { LoadedAssets } from '../../../services/assetLoader'
import {
  bananaLeafTexture,
  barkTexture,
  brickTexture,
  contactShadowTexture,
  contactStripTexture,
  floorTileTexture,
  frondTexture,
  leafClusterTexture,
  nextFrame,
  palmBarkTexture,
  plankTexture,
  plasterTexture,
  rafterTexture,
  reliefTexture,
  roofTileTexture,
  stoneTexture,
  woodTexture,
  type TexSet,
} from './proceduralTextures'

export interface TextureLibrary {
  teakV: TexSet
  teakU: TexSet
  planks: TexSet
  floorTile: TexSet
  roofTile: TexSet
  rafters: TexSet
  brick: TexSet
  plaster: TexSet
  reliefGilded: TexSet
  reliefTeak: TexSet
  andesite: TexSet
  limestone: TexSet
  paver: TexSet
  bark: TexSet
  palmBark: TexSet
  leaves: THREE.Texture[]
  shrub: THREE.Texture
  frond: THREE.Texture
  banana: THREE.Texture
  contact: THREE.Texture
  contactStrip: THREE.Texture
}

const img = (t: THREE.Texture | undefined) => (t?.image as CanvasImageSource | undefined) ?? undefined

/**
 * Generates every procedural texture set, yielding between jobs so the loading screen stays
 * responsive. Resolution follows the quality tier (mobile gets 256 px sets).
 */
export async function buildTextureLibrary(assets: LoadedAssets, tier: QualityTier, onProgress: (f: number) => void): Promise<TextureLibrary> {
  const S = tier === 'low' ? 256 : 512
  const L = tier === 'low' ? 256 : 512
  const t = assets.textures
  const jobs: [keyof TextureLibrary | 'leaves', () => unknown][] = [
    ['teakV', () => woodTexture(S, 'v', 'teak', img(t.teak))],
    ['teakU', () => woodTexture(S, 'u', 'teak', img(t.teak))],
    ['planks', () => plankTexture(S, img(t.teak))],
    ['floorTile', () => floorTileTexture(S)],
    ['roofTile', () => roofTileTexture(S)],
    ['rafters', () => rafterTexture(S / 2)],
    ['brick', () => brickTexture(S)],
    ['plaster', () => plasterTexture(S / 2)],
    ['reliefGilded', () => reliefTexture(S, img(t.kawung), 'gilded', 0.5)],
    ['reliefTeak', () => reliefTexture(S, img(t.parang), 'teak', 0.55)],
    ['andesite', () => stoneTexture(S, img(t.stone), 'andesite')],
    ['limestone', () => stoneTexture(S, img(t.stone), 'limestone')],
    ['paver', () => stoneTexture(S / 2, img(t.stone), 'paver')],
    ['bark', () => barkTexture(S / 2)],
    ['palmBark', () => palmBarkTexture(S / 2)],
    [
      'leaves',
      () => [
        leafClusterTexture(L, 3, ['#2f4a22', '#3e5e2b', '#4f7334', '#62853d']),
        leafClusterTexture(L, 7, ['#34502a', '#46652f', '#5b7a35', '#72904a']),
        leafClusterTexture(L, 9, ['#2b4420', '#38552a', '#486b31', '#58773a']),
      ],
    ],
    ['shrub', () => leafClusterTexture(L / 2, 13, ['#263f1e', '#32502a', '#3f6031', '#4c6e37'], true)],
    ['frond', () => frondTexture(L)],
    ['banana', () => bananaLeafTexture(L)],
    ['contact', () => contactShadowTexture(128)],
    ['contactStrip', () => contactStripTexture()],
  ]
  const out: Record<string, unknown> = {}
  for (let i = 0; i < jobs.length; i++) {
    const [key, fn] = jobs[i]
    out[key] = fn()
    onProgress((i + 1) / jobs.length)
    await nextFrame()
  }
  return out as unknown as TextureLibrary
}

export function disposeLibrary(lib: TextureLibrary) {
  for (const v of Object.values(lib)) {
    if (Array.isArray(v)) v.forEach((t) => (t as THREE.Texture).dispose())
    else if ((v as TexSet).map) {
      const s = v as TexSet
      s.map.dispose()
      s.normalMap.dispose()
      s.roughnessMap.dispose()
    } else (v as THREE.Texture).dispose()
  }
}
