import * as THREE from 'three';
import type { Quality } from './quality';

// Shared material library. Values follow textures/texture-notes.md from the asset pack:
// porcelain teeth (roughness .28), pastel plastic (.32), latex balloons (.22 + clearcoat),
// cake icing (.4) and wood props (.72), all non-metallic.

export const PALETTE = {
    tooth: '#f7fdff',
    toothShade: '#dff3fb',
    ink: '#17364b',
    white: '#ffffff',
    cream: '#fff8ef',
    creamDeep: '#f6e3c8',
    pink: '#ffb9d0',
    pinkBright: '#ff8fb7',
    pinkDeep: '#e46d99',
    rose: '#f05b78',
    blue: '#78d5f4',
    blueMid: '#55b9dc',
    blueDeep: '#2d94c6',
    sky: '#b8e8f5',
    mint: '#bdeccb',
    mintMid: '#93dcae',
    mintDeep: '#5fc08a',
    yellow: '#ffe28a',
    yellowDeep: '#ffca55',
    orange: '#ffb066',
    lavender: '#c8b5ff',
    lavenderDeep: '#9b83e7',
    wood: '#d9a874',
    woodDeep: '#b9875a',
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** Overrides accepted by Materials.get (a subset of MeshStandardMaterial/MeshBasicMaterial parameters). */
export type MaterialOverrides = THREE.MeshStandardMaterialParameters & THREE.MeshBasicMaterialParameters;

export class Materials {
    private cache = new Map<string, THREE.Material>();

    constructor(private quality: Quality) {}

    /** Pastel plastic, porcelain etc. by palette key or colour. Cached so meshes share materials. */
    get(
        key: PaletteKey | 'cheek' | 'mouth' | 'tongue' | 'icing' | 'flame' | 'glow' | (string & {}),
        overrides: MaterialOverrides = {},
    ): THREE.Material {
        const cacheKey = `${key}|${JSON.stringify(overrides)}`;
        let material = this.cache.get(cacheKey);
        if (!material) {
            material = this.create(key, overrides);
            this.cache.set(cacheKey, material);
        }
        return material;
    }

    private create(key: string, overrides: MaterialOverrides): THREE.Material {
        const color = (PALETTE as Record<string, string>)[key] ?? key;
        switch (key) {
            case 'tooth':
                return new THREE.MeshStandardMaterial({ color: PALETTE.tooth, roughness: 0.28, metalness: 0, ...overrides });
            case 'ink':
                return new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.15, metalness: 0, ...overrides });
            case 'cheek':
                return new THREE.MeshBasicMaterial({ color: '#ff9db5', transparent: true, opacity: 0.6, depthWrite: false, ...overrides });
            case 'mouth':
                return new THREE.MeshStandardMaterial({ color: PALETTE.rose, roughness: 0.5, side: THREE.DoubleSide, ...overrides });
            case 'tongue':
                return new THREE.MeshStandardMaterial({ color: '#ff9db5', roughness: 0.5, side: THREE.DoubleSide, ...overrides });
            case 'wood':
            case 'woodDeep':
                return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0, ...overrides });
            case 'icing':
                return new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: 0.4, ...overrides });
            case 'flame':
                return new THREE.MeshBasicMaterial({ color: '#ffd36b', transparent: true, opacity: 0.95, depthWrite: false, ...overrides });
            case 'glow':
                return new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.85, ...overrides });
            default:
                return new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0, ...overrides });
        }
    }

    /** Latex balloon: clearcoat where the device can afford MeshPhysicalMaterial. */
    balloon(color: string): THREE.Material {
        const cacheKey = `balloon|${color}`;
        let material = this.cache.get(cacheKey);
        if (!material) {
            material = this.quality.physicalMaterials
                ? new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, clearcoat: 0.45, clearcoatRoughness: 0.2, sheen: 0.2 })
                : new THREE.MeshStandardMaterial({ color, roughness: 0.22 });
            this.cache.set(cacheKey, material);
        }
        return material;
    }

    dispose() {
        for (const material of this.cache.values()) material.dispose();
        this.cache.clear();
    }
}
