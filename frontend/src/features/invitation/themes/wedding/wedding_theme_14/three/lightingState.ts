import * as THREE from 'three';
import { LIGHTING_KEYS } from '../lib/lighting';
import type { LightingKey } from '../lib/types';

export const skyUniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color() },
    uStars: { value: 0 },
};

export interface LightingSample {
    skyTop: THREE.Color;
    skyHorizon: THREE.Color;
    skyBottom: THREE.Color;
    sunColor: THREE.Color;
    hemiSky: THREE.Color;
    hemiGround: THREE.Color;
    sunDir: THREE.Vector3;
    sunIntensity: number;
    hemiIntensity: number;
    fogNear: number;
    fogFar: number;
    lanternGlow: number;
    stars: number;
    exposure: number;
}

/** Pre-parsed colour keys so per-frame sampling allocates nothing. */
const parsed = LIGHTING_KEYS.map((k) => ({
    ...k,
    c: {
        skyTop: new THREE.Color(k.skyTop),
        skyHorizon: new THREE.Color(k.skyHorizon),
        skyBottom: new THREE.Color(k.skyBottom),
        sunColor: new THREE.Color(k.sunColor),
        hemiSky: new THREE.Color(k.hemiSky),
        hemiGround: new THREE.Color(k.hemiGround),
    },
}));

export function createLightingSample(): LightingSample {
    return {
        skyTop: new THREE.Color(),
        skyHorizon: new THREE.Color(),
        skyBottom: new THREE.Color(),
        sunColor: new THREE.Color(),
        hemiSky: new THREE.Color(),
        hemiGround: new THREE.Color(),
        sunDir: new THREE.Vector3(),
        sunIntensity: 1,
        hemiIntensity: 1,
        fogNear: 30,
        fogFar: 150,
        lanternGlow: 0,
        stars: 0,
        exposure: 1,
    };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

export function sampleLighting(progress: number, out: LightingSample): LightingSample {
    let i = 0;
    while (i < parsed.length - 2 && progress > parsed[i + 1].at) i++;
    const a = parsed[i];
    const b = parsed[i + 1];
    const t = ease(Math.min(1, Math.max(0, (progress - a.at) / (b.at - a.at || 1))));
    const colors = ['skyTop', 'skyHorizon', 'skyBottom', 'sunColor', 'hemiSky', 'hemiGround'] as const;
    for (const key of colors) out[key].copy(a.c[key]).lerp(b.c[key], t);
    const num = (
        k: keyof Pick<
            LightingKey,
            'sunIntensity' | 'hemiIntensity' | 'fogNear' | 'fogFar' | 'lanternGlow' | 'stars' | 'exposure' | 'sunElevation' | 'sunAzimuth'
        >,
    ) => lerp(a[k], b[k], t);
    out.sunIntensity = num('sunIntensity');
    out.hemiIntensity = num('hemiIntensity');
    out.fogNear = num('fogNear');
    out.fogFar = num('fogFar');
    out.lanternGlow = num('lanternGlow');
    out.stars = num('stars');
    out.exposure = num('exposure');
    const el = THREE.MathUtils.degToRad(num('sunElevation'));
    const az = THREE.MathUtils.degToRad(num('sunAzimuth'));
    out.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
    return out;
}
