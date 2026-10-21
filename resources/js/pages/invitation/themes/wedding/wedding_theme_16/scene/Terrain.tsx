import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshLambertMaterial, PlaneGeometry } from 'three';
import { getTerrainLipMaterial, getVoxelMaterial } from './materials';
import { POND, TERRAIN, isInPond, mulberry32, terrainHeightAt } from './worldLayout';

const RIM_HEIGHT = 6;

interface Block {
    x: number;
    y: number;
    z: number;
}

/**
 * Builds terraced voxel columns: a flat valley around the path rising into
 * stepped hills. Columns only extend as deep as their lowest neighbour, so
 * hidden blocks are never generated.
 */
function buildTerrain(): { surface: Block[]; filler: Block[]; pondBlocks: Block[] } {
    const { cell, minX, maxX, minZ, maxZ } = TERRAIN;
    const cols = (maxX - minX) / cell;
    const rows = (maxZ - minZ) / cell;
    const top: number[][] = [];

    for (let i = 0; i < cols; i++) {
        top[i] = [];
        for (let j = 0; j < rows; j++) {
            const x = minX + i * cell + cell / 2;
            const z = minZ + j * cell + cell / 2;
            const edge = i === 0 || j === 0 || i === cols - 1 || j === rows - 1;
            top[i][j] = edge ? RIM_HEIGHT : isInPond(x, z) ? POND.floorY : terrainHeightAt(x, z);
        }
    }

    const heightAt = (i: number, j: number) => (i < 0 || j < 0 || i >= cols || j >= rows ? -1 : top[i][j]);
    const surface: Block[] = [];
    const filler: Block[] = [];
    const pondBlocks: Block[] = [];

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = minX + i * cell + cell / 2;
            const z = minZ + j * cell + cell / 2;
            const h = top[i][j];
            if (h === POND.floorY) {
                pondBlocks.push({ x, y: h, z });
                continue;
            }
            const lowest = Math.min(heightAt(i - 1, j), heightAt(i + 1, j), heightAt(i, j - 1), heightAt(i, j + 1));
            const depth = Math.max(1, Math.ceil(h - lowest));
            surface.push({ x, y: h, z });
            for (let k = 1; k < depth; k++) filler.push({ x, y: h - k, z });
        }
    }
    return { surface, filler, pondBlocks };
}

/** Writes block transforms (and a subtle per-block shade) into an instanced mesh. */
function writeBlocks(mesh: InstancedMesh | null, list: readonly Block[], shaded: boolean): void {
    if (!mesh) return;
    const rand = mulberry32(42);
    const m = new Matrix4();
    const tint = new Color();
    list.forEach((b, i) => {
        mesh.setMatrixAt(i, m.makeTranslation(b.x, b.y, b.z));
        if (shaded) {
            const shade = 0.93 + rand() * 0.12;
            mesh.setColorAt(i, tint.setRGB(shade, shade, shade * 0.98));
        }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
}

export function Terrain({ receiveShadow }: { receiveShadow: boolean }) {
    const surfaceRef = useRef<InstancedMesh>(null);
    const fillerRef = useRef<InstancedMesh>(null);
    const pondRef = useRef<InstancedMesh>(null);
    const { surface, filler, pondBlocks } = useMemo(() => buildTerrain(), []);

    const resources = useMemo(() => {
        const grass = getVoxelMaterial('grass');
        const dirt = getVoxelMaterial('dirt');
        const lip = getTerrainLipMaterial();
        return {
            // Top face at y = 0 so a block's y equals its walkable surface height.
            geometry: new BoxGeometry(TERRAIN.cell, 1, TERRAIN.cell).translate(0, -0.5, 0),
            // BoxGeometry groups: +x, -x, +y, -y, +z, -z → grass on top, grass-lipped dirt on the sides.
            surfaceMaterials: [lip, lip, grass, dirt, lip, lip],
            fillerMaterial: dirt,
            pondMaterial: getVoxelMaterial('stone'),
            // North/south strips span the full width; east/west strips fill between them.
            rimGeometryNS: new PlaneGeometry(900, 900).rotateX(-Math.PI / 2),
            rimGeometryEW: new PlaneGeometry(900, TERRAIN.maxZ - TERRAIN.minZ).rotateX(-Math.PI / 2),
            rimMaterial: new MeshLambertMaterial({ color: '#5b8f49' }),
        };
    }, []);

    useEffect(
        () => () => {
            resources.geometry.dispose();
            resources.rimGeometryNS.dispose();
            resources.rimGeometryEW.dispose();
            resources.rimMaterial.dispose();
        },
        [resources],
    );

    useLayoutEffect(() => {
        writeBlocks(surfaceRef.current, surface, true);
        writeBlocks(fillerRef.current, filler, false);
        writeBlocks(pondRef.current, pondBlocks, false);
    }, [surface, filler, pondBlocks]);

    const { minX, maxX, minZ, maxZ } = TERRAIN;
    // Four large planes continue the rim of the valley to the horizon.
    const rims: [number, number, 'NS' | 'EW'][] = [
        [0, maxZ + 450, 'NS'],
        [0, minZ - 450, 'NS'],
        [maxX + 450, (minZ + maxZ) / 2, 'EW'],
        [minX - 450, (minZ + maxZ) / 2, 'EW'],
    ];

    return (
        <group>
            <instancedMesh ref={surfaceRef} args={[resources.geometry, resources.surfaceMaterials, surface.length]} receiveShadow={receiveShadow} />
            <instancedMesh
                ref={fillerRef}
                args={[resources.geometry, resources.fillerMaterial, Math.max(1, filler.length)]}
                receiveShadow={receiveShadow}
            />
            <instancedMesh ref={pondRef} args={[resources.geometry, resources.pondMaterial, pondBlocks.length]} receiveShadow={receiveShadow} />
            {rims.map(([x, z, kind]) => (
                <mesh
                    key={`${x}:${z}`}
                    geometry={kind === 'NS' ? resources.rimGeometryNS : resources.rimGeometryEW}
                    material={resources.rimMaterial}
                    position={[x, RIM_HEIGHT, z]}
                />
            ))}
        </group>
    );
}
