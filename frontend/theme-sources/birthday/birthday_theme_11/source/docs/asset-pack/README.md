# Little Smile Dental Adventure — Starter Asset Pack

This ZIP is a starter asset pack for a pastel, dental-themed 3D birthday invitation website.

## Included
- Editable SVG illustrations: Dr. Smiley tooth mascot, tooth friend, birthday cake, gift box, balloons, toothbrush, invitation envelope, calendar, and location pin.
- CSS theme tokens and reusable button/card/section styles.
- Scene-plan JSON mapping the eight scroll sections to the relevant feature.
- Texture/material guidance and a checklist for the 3D models and audio files that should be added.

## Important scope note
This pack is **not a complete production 3D asset library**: it does not include animated GLB/GLTF scene models, baked texture maps, or licensed music/SFX. The SVGs are useful as 2D assets, billboards, UI art, and visual placeholders while you build or source the 3D scenes. The README in `models/README_PLACEHOLDERS/` lists the recommended model set.

## Suggested stack
- Three.js for 3D rendering
- GSAP + ScrollTrigger for scroll-driven camera timelines
- HTML/CSS for readable invitation content and controls
- Web Audio API for user-controlled sound

## Quick start
1. Copy `images/` and `ui/` into your web project's public assets directory.
2. Load `ui/theme.css`.
3. Read `docs/scene-plan.json` to wire each scroll section to a camera scene.
4. Replace SVG placeholders with GLB/GLTF assets as they become available.
5. Keep RSVP, map links, countdown date, and music controls functional and accessible.

## Visual direction
Pastel sky blue, candy pink, mint, butter yellow, and warm cream; soft toy-like forms; rounded UI; gentle lighting; low-intensity shadows; smooth camera movement.
