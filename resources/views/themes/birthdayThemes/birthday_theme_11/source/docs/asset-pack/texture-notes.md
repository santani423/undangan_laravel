# Texture and material notes

This pack includes vector artwork and style tokens, not baked PBR texture maps.
For a cohesive 3D look, create Three.js materials using these starting values:

- Tooth porcelain: MeshStandardMaterial, color #F7FDFF, roughness 0.28, metalness 0.0
- Pastel plastic: roughness 0.32, metalness 0.0
- Balloon latex: roughness 0.22, clearcoat 0.45 where supported
- Cake icing: roughness 0.4
- Wood props: roughness 0.72
- Use soft ambient fill plus a large key light; avoid harsh shadows.

Suggested environment textures to create/export as JPG or WebP:
- sky pastel gradient with soft clouds
- rolling mint-green grass
- confetti/candy sprinkle seamless pattern
