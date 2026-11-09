# Enchanted Twilight Forest — 3D Wedding Invitation

An interactive digital wedding invitation set in a miniature storybook forest at twilight.
A single persistent WebGL scene sits behind the page; every scroll section moves the camera to its
own composition in the forest while the HTML content (always real, selectable text) slides in on top.

**Stack:** React 19 + TypeScript · Vite · three.js via React Three Fiber + Drei · GSAP ScrollTrigger · Framer Motion · plain CSS.
No runtime backend is required; RSVP and guestbook can optionally post to any JSON endpoint (a Google Sheets script is included).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ locally
```

Node 20+ is recommended (developed on Node 24). The build output in `dist/` is a static site — host it anywhere
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, any web server).

Deploying under a sub-path (e.g. `https://example.com/undangan/`): `npx vite build --base=/undangan/`.
All runtime asset paths go through `asset()` in `src/lib/links.ts`, which respects the base.

---

## The experience

| # | Section (`#id`) | 3D scene | Content |
|---|---|---|---|
| 1 | Cover → `#home` | Forest gate; a floating envelope opens, petals burst, the camera glides in | Couple names, personalised guest greeting, **Buka Undangan** |
| 2 | `#couple` | Mossy knoll, floral ring, clay figurines (breathing, blinking, waving) | Bride & groom, parents, quote |
| 3 | `#countdown` | Moonlit stone platform, floating timepiece showing real WIB time | Live countdown, calendar buttons |
| 4 | `#story` | Glowing stream, bridge, mushroom cottage, floating frames — the chapter you are reading lifts and glows | Timeline |
| 5 | `#event` | Ceremony clearing: benches, candlelit dais, floral arch whose blossoms grow in as you arrive, floating rings | Akad & resepsi cards, Google Maps, add-to-calendar (Google / .ics), copy address |
| 6 | `#gallery` | Ring of floating photo frames (click a frame to open it) | Grid + full-screen lightbox |
| 7 | `#rsvp` | Lantern-lit gazebo with string lights | RSVP form |
| 8 | `#wishes` | Wishing tree — one glowing tag per wish — and a moonlit pond | Guestbook |
| 9 | `#closing` | Camera rises toward the moon | Thank-you message, contacts |

Navigation is plain anchor links, so the browser's Back/Forward buttons walk through the scenes and every
section is reachable without touching the 3D scene.

---

## Personalising

Everything editable lives in **`src/config/wedding.ts`** (types in `src/config/types.ts`). No component or
scene code needs to change.

- **Remove the sample flag:** set `isSample: false` once real data is in. This hides the "data contoh" notices.
- **Names, parents, quote, story, events, venue, dress code, contacts, closing text.**
- **Dates:** ISO 8601 with an explicit offset, e.g. `2027-06-12T09:00:00+07:00`. `timeZone` (`Asia/Jakarta`) is used for every displayed date and time, the countdown, and the 3D clock.
- **Maps:** leave `mapsUrl` empty to auto-build a Google Maps search from venue name + address, or paste a share link.
- **Personal guest links:** `https://your-site/?to=Budi%20Santoso` shows "Kepada Yth. … Budi Santoso" and pre-fills the RSVP/guestbook name.
- **Link previews (WhatsApp, etc.):** crawlers do not run JavaScript, so also edit `<title>`, `description`, and the `og:*` tags in `index.html`. Use an absolute URL for `og:image` in production.

### Photos

The bundled gallery images are **original demo illustrations** (labelled "Ilustrasi contoh" in the UI) — not photos of anyone.
Replace them with the couple's photos:

1. Export each photo as WebP, 4:5 portrait: `1200×1500` (full) and `480×600` (thumb).
2. Put them in `public/images/gallery/` and `public/images/gallery/thumbs/`.
3. Update the `gallery` array (and set `isDemo: false` or remove it). The first 8 images also appear on the 3D frames.
4. Story chapters can point `image` at any thumbnail.

Regenerate the demo illustrations and the social preview image at any time with `npm run assets:gallery`.

### Music

By default a gentle, original music-box melody is synthesised in the browser (`src/audio/musicBox.ts`) — no file,
no licence needed. It starts only after the guest taps **Buka Undangan** (browsers block audio before a user gesture)
and pauses when the tab is hidden. To use a licensed track, see `public/audio/README.txt`.

---

## RSVP & guestbook — what is actually saved

The UI always tells guests the truth about where their data goes.

**RSVP** (`src/services/rsvp.ts`) picks a mode automatically:

| Mode | When | Behaviour |
|---|---|---|
| `endpoint` | `rsvp.endpoint` is set | POSTs JSON; shows success only after a 2xx response |
| `whatsapp` | `rsvp.whatsappNumber` is a real number (e.g. `6281234567890`) | Opens WhatsApp with a pre-filled message; tells the guest to press *Kirim* |
| `demo` | neither configured (current sample) | Validates, then states clearly that nothing was sent or stored |

**Guestbook** (`src/services/guestbook.ts`):

| Mode | When | Behaviour |
|---|---|---|
| `endpoint` | `guestbook.endpoint` is set | GET list / POST new wish; supports pre-moderation (`moderation: 'pre'`) |
| `local` | no endpoint (current sample) | Demo only: wishes are stored in *this browser's* localStorage, with a visible notice that other guests cannot see them |

Endpoint contract (both services; bodies are sent as `text/plain` JSON to avoid CORS preflight):

```
POST { type: "rsvp", name, attendance: "yes"|"no", guests, message, submittedAt }  → { ok: true }
GET  ?type=wishes                                                               → { wishes: [{ id, name, message, createdAt }] }
POST { type: "wish", name, message }                                            → { ok: true, pending?: boolean, wish?: {...} }
```

### Backend: Google Sheets (optional, free)

`integrations/google-apps-script/Code.gs` implements the contract above on a Google Sheet:

1. Create a Google Sheet → **Extensions → Apps Script**, paste `Code.gs`, save.
2. **Deploy → New deployment → Web app**, *Execute as:* Me, *Who has access:* Anyone. Authorise.
3. Copy the `/exec` URL into both `rsvp.endpoint` and `guestbook.endpoint`.
4. For moderated wishes set `MODERATION = true` in the script and `guestbook.moderation: 'pre'` in the config; tick the *Approved* column to publish a wish.

The script sanitises input (length caps, control characters, spreadsheet-formula injection). It has no spam protection
beyond that — for a public link with many guests, consider adding a honeypot field or rate limiting.
*This script was written to the contract but has not been run against a live Google deployment in this environment; test one RSVP and one wish after deploying.*

---

## How the 3D scroll storytelling works

```
native scroll ──► GSAP ScrollTrigger (animation/scrollScene.ts)
                    measures each [data-scene] section → "hold" and "travel" ranges
                    writes sceneFx.qTarget (camera path parameter)
                          │
opening timeline ──► sceneFx.intro / seal / flap / letter / away (animation/opening.ts, GSAP)
                          │
                          ▼
CameraRig (scene/CameraRig.tsx) — the ONLY writer of camera + environment
  damps q → samples Catmull-Rom curves through scene/waypoints.ts
  sets camera.setViewOffset() so the subject sits beside the text panel
  blends fog / warm light / moon per section into envState
                          │
                          ▼
props & effects read envState (e.g. arch blossoms grow as section → 4)
```

- **`src/scene/waypoints.ts`** is the timeline: each section has an `enter` and `exit` camera key (a slow push-in while reading), a screen `frame` for desktop and mobile, and an environment (`fog`, `light`, `moon`). Edit numbers here to re-compose a shot.
- Everything is a pure function of scroll position, so scrolling up reverses the scene exactly. Nothing is pinned or hijacked; the page scrolls natively.
- Portrait screens use a wider FOV, pull the camera back, and frame the subject in the top half above the content panel.
- Reduced motion: the camera snaps to each section's composition instead of gliding, particles freeze, the envelope animation is skipped.

### Adding a section

1. Add a `<section id="…" data-scene className="section …">` in `src/App.tsx` at the right position.
2. Add a matching entry to `WAYPOINTS` (same order) and to `NAV_ITEMS` in `src/components/Nav.tsx`.
3. Optionally build a set piece in `src/scene/props/` and mount it in `src/scene/World.tsx` inside `<Near>`.

---

## Performance & resilience

- **Code-split:** the cover paints from the main bundle (~177 KB gzip); three.js and the forest load lazily (~296 KB gzip).
- **Quality tiers** (`src/lib/device.ts`): high (desktop) / medium (phones) / low (≤4 cores and low memory). Tiers scale tree, grass, firefly, petal and mist counts, canopy detail, and DPR (1.75 / 1.5 / 1.1).
- **Adaptive:** Drei `PerformanceMonitor` turns off bloom first, then lowers DPR, if the frame rate drops.
- **Cheap rendering:** instanced meshes for all vegetation, rocks, lanterns and benches; GPU-animated point sprites for fireflies, dust, halos and stars; one moving warm light plus hemisphere + moon; no real-time shadows. Set pieces outside ~50 m are hidden.
- Measured in headless Chrome on the mobile tier: 43–142 draw calls and ~290–350k triangles per scene.
- **Fallbacks:** if WebGL is unavailable, fails, or the context is lost, the page swaps to a 2D twilight forest built from the SVG pack. Guests can also choose **Mode ringan** (leaf button) to turn 3D off; the choice is remembered on that device.
- **Profiling:** open with `?debug` and inspect `window.__etfRenderer.info` in the console.

## Accessibility

Semantic landmarks and headings; skip link; all content is HTML (the 3D scene is `aria-hidden`); visible focus rings;
labelled form controls with `aria-invalid` + described errors and focus moved to the first error; lightbox with focus trap,
Esc/←/→ and swipe; `inert` main content while the cover is shown; `prefers-reduced-motion` respected in CSS, Framer Motion and the 3D rig;
44px+ touch targets; 16px form text (no iOS zoom); no horizontal scrolling at 360px.

---

## Project structure

```
index.html                 static meta / link preview tags
public/
  assets/svg/              supplied SVG illustration pack (2D fallback, dividers, empty states)
  assets/data/             original sample JSON from the asset pack (superseded by src/config/wedding.ts)
  images/gallery/          demo illustrations (+ thumbs/) — replace with real photos
  images/og-cover.jpg      social preview image
  audio/                   optional licensed music
scripts/generate-gallery.mjs   reproducible generator for the demo illustrations + og image
integrations/google-apps-script/Code.gs   optional Google Sheets backend
src/
  App.tsx, main.tsx
  config/                  wedding data + types   ← edit this
  sections/                page sections (Hero, Couple, Countdown, Story, Event, Gallery, RSVP, Wishes, Closing)
  components/              Cover, Nav, TopBar, Lightbox, Toast, fallback backdrop, icons, monogram, UI primitives
  animation/               scroll→scene sync, opening timeline, shared easing
  scene/                   Canvas host, World, CameraRig, waypoints, layout map, materials, procedural geometry/textures
    environment/           sky + stars + moon, lighting/fog, terrain + path, forest, vegetation, lanterns
    effects/               fireflies & dust, mist, petals, glow point shader
    props/                 envelope, figurines, gate, clearings, moon platform, story glade, ceremony, gallery ring, gazebo, wishing tree
  services/                RSVP + guestbook adapters
  audio/                   generative music box + player
  hooks/, lib/, state/, styles/
```

---

## Dependencies & licences

| Package | Use | Licence |
|---|---|---|
| react, react-dom | UI | MIT |
| three | WebGL | MIT |
| @react-three/fiber, @react-three/drei, @react-three/postprocessing | React renderer + helpers + bloom | MIT |
| postprocessing | effect composer | Zlib |
| gsap (ScrollTrigger) | scroll sync, opening timeline | GSAP Standard "No Charge" licence (free, incl. commercial use) |
| framer-motion | DOM transitions, dialogs | MIT |
| zustand | app state | MIT |
| @fontsource/cormorant-garamond, @fontsource-variable/plus-jakarta-sans | self-hosted fonts (full Latin / Indonesian coverage) | SIL OFL 1.1 |
| vite, @vitejs/plugin-react, typescript | build (dev only) | MIT / Apache-2.0 |
| sharp | demo-illustration generator (dev only) | Apache-2.0 |

**Assets**

- SVG illustrations in `public/assets/svg/` — from the supplied *Enchanted Twilight Forest* asset pack.
- All 3D models — procedural geometry written for this project (`src/scene/geometry.ts`, `src/scene/props/`); no third-party models.
- Gallery/og images — original illustrations generated by `scripts/generate-gallery.mjs`.
- Textures (moon, mist, glow, rune ring, invitation card, wish tags) — drawn at runtime on canvas (`src/scene/textures.ts`).
- Music — original melody synthesised at runtime.

---

## Known limitations

- **No GLB/glTF models.** Blender was not available, so every model is procedural three.js geometry in a consistent clay style. To swap in a custom model, load it with Drei's `useGLTF` inside the relevant prop component (wrap it in `SceneErrorBoundary` + `Suspense` like `PhotoFrame.tsx`) and compress it with `gltf-transform`.
- **No compressed (KTX2) textures** — the only bitmap textures are the small WebP gallery thumbnails; everything else is procedural.
- **Not tested on physical phones.** Verified in headless Chrome at 360×740, 390×844, 768×1024, 1440×900 and 1920×1080, including WebGL-disabled and reduced-motion runs. Check on a mid-range Android before sharing widely.
- React Three Fiber 9.8 logs a `THREE.Clock … deprecated` warning with three r186; it is harmless and comes from the library, not this code.
- The current config is sample content: RSVP runs in demo mode and the guestbook is browser-local until an endpoint or WhatsApp number is configured.
