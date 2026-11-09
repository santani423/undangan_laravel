# Pawiwahan Agung — Cinematic 3D Javanese Wedding Invitation

A scroll-driven 3D wedding invitation: one continuous procedural world (regol gate → joglo
pendhapa → taman sari → wedding pavilion → gallery corridor → manuscript room → guest reception →
gift table → twilight close) that a single camera travels through as you scroll.

**Stack:** React 19 + TypeScript (strict) · Vite · Three.js r182 · React Three Fiber · drei ·
GSAP ScrollTrigger · Tailwind CSS v4 · Lucide.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build → dist/
npm run preview   # serve dist/
```

URL parameters: `?to=Nama+Tamu` (guest name; also `kepada`/`guest`), `?mode=lite` (no-3D layout),
`?quality=high|medium|low` (force render tier), `?capture=1` (deterministic timing for automated screenshots).

## Environment quality pass (v2)

- **PBR everywhere** — `src/components/3d/textures/` generates tileable colour + normal + roughness
  sets at load (teak grain V/U, floor planks, ubin tiles, clay roof tiles, rafters, brick, plaster,
  andesite, bark, palm bark) and carved reliefs whose height comes from the pack's kawung/parang
  tiles. All geometry carries metre UVs, so texel density is consistent everywhere.
- **Geometry** — chamfered boxes for every timber/stone member, roofs with real thickness, fascia
  boards and ridge tiles, overlapping joglo tiers, tiled platforms with coping and stairs, pillar
  capitals, carved makutha crests, andesite paver paths with gravel beds and landing stones.
- **Vegetation** — recursive branching trees (flared trunks, scaffold branches, leaf-card canopies
  with canopy normals), waringin with aerial roots, palms, bananas, jasmine shrubs; trunks and
  leaves share one wind field so foliage never detaches. Fixed LOD (lighter leaf set for distant
  trees) chosen at build time → no popping.
- **Grass** — ~52k/28k/9k instanced blades (high/medium/low), density concentrated where the camera
  looks, per-blade phase/amplitude/colour, distance fade to avoid shimmer.
- **Grounding & light** — contact-shadow decals under every pillar, plant, prop and platform;
  soft PCF shadows centred ahead of the camera and texel-snapped (no crawling); warm ground bounce.
- **Stability** — no coplanar surfaces (decals sit ≥6 mm proud with polygon offset), camera path
  verified with `npm run check:camera` (≥0.9 m clearance from every pillar), damped camera follow,
  quality tier fixed per session (only DPR adapts), render loop paused when the tab is hidden or the
  lightbox is open.

GLB/Draco note: no production models exist in the pack, so assets are procedural and generated
once per session (cached, instanced, merged per material by `StaticBatch`). Swap in compressed GLBs
via drei's `useGLTF` when real models are commissioned.

## Editing content

Everything a couple needs to change lives in **`src/config/wedding.ts`**: names, parents, date,
events + Google Maps URLs, gallery, love story, bank accounts, QRIS image, audio, closing text.
All values shipped are clearly marked examples (`isExampleData: true` shows a notice on the cover —
set it to `false` once real data is in).

| File | Purpose |
|---|---|
| `src/config/scenes.ts` | Scroll ranges, panel in/out points & sides, total scroll length |
| `src/config/camera.ts` | Camera shots (hold/travel waypoints & look-at targets) |
| `src/config/lighting.ts` | Time-of-day keys (morning → golden hour → twilight) |
| `src/config/world.ts` | World layout anchors, paths, grass exclusion zones |
| `src/config/assets.ts` | Asset manifest (what exists, what is missing, where it is used) |

## Architecture

- `src/components/experience/CinematicExperience.tsx` — one GSAP timeline scrubbed by native scroll
  drives `journey.progress` (camera, lights, doors, gift-box lid) **and** panel visibility, so every
  state is a pure function of scroll position: scrolling backwards reverses everything exactly.
- `src/components/3d/` — `WorldCanvas` (single canvas, adaptive quality, error/context-loss fallback),
  `CameraRig` (Catmull-Rom shots, eased holds, view-offset so the focal point sits beside panels),
  `Lighting` (sky shader, fog, sun with camera-following shadows, lantern glow), `StaticBatch`
  (merges static meshes per material into few draw calls), `wind.ts` (GPU foliage sway).
- `src/components/3d/objects/` — procedural Gate (pivoting door leaves), Joglo (soko guru, tumpang
  sari, three-tier roof), Gebyok, instanced trees/palms/bananas/jasmine, instanced wind grass, props.
- `src/components/invitation/` — presentation-agnostic features reused by the 3D and lite layouts.
- `src/services/` — `rsvpService` (interface + local demo store), clipboard, calendar (.ics/Google),
  ambient audio, asset loader with progress and per-asset fallbacks.

## Asset pack usage & limitations

Used from `pawiwahan_agung_3d_wedding_assets.zip` (copied to `public/assets/wedding-jawa/`): teak,
kawung, parang, stone, grass-ground, soil and brass textures; teak roughness map; teak-gold photo
frame SVG (3D frame overlays + thumbnails); divider, kawung motif and icon SVGs; theme CSS tokens;
grass-wind shader (adapted for instancing in `objects/Grass.tsx`).

Not in the pack, and handled honestly:
- **GLB models** — none exist; all 14 checklist models are built procedurally. No fake model paths.
- **Photos** — six labeled SVG placeholders in `public/assets/wedding-jawa/photos/`.
- **HDRI** — replaced by three.js `RoomEnvironment` + a gradient sky shader.
- **Gamelan audio** — until a licensed file is set in `wedding.audio.src`, an original slendro chime
  is synthesised live with Web Audio (playback only after a click; explicit play/pause button).
- **Normal/AO maps** — the pack's are neutral placeholders, so they are intentionally not applied.

## Backend integration

RSVP & guestbook use `LocalRsvpService` (browser localStorage only — the UI says so). Implement the
`RsvpService` interface against your backend and export it from `src/services/rsvpService.ts`.

## Accessibility & resilience

Native scrolling is never hijacked (wheel, trackpad, keyboard, touch). Scroll length is computed in
px and only recomputed on width change, so mobile URL bars and on-screen keyboards never move the
camera. `prefers-reduced-motion` turns travels into cuts and removes panel motion. Without WebGL, on
a render error or context loss, the app switches to a lite layout with every feature intact.
