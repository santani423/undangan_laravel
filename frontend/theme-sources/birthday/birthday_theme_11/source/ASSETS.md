# Asset manifest

What the site uses, where each asset came from, and how to replace or add assets.
A machine-readable version is in [`public/assets/asset-manifest.json`](public/assets/asset-manifest.json);
`npm run check:assets` confirms every referenced file exists.

## What was in the starter pack

| Starter pack file | Status | Used in this project |
|---|---|---|
| `images/dr-smiley.svg` | ✅ used | Loading screen, hero fallback art, RSVP signboard artwork in 3D, gallery placeholder 6, and the reference for the procedural Dr. Smiley (cap with cross, white coat, toothbrush) |
| `images/tooth-friend.svg` | ✅ used | Header brand, favicon, invitation card artwork in 3D, gallery fallback art, placeholder 1, and the reference for the procedural tooth friends |
| `images/birthday-cake.svg` | ✅ used | “Cake cutting” icon, cake fallback art, placeholder 3, and the reference for the 3D cake (pink/blue/cream tiers, drips, candy dots) |
| `images/gift-box.svg` | ✅ used | “Gift exchange” icon, RSVP fallback art, placeholder 5, and the reference for 3D gifts |
| `images/balloons.svg` | ✅ used | “Balloon goodbye” icon, invitation card artwork, activities/finale fallback art, placeholder 2 |
| `images/toothbrush.svg` | ✅ used | “Dental adventure” icon, placeholder 4, and the reference for the giant toothbrush gate |
| `images/envelope.svg` | ✅ used | Invitation fallback art, and the reference for the 3D envelope (lavender body, flap, pink smile seal) |
| `images/calendar.svg` | ✅ used | Details fallback art, and the reference for the 3D calendar face (pink header, blue number, yellow and mint dots) |
| `images/location-pin.svg` | ✅ used | Reference for the 3D map pin |
| `ui/theme.css` | ✅ used | Loaded first as `src/styles/theme.css`. Tokens, `Fredoka`/`Nunito` and the pressable pink button style are the base of the design |
| `docs/scene-plan.json` | ✅ used | `src/config/scene-plan.json` defines the section ids, titles and camera names that drive navigation and the camera |
| `textures/texture-notes.md` | ✅ followed | Material values (porcelain 0.28, plastic 0.32, latex 0.22 + clearcoat, icing 0.4, wood 0.72), soft key + fill lighting |
| `models/README_PLACEHOLDERS/README.md` | ⚪ checklist only | No models were supplied. Everything is procedural; three optional GLB slots exist (below) |
| `audio/README.md` | ⚪ checklist only | No audio was supplied. Music and effects are synthesised; four optional file slots exist (below) |
| `preview.html` | — | Not needed in the build |

Copies of the pack's documentation are kept in [`docs/asset-pack/`](docs/asset-pack/).

The SVGs in `public/assets/images/` are the originals with one change: explicit `width`/`height`
attributes matching their `viewBox`. This lets every browser draw them onto the canvas
textures. The artwork is unchanged.

## Created for this project

| File | What it is |
|---|---|
| `public/assets/images/icons/games.svg`, `camera.svg` | Activity icons in the same flat pastel style (no matching SVG in the pack) |
| `public/assets/images/gallery/photo-placeholder-1…6.svg` | **Placeholders, not photos**: pastel cards labelled “Your photo here”, built from the pack SVGs by `npm run build:placeholders` |
| `public/assets/fonts/fredoka-bold.typeface.json` | Fredoka Bold converted for three.js 3D text by `npm run build:font` (OFL 1.1) |
| `public/favicon.svg` | Copy of `tooth-friend.svg` |
| All 3D models | Procedural geometry in `src/scene/CharacterFactory.js` and `src/scene/PropFactory.js` |
| All 3D textures | Drawn on canvas at runtime (`src/scene/artwork.js`, `src/scene/textures.js`) |
| Music and sound effects | Synthesised with the Web Audio API (`src/components/MusicController.js`) |

## Optional slots

The site is complete without any of these. Each is off (`null`) in the config, so nothing is
requested and no 404s appear.

| Slot | Put the file in | Config key | Fallback when not set or failing |
|---|---|---|---|
| Dr. Smiley model | `public/assets/models/dr-smiley.glb` | `models.mascot` | Procedural Dr. Smiley |
| Tooth friend model | `public/assets/models/tooth-friend.glb` | `models.toothFriend` | Procedural friends (the one model is cloned six times) |
| Cake model | `public/assets/models/birthday-cake.glb` | `models.cake` | Procedural three-tier cake |
| Background music | `public/assets/audio/birthday-background.mp3` | `audio.files.music` | Music-box “Happy Birthday” |
| Button pop | `public/assets/audio/ui-pop.mp3` | `audio.files.pop` | Synthesised pop |
| Scene chime | `public/assets/audio/magic-chime.mp3` | `audio.files.chime` | Synthesised chime |
| Celebration | `public/assets/audio/celebration.mp3` | `audio.files.celebration` | Synthesised fanfare |
| Photos | `public/assets/images/gallery/*.jpg` | `gallery[].src` | A failed photo shows “Photo not found” in the grid and lightbox, and “Photo coming soon” on the 3D polaroid |

## Replacing a procedural model with your own

1. **Model it** in Blender (or source one with a suitable licence). Keep it light: under about
   20k triangles per character, `.glb` under about 2 MB. Draco or Meshopt compression is
   *not* enabled in the loader. Export uncompressed glTF Binary, or add the decoder to
   `src/scene/AssetLoader.js`.
2. **Orientation:** Y up, the front facing **+Z**, origin at the feet/base. Apply transforms before exporting.
3. **Scale:** any size. Characters are scaled to about 2.1 units tall (Dr. Smiley is then
   enlarged 1.55×), and the cake to the procedural cake's height so the candles sit on top.
4. **Animation (optional):** a clip named `idle` plays on loop; otherwise the first clip plays.
   The code still adds hopping, waving and walking on top by moving the whole model.
5. **Wire it up:** set the path in `src/config/invitation.js`, e.g.
   `models: { mascot: '/assets/models/dr-smiley.glb' }`, then `npm run dev` and check the console.
6. Interactive behaviour (click to cheer, gathering in the finale, candle blowing) keeps working
   because the model is placed inside the existing character/cake groups.

To replace any other prop (gifts, gate, trees…), edit the factory function in
`src/scene/PropFactory.js`. Each returns a `THREE.Group`, so you can load a GLB there instead.

## Licensing checklist for anything you add

- Photos: only use pictures you have the right to share. Get consent from other families whose children appear.
- Models and audio: original work, or a licence that allows commercial use, modification and
  redistribution (e.g. CC0, CC-BY with attribution). Keep a copy of the licence or receipt.
- Attribution (if required) goes in the README credits and, if the licence asks for it, on the page footer.
