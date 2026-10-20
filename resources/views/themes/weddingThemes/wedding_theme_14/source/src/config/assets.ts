import type { AssetEntry } from './types'

/** Resolve a public/ path against Vite's base so the build works from any sub-folder. */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.endsWith('/') ? base : base + '/'}${path.replace(/^\//, '')}`
}

const ROOT = 'assets/wedding-jawa'

/** Textures actually loaded by the 3D world (all exist in the asset pack). */
export const TEXTURES = {
  teak: `${ROOT}/textures/wood/teak_basecolor.png`,
  teakRoughness: `${ROOT}/textures/wood/roughness.png`,
  kawung: `${ROOT}/textures/batik/kawung_tile_basecolor.png`,
  parang: `${ROOT}/textures/batik/parang_tile_basecolor.png`,
  stone: `${ROOT}/textures/stone/stone_basecolor.png`,
  grass: `${ROOT}/textures/foliage/grass_ground_basecolor.png`,
  soil: `${ROOT}/textures/ground/soil_basecolor.png`,
  brass: `${ROOT}/textures/metal/brass_basecolor.png`,
} as const

export type TextureKey = keyof typeof TEXTURES

export const SVGS = {
  photoFrame: `${ROOT}/ui/frames/teak-gold-photo-frame.svg`,
  divider: `${ROOT}/ui/ornaments/javanese-divider.svg`,
  kawungMotif: `${ROOT}/ui/ornaments/kawung-motif.svg`,
  icons: {
    bookOpen: `${ROOT}/ui/icons/book-open.svg`,
    calendar: `${ROOT}/ui/icons/calendar.svg`,
    gift: `${ROOT}/ui/icons/gift.svg`,
    heart: `${ROOT}/ui/icons/heart.svg`,
    images: `${ROOT}/ui/icons/images.svg`,
    mapPin: `${ROOT}/ui/icons/map-pin.svg`,
    music: `${ROOT}/ui/icons/music.svg`,
  },
} as const

/**
 * Full inventory of the asset pack and how each item is used. Missing production assets are
 * listed honestly — nothing below references a file that does not exist.
 */
export const ASSET_MANIFEST: AssetEntry[] = [
  { id: 'teak', path: TEXTURES.teak, kind: 'texture', status: 'included', usage: 'Pillars, beams, gate doors, gebyok frames, tables, frames' },
  { id: 'teak-roughness', path: TEXTURES.teakRoughness, kind: 'texture', status: 'included', usage: 'Roughness map on teak (neutral starter values)' },
  { id: 'kawung', path: TEXTURES.kawung, kind: 'texture', status: 'included', usage: 'Gebyok carved insets (tinted), tumpang sari ceiling, guest-table cloth, UI backgrounds' },
  { id: 'parang', path: TEXTURES.parang, kind: 'texture', status: 'included', usage: 'Gate door insets, pelaminan drapes, gift-table cloth, gunungan, UI accents' },
  { id: 'stone', path: TEXTURES.stone, kind: 'texture', status: 'included', usage: 'Gate pillars, platforms (bebatur), umpak bases, paths, pond rim' },
  { id: 'grass-ground', path: TEXTURES.grass, kind: 'texture', status: 'included', usage: 'Ground plane' },
  { id: 'soil', path: TEXTURES.soil, kind: 'texture', status: 'included', usage: 'Garden beds and planters' },
  { id: 'brass', path: TEXTURES.brass, kind: 'texture', status: 'included', usage: 'Lanterns, finials (mustaka), door studs, gift-box corners' },
  { id: 'normal/ao placeholders', path: null, kind: 'texture', status: 'generated', usage: 'Pack ships flat placeholders; real normal + roughness maps are generated at load from the pack colour maps (src/components/3d/textures/)' },
  { id: 'procedural PBR sets', path: null, kind: 'texture', status: 'generated', usage: 'Teak grain (V/U), floor planks, ubin tiles, clay roof tiles, rafters, brick, plaster, carved reliefs (from kawung/parang), andesite, bark, leaf/frond/banana alpha cards' },
  { id: 'photo-frame-svg', path: SVGS.photoFrame, kind: 'svg', status: 'included', usage: 'Overlay on 3D gallery frames and lightbox/thumbnail borders' },
  { id: 'divider-svg', path: SVGS.divider, kind: 'svg', status: 'included', usage: 'Panel ornaments' },
  { id: 'kawung-svg', path: SVGS.kawungMotif, kind: 'svg', status: 'included', usage: 'Monogram portraits, favicon, loading screen' },
  { id: 'ui-icons', path: `${ROOT}/ui/icons/`, kind: 'svg', status: 'included', usage: 'Section eyebrows (Lucide used for controls)' },
  { id: 'grass-wind-shader', path: `${ROOT}/shaders/grass-wind-vertex.glsl`, kind: 'shader', status: 'included', usage: 'Adapted for instanced grass in src/components/3d/objects/Grass.tsx' },
  { id: 'theme-css', path: `${ROOT}/examples/javanese-theme.css`, kind: 'css', status: 'included', usage: 'Tokens & .jawa-panel/.jawa-button extended in src/index.css' },
  { id: 'gallery-photos', path: `${ROOT}/photos/placeholder-1.svg`, kind: 'image', status: 'generated', usage: 'Six labeled placeholders — replace with licensed photos' },
  { id: 'glb-models', path: null, kind: 'model', status: 'missing-production', usage: 'All 14 models from PRODUCTION_CHECKLIST are generated procedurally instead' },
  { id: 'hdri', path: null, kind: 'hdr', status: 'missing-optional', usage: 'Replaced by three.js RoomEnvironment for subtle reflections + gradient sky shader' },
  { id: 'gamelan-audio', path: null, kind: 'audio', status: 'missing-production', usage: 'Replaced by an original generative Web Audio slendro chime until a licensed track is set' },
]
