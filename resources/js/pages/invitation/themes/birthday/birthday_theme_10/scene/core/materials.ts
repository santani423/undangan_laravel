import * as THREE from 'three';
import { THEME_COLORS as theme } from '../../lib/theme';
import { applyWind } from './wind';
const shade = (hex: string, l: number, s = 0) => `#${new THREE.Color(hex).offsetHSL(0, s, l).getHexString()}`;

/** 3D palette: configured theme colours plus derived toy-material shades. */
export const palette = {
    sky: theme.sky,
    coral: theme.coral,
    butter: theme.butter,
    mint: theme.mint,
    lavender: theme.lavender,
    cream: theme.cream,
    ink: theme.ink,
    skyDeep: shade(theme.sky, -0.12),
    coralDeep: shade(theme.coral, -0.1),
    butterDeep: shade(theme.butter, -0.12),
    mintDeep: shade(theme.mint, -0.14),
    lavenderDeep: shade(theme.lavender, -0.12),
    white: '#fffaf0',
    wood: '#c98b5e',
    woodDark: '#9a6141',
    trunk: '#b87955',
    leaf1: '#72d79a',
    leaf2: '#8be7a7',
    leaf3: '#a4efb6',
    leafDeep: '#45b87f',
    pine1: '#4fc487',
    pine2: '#62d394',
    pine3: '#7ee0a8',
    blossom1: '#ffb3c7',
    blossom2: '#ffc9d8',
    wallTop: '#fff0c7',
    wallBottom: '#ffd09a',
    stone: '#efe1cb',
    window: '#8ce2ed',
    door: '#6e8fe8',
    brick: '#e9867a',
    road: '#f4dfb4',
    sand: '#f3d9a4',
    rubber: '#4d5672',
    bear: '#e9b17e',
    bearDark: '#c88b61',
    bearLight: '#ffe2bb',
    eye: '#43364a',
    cheek: '#ff9da9',
    cake: '#ff9fbc',
    cakeDeep: '#e9789d',
    frosting: '#fff0ce',
    plate: '#8bd9e6',
    candle: '#6e8fe8',
    flame: '#ffd166',
    giftBlue: '#65c8f0',
    giftRibbon: '#ff7187',
} as const;

export const BALLOON_COLORS = [palette.coral, palette.sky, palette.butter, palette.mint, palette.lavender, '#ff9fbc'];

function createMaterials() {
    return {
        /** Painted wood / matte paint — houses, stage, props. */
        toyMatte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0 }),
        /**
         * Same paint for instanced meshes. three.js switches shader programs when one
         * material alternates between instanced and plain meshes (or with/without
         * instanceColor), so instanced users get their own material and always set
         * instance colours.
         */
        toyMatteInstanced: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0 }),
        /** Soft plastic — cars, gifts, toys. */
        toySatin: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.46, metalness: 0, envMapIntensity: 0.8 }),
        /** Canopies and bushes (trunks anchored via aWind = 0). */
        foliage: applyWind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }), {
            amplitude: 0.14,
            flutter: 0.18,
        }),
        foliageDepth: applyWind(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), {
            amplitude: 0.14,
            flutter: 0.18,
        }),
        /** Flowers on stems. */
        flowers: applyWind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0 }), {
            amplitude: 0.09,
            flutter: 0.35,
        }),
        /** Bunting and flags flutter strongly at their free edge. */
        flags: applyWind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, side: THREE.DoubleSide }), {
            amplitude: 0.12,
            flutter: 1.1,
        }),
        /** Balloons tinted per instance (instanceColor). */
        balloon: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0, envMapIntensity: 1 }),
        flame: new THREE.MeshBasicMaterial({ color: '#ffd77a', toneMapped: false }),
        glow: new THREE.MeshBasicMaterial({ color: '#fff4c8', toneMapped: false }),
        string: new THREE.LineBasicMaterial({ color: '#8c8ab0', transparent: true, opacity: 0.85 }),
    };
}

let materials: ReturnType<typeof createMaterials> | null = null;

/** Shared material singletons (created once, reused by every mesh). */
export function getMaterials() {
    if (!materials) materials = createMaterials();
    return materials;
}

const colorMaterials = new Map<string, THREE.MeshStandardMaterial>();

/** Plain coloured material for animated parts that cannot be merged. */
export function colorMaterial(color: string, roughness = 0.6) {
    const key = `${color}:${roughness}`;
    let mat = colorMaterials.get(key);
    if (!mat) {
        mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
        colorMaterials.set(key, mat);
    }
    return mat;
}
