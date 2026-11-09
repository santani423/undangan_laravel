# Little Smile Dental Adventure

An interactive, scroll-driven 3D birthday invitation. Guests travel across a floating
candy-cake island with Dr. Smiley and the Tooth Friends. Each scroll moves the camera to a
new stop on the path and reveals one part of the invitation:

| # | Section | 3D scene | What guests can do |
|---|---------|----------|--------------------|
| 1 | Welcome | Toothbrush gate, extruded 3D title, Dr. Smiley waving | See name, age, date and a live countdown; start the adventure |
| 2 | Invitation | Floating envelope that opens as you scroll; the card rises out | Read the invitation message |
| 3 | When & where | Calendar, ticking alarm clock and bouncing map pin | Countdown, open Google Maps, download a calendar file (.ics) or add it to Google Calendar |
| 4 | Activities | Toys on pedestals (blocks, toothbrush, camera, cake, gifts, balloons) | Open details for each activity from a card or by tapping its toy |
| 5 | Gallery | Polaroids that flip onto a clothesline | Open any photo in a lightbox (keyboard, buttons or swipe) |
| 6 | Cake | Three-tier cake with flickering candles under a birthday banner | Make a wish (button or tap the cake) or blow into the microphone |
| 7 | RSVP | Signboard and mailbox | Fill in the form; WhatsApp opens with the reply written out |
| 8 | Thank you | Camera pulls up over the island; everyone gathers at the maypole; fireworks at dusk | Confirm attendance, back to start, replay |

Scrolling backwards reverses everything (the envelope closes, the friends walk home, and the
fireworks stop). The page always scrolls normally: nothing is pinned or hijacked.

---

## Quick start

Requires **Node.js 18+**.

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # production build → dist/
npm run preview      # serve dist/ at http://localhost:4173
```

## Personalise the invitation

Edit **one file**: [`src/config/invitation.js`](src/config/invitation.js). Every value marked
`SAMPLE` is demo data.

- **Child:** `name`, `age` (also sets the number of candles, 1–12) and `pronoun`.
- **Event:** `date`, `startTime`, `endTime`, `utcOffset` (e.g. `'+07:00'` for Jakarta),
  `timeZoneLabel`, `locale` and `dressCode`.
- **Venue:** `name`, `address`, plus an optional `mapsUrl` or `coordinates` for the Maps button.
- **Host:** `names` and **`whatsappNumber`** (international format, digits only, e.g. `6281234567890`).
  The sample number `6280000000000` is fake. Replace it.
- **RSVP:** `maxGuestsPerReply`, `deadline` and `messageMaxLength`.
- **Copy:** the invitation message, notes, and the final message. Use `{name}`, `{age}`,
  `{ageOrdinal}` (“fifth”) or `{pronoun}` in any text and it fills in automatically.
- **Activities:** title, time, summary, details and `icon`
  (`games | cake | photo | gift | dental | balloons`). The icon picks both the card
  illustration and the 3D toy.
- **Gallery:** `src`, `alt` and `caption` for each photo.
- **Theme:** the page colours and the main pastel colours of the 3D world.
- **Audio:** whether “Start the adventure” also starts the music, the volumes, and optional audio files.
- **Models:** optional GLB files (see below).

Names, dates and venue are written once in the config and used everywhere: the page, the 3D
invitation card, the calendar file, the WhatsApp message and the countdown.

### Replace the photos

1. Put your photos in `public/assets/images/gallery/` (JPG/WebP, about 1200 px, square-ish works best).
2. Point `gallery[].src` at them, e.g. `'/assets/images/gallery/alya-at-the-beach.jpg'`.
3. Write a real `alt` text for each photo.

The six images supplied are labelled placeholders (“Your photo here”). They are not photos.

### Add your own 3D models (optional)

The whole world is procedural, so no model files are needed. To swap in your own:

1. Export a `.glb` (Y-up, facing +Z, origin at the feet). Size doesn't matter; models are auto-scaled.
2. Put it in `public/assets/models/`.
3. Set `models.mascot`, `models.toothFriend` or `models.cake` in the config.

An animation clip named `idle` (or the first clip) loops automatically. The cake model keeps
the interactive candles on top. A missing or broken file logs a warning, and the built-in model
stays. See [ASSETS.md](ASSETS.md) for details.

### Add your own music and sounds (optional)

By default, a music-box version of “Happy Birthday to You” (public domain) and all sound
effects are synthesised in the browser. To use licensed files instead, drop them into
`public/assets/audio/` and set `audio.files.*` in the config.

## Deploy

`npm run build` produces a static site in `dist/` with relative paths. It works from a domain
root or a sub-folder, and needs no server code.

- **Netlify:** drag `dist/` onto app.netlify.com/drop, or connect the repo (build `npm run build`, publish `dist`).
- **Vercel:** import the repo; it detects Vite automatically.
- **GitHub Pages:** push the contents of `dist/` to a `gh-pages` branch (or use a Pages workflow).
- **Any web host:** upload the contents of `dist/`.

Use **HTTPS**. Browsers only allow the microphone and the “Copy message” button on secure pages
(`localhost` is fine for testing).

## Testing

```bash
npm test               # unit tests (dates/countdown, .ics, RSVP + WhatsApp, config) — Node only
npm run check:assets   # every referenced file exists; lists optional slots; warns about the sample WhatsApp number
npm run build && npm run test:e2e   # end-to-end in Google Chrome (needs Chrome installed)
```

`test:e2e` serves `dist/` and drives the real site with playwright-core. It checks:

- Every interaction: navigation, countdown, envelope, Maps, the downloaded .ics contents,
  dialogs, 3D click-to-open, the lightbox, cake and microphone, RSVP validation and the
  WhatsApp URL, music and sound toggles, finale, back-to-start and replay.
- Backward scrolling.
- Mobile layout and touch-target sizes.
- The no-WebGL fallback, reduced motion, past and live countdowns, a missing photo, and optional model loading.

Set `E2E_SOFTWARE_GL=1` on machines without a GPU, or `E2E_URL=http://…` to test a running server.
The page exposes a small debug handle, `window.__smile`, which the tests use to inspect the 3D state. It holds nothing that isn't already public on the page.

**Preview helpers** (URL parameters, safe to leave in):

| Parameter | Effect |
|-----------|--------|
| `?now=2026-12-05T16:00:00+07:00` | Pretend it's another moment (check the “party is happening now / has ended” states) |
| `?nowebgl` | Show the illustrated version used when WebGL is unavailable |
| `?quality=low` / `?quality=high` | Force the mobile or desktop 3D quality tier |

### Test results (run on this project, 23 Oct 2026)

| Check | Environment | Result |
|-------|-------------|--------|
| `npm run build` | Vite 8.3.5, Node 24.19 | ✅ builds, no warnings |
| `npm test` | Node 24.19 | ✅ 19/19 |
| `npm run check:assets` | — | ✅ all referenced files present |
| `npm run test:e2e` on the production build | Chrome 155 headless, Intel Iris Xe GPU (D3D11) | ✅ 79/79 |
| `npm run test:e2e` on the dev server | same | ✅ 79/79 |
| Frame rate, steady state per section | 1440×900, Iris Xe (integrated GPU) | High tier with shadow maps: 37–44 fps. Adaptive quality then drops shadow maps on this GPU: 42–60 fps. Low tier (`?quality=low`): 44–60 fps. 330–440 draw calls |
| Visual review (screenshots of every section) | 1440×900, 768×1024, 390×844, 844×390 | reviewed and adjusted |

**Not verified:** Safari, Firefox and real phones were not available in this environment.
Mobile was tested with Chrome's device emulation. Real WhatsApp delivery depends on the
guest's device. The test checks the generated `wa.me` link and message.

## Project structure

```text
index.html                    semantic content for all eight sections, dialogs, loader
public/
  favicon.svg
  assets/
    asset-manifest.json        what's included, what's optional, where each asset is used
    images/                    supplied SVGs + created icons + gallery placeholders
    fonts/                     Fredoka typeface JSON for the 3D title (generated, OFL)
    models/ audio/ textures/   empty optional slots, each with a README
src/
  main.js                      boots everything, binds config to the page, wires interactions
  config/
    invitation.js              ← the file you edit
    scene-plan.json            section ids/titles/camera names (from the asset pack)
  scene/                       three.js (loaded lazily as its own chunk)
    index.js                   creates the renderer, loads images/font, builds the world
    SceneManager.js            renderer, single render loop, picking, resize, pause, disposal
    CameraController.js        scroll → camera path, framing beside/above the text
    WorldBuilder.js            island, path, the eight stations, characters, effects, mood lighting
    CharacterFactory.js        procedural tooth characters and accessories
    PropFactory.js             envelope, cake, gate, calendar, clock, pin, mailbox, trees…
    TitleText.js               per-letter 3D title
    stations.js                where each scene is and how the camera frames it
    artwork.js, textures.js    canvas-drawn card faces, signs, stripes
    mergeStatic.js             batches static scenery into fewer draw calls
    effects/                   confetti, fireworks, bubbles, sparkles
    AssetLoader.js, quality.js optional GLB loading, device quality tiers
  animations/ScrollExperience.js  GSAP ScrollTrigger timelines and section tracking
  components/                  Countdown, CalendarDownload, RSVPForm, MusicController,
                               Gallery, Activities, CakeInteraction, Navigation, Loader, Dialog, Toast
  styles/                      theme.css (supplied), main.css, responsive.css, animations.css
  utils/                       helpers.js, date.js (pure, unit-tested)
scripts/                       e2e test, asset check, font + placeholder generators
tests/                         node:test unit tests
docs/asset-pack/               original documentation from the starter pack
```

## Accessibility and performance

- All content and every action exist as real HTML. The 3D canvas is a visual layer, and each
  thing you can click in 3D also has a button or link.
- Keyboard: skip link, visible focus, native `<dialog>` modals (Esc, focus returns to the
  opener), arrow keys in the lightbox, and labelled form fields with inline errors.
  Focus moves to the first invalid field.
- `prefers-reduced-motion`: no camera fly-throughs (scene cuts instead), no intro animation,
  fireworks or floating decorations, minimal confetti and character motion, and content is
  visible immediately.
- Without WebGL (or if the GPU context is lost) the page switches to an illustrated version
  built from the supplied SVGs. Everything still works.
- The 3D code loads as a separate chunk after the page is usable. The pixel ratio is capped
  (2 on desktop, 1.5 on phones). If the frame rate stays under 45 fps, the renderer lowers
  the pixel ratio and then turns off shadow maps (soft blob shadows remain). Phones and
  low-memory devices start on the low tier: no shadow maps, about half the particles and fewer
  decorations. Rendering pauses when the tab is hidden, and static scenery is batched into
  shared meshes.

## Known limitations

- **No real photos, models or music are included.** The pack didn't have any, so the gallery
  uses labelled placeholders, the world is procedural, and the music and sound effects are
  synthesised in the browser.
- **RSVPs are not stored.** WhatsApp opens with a pre-filled message, and the guest must press
  send. The site says so plainly. Collecting replies in a spreadsheet would need a form service or backend.
- **The time zone is a fixed UTC offset.** Daylight-saving changes aren't applied. Fine for
  WIB/SGT and similar zones; double-check for zones with DST.
- **The microphone uses a simple loudness check.** Loud talking or clapping also counts as
  blowing. It needs HTTPS, and some in-app browsers block the microphone. The button
  alternative always works.
- **The 3D title covers Latin script** (Basic Latin + Latin-1). For other scripts, regenerate
  the font with `npm run build:font` after pointing the script at a suitable font. The HTML
  text uses Fredoka/Nunito with the system font as fallback.
- **The 3D scenes are tuned for up to about 8 activities and 8 photos.** Extra items still
  appear in the HTML lists but not on the island.
- Tested in Chrome only (see test results above).

## Credits and licences

- Starter illustrations, theme tokens and scene plan: `little_smile_dental_adventure_assets.zip`.
- Fonts: [Fredoka](https://github.com/hafontia/Fredoka-One) and
  [Nunito](https://github.com/googlefonts/nunitoFont), SIL Open Font License 1.1, self-hosted
  via @fontsource.
- Music: “Happy Birthday to You” melody, public domain, arranged and synthesised in code.
- Libraries: [three.js](https://threejs.org) (MIT), [GSAP + ScrollTrigger](https://gsap.com)
  (free “no charge” licence), [Vite](https://vite.dev) (MIT).
- If you add models, photos or audio, keep proof that you may use them (see ASSETS.md).
