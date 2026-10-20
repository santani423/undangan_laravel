# Asset inventory

Every asset the experience uses, where it lives, and how it is produced. Nothing is loaded from third-party URLs.

## 3D (procedural — `src/scene/`)

| Category | Asset | Implementation |
|---|---|---|
| Environment | Stylised trees (round + pine), distant silhouettes | `environment/Forest.tsx` (instanced; lumpy canopy blobs with baked gradient + twilight rim light) |
| | Ground, moss, hills, valley walls | `environment/Ground.tsx` → `Ground` (height + vertex colours from `layout.ts`) |
| | Winding path, stepping stones, glowing pebbles | `environment/Ground.tsx` → `ForestPath` |
| | Grass, flowers, glowing mushrooms, rocks | `environment/Vegetation.tsx` (instanced) |
| | Sky gradient, stars, moon | `environment/Sky.tsx` |
| Magical effects | Fireflies, floating dust | `effects/Atmosphere.tsx` → `Fireflies` (GPU point sprites, `effects/GlowPoints.tsx`) |
| | Mist | `effects/Atmosphere.tsx` → `Mist` |
| | Falling petals + opening burst | `effects/Atmosphere.tsx` → `Petals`, `props/Envelope.tsx` → `SparkleBurst` |
| | Lanterns (posts, hanging, flicker, halos) | `environment/Lanterns.tsx` |
| | Bloom | `SceneCanvas.tsx` (`@react-three/postprocessing`, high tier) |
| Wedding props | Invitation envelope (seal, flap, letter) | `props/Envelope.tsx` |
| | Couple figurines | `props/Figurine.tsx` |
| | Forest gate, floral ring, floral arch, floating rings | `props/Clearings.tsx` |
| | Moon platform + timepiece | `props/MoonPlatform.tsx` |
| | Stream, bridge, mushroom cottage, story frames | `props/StoryGlade.tsx`, `props/PhotoFrame.tsx` |
| | Ceremony dais, benches, candles, aisle | `props/Ceremony.tsx` |
| | Gallery frame ring, gazebo, wishing tree, pond | `props/Pavilions.tsx` |

Runtime canvas textures (`scene/textures.ts`): glow sprite, mist puff, moon face, path alpha, rune ring, invitation card, wish tag.

## 2D (`public/`)

| Asset | Used for |
|---|---|
| `assets/svg/forest-hills.svg`, `moon.svg`, `fireflies.svg`, `lantern.svg`, `mushroom-cluster.svg`, `wildflowers.svg` | 2D fallback backdrop (no WebGL / Mode ringan) |
| `assets/svg/floral-arch.svg` | Cover centrepiece in 2D mode |
| `assets/svg/sparkle-divider.svg` | Section dividers |
| `assets/svg/mushroom-cluster.svg` | Guestbook empty state |
| `assets/svg/couple-silhouette.svg`, `storybook-card.svg` | Not used at runtime (kept from the supplied pack) |
| `images/gallery/*.webp` (+ `thumbs/`) | Demo gallery illustrations — regenerate with `npm run assets:gallery`, replace with real photos |
| `images/og-cover.jpg` | Link preview image |
| `favicon.svg` | Browser tab icon |

## Interface (`src/components/`)

Monogram (`Monogram.tsx`), line icon set (`Icons.tsx`), loading indicator (cover firefly dots, `Spinner`), demo badges, empty states — all inline SVG/CSS.

## Fonts & audio

- Cormorant Garamond (display) and Plus Jakarta Sans (body), self-hosted via Fontsource (SIL OFL 1.1).
- Music: original melody synthesised by `src/audio/musicBox.ts`; optional licensed file via `public/audio/`.
