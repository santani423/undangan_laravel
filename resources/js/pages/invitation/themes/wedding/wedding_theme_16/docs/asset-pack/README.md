# Undesia Original Voxel Wedding Invitation Asset Pack

This is a starter asset pack for an original voxel / block-based 3D wedding invitation website. It is inspired by the broad visual idea of a stylized sandbox world, but it does **not** contain Minecraft textures, models, characters, logos, sounds, fonts, UI, or other proprietary game assets.

## Contents
- `models/`: original low-poly voxel props in OBJ format plus one shared MTL palette.
- `textures/`: seamless-style SVG starter textures for grass, dirt, stone, wood, ivory fabric, and water.
- `icons/`: original SVG icons for event date, location, music, gift, love story, and gallery.
- `asset-manifest.json`: asset inventory and integration notes.
- `docs/threejs-integration-example.tsx`: a minimal example showing how to load an OBJ asset with Three.js / React Three Fiber.

## Integration notes
1. Keep `voxel_wedding_palette.mtl` beside the OBJ models so material assignments can be resolved.
2. In Three.js, use `OBJLoader` and `MTLLoader` from `three/examples/jsm/loaders`; alternatively convert OBJ to GLB in Blender.
3. For best performance, convert the models to GLB, merge repeated meshes, and use instancing for repeated grass/flowers/lanterns.
4. The scene should be a continuous camera journey driven by scroll, with DOM sections for all invitation features: cover, couple, countdown, ceremony/reception, map, love story, gallery/video, RSVP, guestbook, dress code, digital gift, music control, and closing.
5. Keep critical invitation text and form controls in accessible HTML, not only in the 3D scene.
6. Use reduced-motion fallbacks and a non-WebGL/mobile-friendly layout.
7. Grass wind animation is not baked into these static assets. Implement it in the React/Three.js scene with shader-based sway or lightweight instanced blades.

## Legal / commercial use
These assets are generated as original project starter materials. They are not official Minecraft assets and are not intended to imitate Minecraft branding or imply endorsement. Use your own licensed photos, music, couple names, maps, QRIS/payment details, and any third-party resources.
