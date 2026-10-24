# 3D models (optional)

No `.glb`/`.gltf` models were supplied with the asset pack. Every 3D object in the Toy World (houses, trees, cake, gifts, the bear mascot, cars, blocks, balloons, carousel, …) is built procedurally in `src/components/scene/`.

To use a **properly licensed** GLB model instead:

1. Place it here, e.g. `public/models/toy-train.glb`.
2. Load it with drei inside the scene:

   ```tsx
   import { useGLTF } from '@react-three/drei';

   function ToyTrain() {
     const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/toy-train.glb`);
     return <primitive object={scene} position={[16, 0, -8]} scale={0.6} />;
   }
   useGLTF.preload(`${import.meta.env.BASE_URL}models/toy-train.glb`);
   ```

3. Add its footprint to `CAMERA_OBSTACLES` in `src/config/world.ts`. In dev, `validateLayout()` will then warn you if the camera path would clip it.
