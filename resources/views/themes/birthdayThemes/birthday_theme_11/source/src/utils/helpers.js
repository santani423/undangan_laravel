// Small, dependency-free helpers shared across the app.
// Nothing in this file touches the DOM at import time, so it can be unit-tested in Node.

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, value) => (a === b ? 0 : clamp((value - a) / (b - a)));
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Frame-rate independent exponential smoothing. */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Deterministic pseudo-random generator so the world looks the same on every visit. */
export function seededRandom(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ORDINAL_WORDS = [
  'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth',
  'nineteenth', 'twentieth',
];

export function ordinalSuffix(n) {
  const v = Math.abs(n) % 100;
  if (v >= 11 && v <= 13) return 'th';
  return { 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th';
}

/** 5 → "fifth", 23 → "23rd" */
export function ordinalWord(n) {
  const num = Number(n);
  if (Number.isInteger(num) && num >= 0 && num < ORDINAL_WORDS.length) return ORDINAL_WORDS[num];
  return `${num}${ordinalSuffix(num)}`;
}

/** Replaces {name}, {age}, {ageOrdinal} and {pronoun} tokens. Unknown tokens are left untouched. */
export function fillTemplate(text, child) {
  if (typeof text !== 'string') return text;
  const tokens = {
    name: child?.name ?? '',
    age: child?.age ?? '',
    ageOrdinal: ordinalWord(child?.age ?? 0),
    pronoun: child?.pronoun ?? 'their',
  };
  return text.replace(/\{(name|age|ageOrdinal|pronoun)\}/g, (_, key) => String(tokens[key]));
}

/** Returns a deep copy of the config with every string template filled in. */
export function resolveConfig(config) {
  const child = config.child;
  const walk = (value) => {
    if (typeof value === 'string') return fillTemplate(value, child);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
    }
    return value;
  };
  return walk(config);
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Turns "a\n\nb" into paragraphs (escaped). */
export function paragraphsHtml(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Builds the Google Maps link for the venue: explicit URL > coordinates > name + address search. */
export function buildMapsUrl(venue) {
  if (venue?.mapsUrl) return venue.mapsUrl;
  const base = 'https://www.google.com/maps/search/?api=1&query=';
  if (venue?.coordinates && Number.isFinite(venue.coordinates.lat) && Number.isFinite(venue.coordinates.lng)) {
    return `${base}${venue.coordinates.lat},${venue.coordinates.lng}`;
  }
  return base + encodeURIComponent([venue?.name, venue?.address].filter(Boolean).join(', '));
}

/** Resolves '/assets/…' config paths against Vite's base URL so the site works from any sub-folder. */
export function assetUrl(path) {
  if (!path || /^(https?:|data:|blob:)/.test(path)) return path;
  const base = import.meta.env?.BASE_URL ?? '/';
  return base.replace(/\/?$/, '/') + String(path).replace(/^\.?\//, '');
}

/* ---------------------------------------------------------------------------
 * Browser-only helpers (safe to import in Node because they only run on call)
 * ------------------------------------------------------------------------- */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** Reads a boolean preference from localStorage without ever throwing. */
export function readPreference(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : raw === 'true';
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable (private mode, blocked) — preference simply isn't remembered */
  }
}

/** Smoothly scrolls to an element (or instantly when reduced motion is requested). */
export function scrollToElement(target, { instant = false } = {}) {
  const element = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : target;
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' });
}
