# Pawiwahan Agung — Javanese 3D Wedding Invitation Asset Pack

This is a **starter asset pack** for a scroll-driven 3D wedding invitation website inspired by Javanese heritage.

## Included
- Initial color and material textures (wood, stone, grass ground, soil, brass)
- Kawung and parang batik tile textures
- SVG ornamental divider, kawung motif, photo frame, and UI icons
- Scroll-scene manifest mapping nine scenes to wedding features
- Grass wind shader snippet
- CSS theme tokens and starter panel/button styles
- Folder structure for production GLB models, photos, audio, and HDR environment maps

## Important limitation
This archive does **not** contain finished production 3D models (`.glb/.gltf`), licensed wedding photographs, an HDRI environment map, or licensed gamelan music. Those assets must be generated, modeled, or sourced separately. Empty model/image/audio folders are intentionally included as organized destinations, not as functioning models.

## Suggested production models
### Architecture
- `models/architecture/entrance-gate.glb`
- `models/architecture/joglo-pavilion.glb`
- `models/architecture/gebyok-panel.glb`
- `models/architecture/carved-pillars.glb`
### Environment
- `models/environment/tropical-tree.glb`
- `models/environment/jasmine-plant.glb`
- `models/environment/stone-path.glb`
- `models/environment/animated-grass.glb` (or instanced grass generated in code)
### Props
- `models/props/lantern.glb`
- `models/props/guest-table.glb`
- `models/props/wedding-stage.glb`
- `models/props/photo-frame.glb`
- `models/props/gift-table.glb`
- `models/props/gift-box.glb`

## How to use
1. Copy `assets/wedding-jawa/` into your app's `public/assets/` directory.
2. Read `scene-manifest.json` to map scroll ranges to features.
3. Use SVG files directly in React or HTML.
4. Load tile textures with Three.js and set `texture.wrapS` / `texture.wrapT` to `THREE.RepeatWrapping` when tiling is desired.
5. Treat `normal_placeholder.png` files as neutral placeholders, not measured normal maps.
6. Implement camera motion using GSAP ScrollTrigger and use a reduced-motion fallback.
7. Optimize final models with glTF compression and texture compression before shipping.

## Texture notes
- Base-color textures are starter stylized textures and may need art direction and PBR refinement.
- `roughness.png` maps are neutral starter values, not physically scanned material data.
- `normal_placeholder.png` and `ambient_occlusion_placeholder.png` are placeholders, not production maps.

## Cultural/art direction
Keep the visual language cohesive: teak brown, ivory, champagne gold, leafy green, carved wood, batik details, and natural garden motion. If the invitation should represent a specific Javanese regional style (e.g. Yogyakarta or Surakarta), review the relevant dress, ornament, and ceremonial references before final modeling.
