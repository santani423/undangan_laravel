# Undesia — 3D Voxel Wedding Invitation

A digital wedding invitation in which guests travel through one continuous, real-time voxel garden. Scrolling drives the camera from the entrance arch to the ceremony arch, and every invitation feature appears as accessible HTML at its own place in the garden.

Stack: React 19 + TypeScript, Vite 8, three.js r186, React Three Fiber 9, drei, GSAP 3 + ScrollTrigger, Tailwind CSS 4, Lucide.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build
```

Add `?to=Nama%20Tamu` to the URL to personalise the recipient on the cover.

## Creating an invitation

Everything couple-specific lives in **`src/data/invitation.ts`**, typed by `src/types/invitation.ts`. No scene or UI component needs editing.

| Area | Fields | Notes |
| --- | --- | --- |
| Couple | `couple.bride`, `couple.groom`, `couple.order` | Names, parents, optional `photo` and `instagram`. |
| Dates | `weddingDate`, `events[]` | ISO-8601 with offset (`+07:00`), plus an IANA `timeZone` and label (`WIB`). The countdown uses `weddingDate`. |
| Location | `location` | `coordinates`, or an explicit `mapsUrl` / `embedUrl`. |
| Story | `loveStory[]` | Any number of milestones. |
| Gallery | `gallery[]` | Images, MP4/WebM `src`, or `youtubeId`. The first three images also hang on the 3D easels. |
| RSVP / guestbook | `rsvp`, `guestbook` | Deadline, maximum attendees, page size. |
| Dress code | `dressCode` | Text plus palette swatches. The palette also colours the 3D pillars. |
| Digital gift | `gift` | `accountNumber` must come from the owner; an empty value shows a placeholder and no copy button. Optional `qris` and `physicalGift`. |
| Music | `music` | Set `src` to an owner-supplied, licensed file in `public/`. Without it, an original ambient piece is synthesised live with the Web Audio API. Playback only starts from the “Buka Undangan” tap or the play button. |

Set `meta.isSample` to `false` once real data is in place; this removes the “Mode contoh” badge. Put photos, audio and QRIS images in `public/media/` and reference them as `/media/...`.

The shipped sample data is deliberately placeholder-only: no real names, venues, photos or payment details. The gallery images in `public/gallery/` are labelled voxel illustrations (`npm run generate:placeholders`). The map preview uses clearly labelled sample coordinates of a public botanical garden.

### RSVP and guestbook backend

Without configuration, both forms run in a **local demo mode**: responses are stored only in the guest's browser, and the UI says so. To use a server, copy `.env.example` to `.env` and set:

- `VITE_RSVP_ENDPOINT` — `POST` JSON `{ guestName, attendance: "hadir" | "tidak-hadir" | "ragu", attendees, message, invitation }` with an `Idempotency-Key` header (stable per device). Any 2xx response counts as success; the server may return `{ id, submittedAt }`.
- `VITE_GUESTBOOK_ENDPOINT` — `GET ?invitation=<slug>` returns `[{ id, name, message, createdAt }]`; `POST { name, message, invitation }` returns the created entry.

The service interfaces live in `src/services/`. Only names and messages are ever shown publicly.

## How the 3D garden works

```
src/
  components/invitation/   12 HTML sections + cover (semantic, accessible)
  components/ui/           countdown, music, navigation, lightbox, loading, static fallback
  context/ hooks/          invitation data, toasts, music, scroll camera, reveals
  data/                    invitation.ts, sections.ts, cameraWaypoints.ts
  scene/                   WeddingScene (Canvas), CameraController, GardenEnvironment,
                           VoxelAsset, WindGrass, SceneLighting, Terrain, Pond, Sky, …
  services/                RSVP + guestbook (demo / remote)
public/assets/             the supplied asset pack (models, textures, icons)
```

- **One world, one camera path.** `src/data/cameraWaypoints.ts` defines a waypoint per section (index 0 is the cover). The camera follows centripetal Catmull-Rom curves through them, and `contentSide` applies a lens shift so the focal prop sits opposite the HTML card on wide screens. `src/scene/worldLayout.ts` places every prop.
- **Scroll sync.** `useScrollCamera` builds a scrubbed GSAP timeline. Each section adds a segment between the scroll positions where neighbouring sections are framed, so the camera arrives exactly when its section is in view regardless of section height. The timeline also blends the atmosphere from afternoon to golden-hour dusk. It rebuilds when the layout changes.
- **Supplied OBJ + MTL assets.** `voxelLoader.ts` loads the MTL with `MTLLoader` and each OBJ with `OBJLoader`, and warns if a `usemtl` is missing from the palette. Because the supplied OBJ faces are wound clockwise, each material's geometry is re-oriented outward, given box-projected UVs (so the SVG textures apply), and merged per material. Every model renders as one `InstancedMesh` per material. If a file fails to load, a procedural box version is used instead.
- **Animation.** Grass is up to 13k instanced voxel blades bent on the GPU by one coherent wind field (travelling wave, gusts, flutter). Tree canopies and flowers sway rigidly around a pivot, so blocks never shear. The pond scrolls its texture on the GPU, and fireflies drift in a vertex shader. One shared clock drives everything and freezes under `prefers-reduced-motion`.
- **Performance.** three.js is a lazily loaded chunk. Quality tiers (`src/lib/quality.ts`) scale DPR, shadows, grass, trees and particles. `PerformanceMonitor` lowers resolution, then density, if the frame rate drops. GPU resources are disposed on unmount. Override the tier with `?quality=low|medium|high`.

## Accessibility and resilience

- All critical information is HTML; the canvas is decorative (`aria-hidden`).
- The cover is a modal (`inert` content behind it, focus moved on open). The site has a skip link, labelled forms with inline errors, visible focus rings, a keyboard-operable lightbox (native `<dialog>`, arrow keys, Esc, swipe), and polite live regions.
- **Reduced motion:** the camera cuts between composed viewpoints instead of flying, and shader animation, GSAP reveals and CSS animation are disabled.
- **No WebGL** (or a lost GPU context, or a failed 3D chunk): a static voxel illustration replaces the scene and the invitation stays complete. Force it with `?nowebgl=1`.
- Mouse parallax is desktop-only. The canvas never captures touch, so scrolling is never trapped.

## Testing

```bash
npm run lint
npm test             # Vitest: 47 unit/component tests
npm run build && npm run test:e2e   # 24 browser checks via local Chrome
```

The unit tests parse every supplied OBJ with the real loaders and verify materials and winding. They sample the camera path to make sure it never clips into props or terrain, and cover dates and countdown, validation, services (demo and remote), clipboard, and the RSVP, guestbook, gift, event and countdown components.

The end-to-end script (`scripts/e2e.mjs`, uses `playwright-core` with your installed Chrome; set `E2E_BROWSER=msedge` for Edge) checks the opening flow, scroll-to-waypoint sync for every section, copy actions, map links, lightbox, RSVP, guestbook, music controls, navigation, mobile layout and overflow, touch target sizes, the no-WebGL fallback, simulated GPU context loss, and reduced motion. Screenshots go to `test-results/e2e/`.

## Deployment

`dist/` is static and can be hosted anywhere (Netlify, Vercel, GitHub Pages, any web server). For a sub-path, build with `npx vite build --base=/undangan/`; asset URLs respect the base. Set the `VITE_*` endpoints at build time.

## Originality and licensing

- The voxel models, MTL palette, textures and icons are the original Undesia asset pack (`docs/asset-pack/`; the source ZIP is unchanged). No Minecraft textures, models, characters, sounds, fonts, UI or branding are used, and nothing implies affiliation.
- Fonts: Cormorant Garamond, Great Vibes and Jost (SIL Open Font License), self-hosted via Fontsource.
- The default music is generated in code at runtime. Replace it only with audio you are licensed to use.

## Known notes

- react-three-fiber 9.8 still uses `THREE.Clock`, so three.js logs a one-time deprecation warning in the console. It is harmless.
- The map preview is a key-less Google Maps embed and needs a network connection; the address and buttons work regardless.
