# Textures

No bitmap textures are needed. Following `texture-notes.md` from the asset pack, materials
are pastel `MeshStandardMaterial`s (porcelain teeth roughness 0.28, plastic 0.32, balloon latex
0.22 with clearcoat, icing 0.4, wood 0.72). Patterned surfaces (candy stripes, lollipop swirls,
the invitation card, calendar and clock faces, polaroids, signs and the sky gradient) are drawn
on canvas at runtime from the invitation config. See `src/scene/textures.js` and
`src/scene/artwork.js`.

This folder is kept for your own JPG/WebP/KTX2 textures if you extend the world.
