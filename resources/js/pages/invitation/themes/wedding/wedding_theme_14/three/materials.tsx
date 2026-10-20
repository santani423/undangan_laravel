import { createContext, useContext } from 'react';
import * as THREE from 'three';
import type { LoadedAssets } from './assetLoader';
import type { TextureLibrary } from './textures/library';
import type { TexSet } from './textures/proceduralTextures';
import { applyWind } from './wind';

/**
 * One shared PBR material palette for the whole world. Every surface material has colour, normal
 * and roughness maps at a physical tile size (all geometry carries metre UVs), so wood, stone,
 * clay and plaster respond consistently to the same sun, sky and lanterns.
 */

/** Clone a texture set at its own physical tile size. Clones share the decoded canvas. */
function pbr(
    set: TexSet,
    opts: { tint?: string; normalScale?: number; roughness?: number; metalness?: number; side?: THREE.Side; tile?: number } = {},
) {
    const tile = opts.tile ?? set.tile;
    const rep = (t: THREE.Texture) => {
        const c = t.clone();
        c.wrapS = c.wrapT = THREE.RepeatWrapping;
        c.repeat.set(1 / tile, 1 / tile);
        c.needsUpdate = true;
        return c;
    };
    const ns = opts.normalScale ?? 1;
    return new THREE.MeshStandardMaterial({
        map: rep(set.map),
        normalMap: rep(set.normalMap),
        normalScale: new THREE.Vector2(ns, ns),
        roughnessMap: rep(set.roughnessMap),
        roughness: opts.roughness ?? 1,
        metalness: opts.metalness ?? 0,
        color: opts.tint ?? '#ffffff',
        side: opts.side ?? THREE.FrontSide,
    });
}

function makeGlowTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,214,150,1)');
    grd.addColorStop(0.2, 'rgba(255,190,110,0.45)');
    grd.addColorStop(0.55, 'rgba(255,170,90,0.12)');
    grd.addColorStop(1, 'rgba(255,160,80,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

/**
 * Breaks up tiling on the big ground plane: two octaves of world-space value noise blend between
 * a lush and a drier grass tint, and a soil tint shows through in patches.
 */
function applyGroundVariation(m: THREE.MeshStandardMaterial) {
    m.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vGroundPos;')
            .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvGroundPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        shader.fragmentShader = shader.fragmentShader
            .replace(
                '#include <common>',
                `#include <common>
varying vec3 vGroundPos;
float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(gHash(i), gHash(i + vec2(1.0, 0.0)), f.x), mix(gHash(i + vec2(0.0, 1.0)), gHash(i + vec2(1.0, 1.0)), f.x), f.y);
}`,
            )
            .replace(
                '#include <map_fragment>',
                `#include <map_fragment>
{
  vec2 gp = vGroundPos.xz;
  float n1 = gNoise(gp * 0.045) * 0.65 + gNoise(gp * 0.17) * 0.35;
  float n2 = gNoise(gp * 0.6 + 17.0);
  vec3 lush = vec3(0.8, 0.88, 0.66);
  vec3 dry = vec3(1.05, 1.0, 0.7);
  vec3 soil = vec3(0.86, 0.72, 0.55);
  vec3 tint = mix(lush, dry, smoothstep(0.35, 0.75, n1));
  tint = mix(tint, soil, smoothstep(0.72, 0.9, n1 * 0.7 + n2 * 0.3) * 0.55);
  diffuseColor.rgb *= tint * (0.9 + n2 * 0.14);
}`,
            );
    };
    m.customProgramCacheKey = () => 'ground-variation';
}

export function createMaterials(assets: LoadedAssets, lib: TextureLibrary) {
    const tx = assets.textures;
    const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

    const ground = std({ color: '#93a173', roughness: 1 });
    if (tx.grass) {
        const g = tx.grass.clone();
        g.wrapS = g.wrapT = THREE.RepeatWrapping;
        g.repeat.set(1 / 2.6, 1 / 2.6);
        g.needsUpdate = true;
        ground.map = g;
        ground.color.set('#a9b28c');
    }
    applyGroundVariation(ground);

    const leafMats = lib.leaves.map((t) =>
        applyWind(std({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.78, color: '#dfe3cf' }), {
            amplitude: 0.16,
            height: 1,
            flutter: 0.045,
            mode: 'attribute',
            keepNormals: true,
        }),
    );

    const mats = {
        /* wood */
        teakV: pbr(lib.teakV, { tint: '#d9c0aa', normalScale: 0.6 }),
        teak: pbr(lib.teakU, { tint: '#d9c0aa', normalScale: 0.6 }),
        teakDark: pbr(lib.teakU, { tint: '#8c6c58', normalScale: 0.6 }),
        teakDarkV: pbr(lib.teakV, { tint: '#8c6c58', normalScale: 0.6 }),
        planks: pbr(lib.planks, { tint: '#e2cdb8', normalScale: 0.8 }),
        ceiling: pbr(lib.rafters, { tint: '#c9ab91', side: THREE.BackSide, normalScale: 0.8 }),
        /* carving */
        carving: pbr(lib.reliefGilded, { normalScale: 1.4, metalness: 0.25 }),
        carvingDark: pbr(lib.reliefTeak, { normalScale: 1.4 }),
        parangPanel: pbr(lib.reliefTeak, { tint: '#f0dcc3', normalScale: 1.2 }),
        /* cloth (batik from the pack, used as printed fabric) */
        batikParang: std({ map: tiledPack(tx.parang, 0.5), color: '#ffffff', roughness: 0.95 }),
        batikKawung: std({ map: tiledPack(tx.kawung, 0.5), color: '#fff6e6', roughness: 0.95 }),
        /* masonry */
        stone: pbr(lib.limestone, { normalScale: 0.9 }),
        stoneDark: pbr(lib.andesite, { normalScale: 1 }),
        floorTile: pbr(lib.floorTile, { tint: '#a99a83', normalScale: 0.7 }),
        brick: pbr(lib.brick, { normalScale: 1 }),
        plaster: pbr(lib.plaster, { normalScale: 0.6 }),
        paver: pbr(lib.paver, { tint: '#9d968a', normalScale: 1.4 }),
        roof: pbr(lib.roofTile, { normalScale: 1.2 }),
        roofRidge: pbr(lib.roofTile, { tint: '#9c7a6e', normalScale: 0.6, tile: 0.5 }),
        /* metals & fabrics */
        brass: std({ map: tiledPack(tx.brass, 0.6), color: '#e3c27f', metalness: 0.9, roughness: 0.38 }),
        gold: std({ color: '#c39a52', metalness: 0.92, roughness: 0.34 }),
        ivory: std({ color: '#efe3c8', roughness: 0.88 }),
        paper: std({ color: '#ead9b6', roughness: 0.92, side: THREE.DoubleSide }),
        maroon: std({ color: '#5e2620', roughness: 0.8 }),
        /* terrain */
        ground,
        soil: std({
            map: tiledPack(tx.soil, 1.6),
            color: '#e9dcc8',
            roughness: 1,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
        }),
        pathBed: std({
            map: tiledPack(tx.soil, 1.2),
            color: '#a99c86',
            roughness: 1,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
        }),
        water: new THREE.MeshPhysicalMaterial({
            color: '#203b37',
            roughness: 0.05,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.6,
        }),
        lilyPad: std({ color: '#4b7536', roughness: 0.55, side: THREE.DoubleSide }),
        /* vegetation */
        // trunks/branches sway with the same field as their leaves so foliage never detaches
        bark: applyWind(pbr(lib.bark, { tint: '#d6c8b8', normalScale: 1.4 }), { amplitude: 0.16, height: 1, mode: 'attribute' }),
        palmTrunk: applyWind(pbr(lib.palmBark, { normalScale: 1.2 }), { amplitude: 0.3, height: 1, mode: 'attribute' }),
        bananaStem: std({ color: '#7d8a4a', roughness: 0.8 }),
        leaves0: leafMats[0],
        leaves1: leafMats[1],
        leaves2: leafMats[2],
        shrub: applyWind(std({ map: lib.shrub, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), {
            amplitude: 0.05,
            height: 1,
            flutter: 0.02,
            mode: 'attribute',
            keepNormals: true,
        }),
        frond: applyWind(std({ map: lib.frond, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.72, color: '#b4c296' }), {
            amplitude: 0.3,
            height: 1,
            flutter: 0.06,
            mode: 'attribute',
            keepNormals: true,
        }),
        bananaLeaf: applyWind(std({ map: lib.banana, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }), {
            amplitude: 0.18,
            height: 1,
            flutter: 0.05,
            mode: 'attribute',
            keepNormals: true,
        }),
        flowerYellow: std({ color: '#e2b845', roughness: 0.6 }),
        janur: applyWind(std({ color: '#d7cf86', roughness: 0.6, side: THREE.DoubleSide }), {
            amplitude: 0.04,
            height: 1,
            flutter: 0.03,
            mode: 'attribute',
        }),
        bush: std({ map: lib.shrub, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }),
        /* light */
        lanternGlass: std({ color: '#f6dcaa', emissive: '#ffb45e', emissiveIntensity: 0.4, roughness: 0.45 }),
        glow: new THREE.SpriteMaterial({
            map: makeGlowTexture(),
            color: '#ffc27a',
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.3,
            fog: true,
        }),
        /* contact shadows / ambient occlusion decals */
        contact: new THREE.MeshBasicMaterial({
            map: lib.contact,
            color: '#000000',
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
        }),
        contactStrip: new THREE.MeshBasicMaterial({
            map: lib.contactStrip,
            color: '#000000',
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
        }),
        /* ui-ish */
        frameOverlay: new THREE.MeshBasicMaterial({
            map: assets.frameOverlay,
            transparent: true,
            alphaTest: 0.05,
            toneMapped: false,
            visible: !!assets.frameOverlay,
        }),
        mountain: new THREE.MeshBasicMaterial({ color: '#8e9bad', fog: false, side: THREE.DoubleSide }),
        mountainFar: new THREE.MeshBasicMaterial({ color: '#a7b2c0', fog: false, side: THREE.DoubleSide }),
    };
    return mats;
}

function tiledPack(tex: THREE.Texture | undefined, tile: number): THREE.Texture | null {
    if (!tex) return null;
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / tile, 1 / tile);
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
}

export type Materials = ReturnType<typeof createMaterials>;

export interface WorldResources {
    mats: Materials;
    assets: LoadedAssets;
    lib: TextureLibrary;
}

export const MaterialsContext = createContext<WorldResources | null>(null);

export function useMats(): Materials {
    const ctx = useContext(MaterialsContext);
    if (!ctx) throw new Error('useMats outside MaterialsContext');
    return ctx.mats;
}

export function useWorldAssets(): LoadedAssets {
    const ctx = useContext(MaterialsContext);
    if (!ctx) throw new Error('useWorldAssets outside MaterialsContext');
    return ctx.assets;
}

type AnyMat = THREE.Material & Partial<Record<'map' | 'normalMap' | 'roughnessMap', THREE.Texture | null>>;

/** Disposes materials and the per-material texture clones (the library's canvases are disposed separately). */
export function disposeMaterials(mats: Materials) {
    Object.values(mats).forEach((m) => {
        const mm = m as AnyMat;
        mm.map?.dispose();
        mm.normalMap?.dispose();
        mm.roughnessMap?.dispose();
        mm.dispose();
    });
}
