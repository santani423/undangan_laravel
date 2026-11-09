import { useMemo } from 'react';
import type { QualitySettings } from '../lib/quality';
import { Fireflies } from './Fireflies';
import { FloatingGift, GalleryEasels, Guestbook, MapPin, PalettePillars, WeddingRings } from './GardenProps';
import type { SwayConfig } from './materials';
import { Pond } from './Pond';
import { Terrain } from './Terrain';
import { VoxelInstances } from './VoxelAsset';
import { WindGrass } from './WindGrass';
import {
  BENCHES,
  BLOSSOM_TREES,
  CEREMONY_ARCH,
  COTTAGE,
  ENTRANCE_ARCH,
  FEATURE_TREES,
  FLOWERS,
  GIFTS,
  GRASS_TILES,
  LANTERNS,
  generatePeripheralTrees,
  pathStations,
} from './worldLayout';

// Rigid canopy sway: only foliage materials rotate around the top of the trunk.
const TREE_SWAY: SwayConfig = { pivotY: 1.24, amplitude: 0.022, materials: ['leaf', 'leaf_light'] };
const BLOSSOM_SWAY: SwayConfig = { pivotY: 0.98, amplitude: 0.026, materials: ['rose', 'blush', 'white'] };
const FLOWER_SWAY: SwayConfig = { pivotY: 0, amplitude: 0.035 };

const ARCHES = [ENTRANCE_ARCH, CEREMONY_ARCH];
const COTTAGES = [COTTAGE];

interface GardenEnvironmentProps {
  settings: QualitySettings;
  palette: string[];
  galleryImages: string[];
  animate: boolean;
  pixelRatio: number;
}

/** Every object in the one continuous voxel garden. */
export function GardenEnvironment({ settings, palette, galleryImages, animate, pixelRatio }: GardenEnvironmentProps) {
  const peripheral = useMemo(() => generatePeripheralTrees(settings.peripheralTrees), [settings.peripheralTrees]);
  const voxelTrees = useMemo(() => [...FEATURE_TREES, ...peripheral.filter((t) => t.model === 'voxel_tree')], [peripheral]);
  const blossomTrees = useMemo(() => [...BLOSSOM_TREES, ...peripheral.filter((t) => t.model === 'blossom_tree')], [peripheral]);
  const stones = useMemo(
    () =>
      pathStations(1.3).map((s, i) => ({
        x: s.x,
        y: 0.03,
        z: s.z,
        rotY: s.angle + (i % 2 ? Math.PI : 0) + Math.sin(i * 12.9898) * 0.12,
        scale: 1.3,
      })),
    [],
  );

  return (
    <>
      <Terrain receiveShadow={settings.shadows} />
      <Pond />
      <WindGrass bladeCount={settings.grassBlades} flowerCount={settings.meadowFlowers} receiveShadow={settings.tier === 'high'} />

      <VoxelInstances model="stepping_stones" placements={stones} castShadow={false} />
      <VoxelInstances model="grass_tile" placements={GRASS_TILES} castShadow={false} />
      <VoxelInstances model="voxel_tree" placements={voxelTrees} sway={TREE_SWAY} />
      <VoxelInstances model="blossom_tree" placements={blossomTrees} sway={BLOSSOM_SWAY} />
      <VoxelInstances model="wedding_arch" placements={ARCHES} />
      <VoxelInstances model="garden_cottage" placements={COTTAGES} />
      <VoxelInstances model="garden_bench" placements={BENCHES} />
      <VoxelInstances model="garden_lantern" placements={LANTERNS} />
      <VoxelInstances model="flower_arrangement" placements={FLOWERS} sway={FLOWER_SWAY} />
      <VoxelInstances model="gift_box" placements={GIFTS} />

      <FloatingGift animate={animate} />
      <WeddingRings animate={animate} />
      <MapPin animate={animate} />
      <Guestbook />
      <GalleryEasels images={galleryImages} />
      <PalettePillars palette={palette} />
      <Fireflies count={settings.fireflies} pixelRatio={pixelRatio} />
    </>
  );
}
