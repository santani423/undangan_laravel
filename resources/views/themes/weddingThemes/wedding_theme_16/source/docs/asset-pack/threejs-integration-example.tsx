// Minimal React Three Fiber example (adjust paths to your public folder).
// Requires: three, @react-three/fiber, three/examples/jsm/loaders/OBJLoader
import { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function VoxelTree() {
  const tree = useLoader(OBJLoader, '/assets/models/voxel_tree.obj');
  return <primitive object={tree} position={[0, 0, 0]} />;
}

export function GardenScene() {
  return (
    <Canvas camera={{ position: [4, 3, 7], fov: 45 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 4]} intensity={2} castShadow />
      <Suspense fallback={null}>
        <VoxelTree />
      </Suspense>
    </Canvas>
  );
}
