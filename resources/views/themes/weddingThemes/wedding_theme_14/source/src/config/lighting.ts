import type { LightingKey } from './types'

/**
 * Time-of-day keys along the journey: soft morning at the gate → bright garden → warm afternoon
 * → golden hour at the gift table → twilight with glowing lanterns at the close.
 * The sun arcs slowly from front-right of the gate towards the sunset behind the pendhapa,
 * so shadow direction changes gradually and never flips.
 */
export const LIGHTING_KEYS: LightingKey[] = [
  {
    at: 0,
    skyTop: '#7d9cc0', skyHorizon: '#efe2c6', skyBottom: '#b9a88a',
    sunColor: '#ffe4bf', sunIntensity: 2.4, sunElevation: 24, sunAzimuth: 35,
    hemiSky: '#cfd9e6', hemiGround: '#5a4a35', hemiIntensity: 0.9,
    fogNear: 30, fogFar: 150, lanternGlow: 0.18, stars: 0, exposure: 1.0,
  },
  {
    at: 0.3,
    skyTop: '#6f97c4', skyHorizon: '#e9e3cf', skyBottom: '#a9a083',
    sunColor: '#fff1d8', sunIntensity: 2.9, sunElevation: 46, sunAzimuth: 30,
    hemiSky: '#d8e2ea', hemiGround: '#55613c', hemiIntensity: 1.0,
    fogNear: 34, fogFar: 160, lanternGlow: 0.12, stars: 0, exposure: 1.0,
  },
  {
    at: 0.5,
    skyTop: '#7a95b8', skyHorizon: '#f0dcb5', skyBottom: '#aa9776',
    sunColor: '#ffe2b0', sunIntensity: 2.7, sunElevation: 34, sunAzimuth: 55,
    hemiSky: '#e3dccb', hemiGround: '#5b4c34', hemiIntensity: 0.95,
    fogNear: 30, fogFar: 150, lanternGlow: 0.2, stars: 0, exposure: 1.0,
  },
  {
    at: 0.72,
    skyTop: '#8a8fae', skyHorizon: '#f2c993', skyBottom: '#9a7f5e',
    sunColor: '#ffc887', sunIntensity: 2.3, sunElevation: 17, sunAzimuth: 75,
    hemiSky: '#e7cfae', hemiGround: '#4d3a28', hemiIntensity: 0.8,
    fogNear: 26, fogFar: 135, lanternGlow: 0.45, stars: 0, exposure: 1.02,
  },
  {
    at: 0.9,
    skyTop: '#6f6c94', skyHorizon: '#f0a96a', skyBottom: '#7d5d43',
    sunColor: '#ffa860', sunIntensity: 1.7, sunElevation: 7, sunAzimuth: 95,
    hemiSky: '#c9a88f', hemiGround: '#3c2a1e', hemiIntensity: 0.65,
    fogNear: 22, fogFar: 120, lanternGlow: 0.75, stars: 0.1, exposure: 1.05,
  },
  {
    at: 1,
    skyTop: '#1f2546', skyHorizon: '#c9825a', skyBottom: '#3b2a2a',
    sunColor: '#ff9a5c', sunIntensity: 0.55, sunElevation: 2, sunAzimuth: 108,
    hemiSky: '#6d6a92', hemiGround: '#2a1c16', hemiIntensity: 0.55,
    fogNear: 22, fogFar: 115, lanternGlow: 1, stars: 0.85, exposure: 1.1,
  },
]
