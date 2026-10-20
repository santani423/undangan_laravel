No production GLB models are included in the asset pack. All architecture and props
are generated procedurally in `src/components/3d/objects/`. To swap in a model later,
add the .glb here, register it in `src/config/assets.ts` and load it with drei's useGLTF.
