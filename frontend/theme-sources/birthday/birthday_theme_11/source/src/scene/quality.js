// Device capability detection. Decides how much 3D work this device should do.

export function isWebGLAvailable() {
  try {
    if (new URLSearchParams(location.search).has('nowebgl')) return false; // manual fallback preview
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const ok = Boolean(window.WebGLRenderingContext && gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function detectQuality() {
  const params = new URLSearchParams(location.search);
  const forced = params.get('quality'); // ?quality=low|high for testing
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const smallScreen = Math.min(screen.width, screen.height) < 600;
  const memory = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const saveData = navigator.connection?.saveData === true;

  let tier = 'high';
  if ((coarse && smallScreen) || memory <= 4 || cores <= 4 || saveData) tier = 'low';
  if (forced === 'low' || forced === 'high') tier = forced;

  const high = tier === 'high';
  return {
    tier,
    maxPixelRatio: high ? 2 : 1.5,
    antialias: high || window.devicePixelRatio < 2,
    shadows: high,
    shadowMapSize: 2048,
    physicalMaterials: high,
    particleScale: high ? 1 : 0.45,
    decorationScale: high ? 1 : 0.6,
    pointerParallax: high && !coarse,
  };
}

/**
 * Watches frame rate after start and steps quality down while the device struggles:
 * first the pixel ratio (towards 1), then real-time shadow maps (blob shadows remain).
 * Stops as soon as the frame rate is comfortable. Returns a function to call once per frame.
 */
export function createAdaptiveQuality(renderer, quality, { disableShadows } = {}) {
  let samples = 0;
  let total = 0;
  let settled = false;
  let ratio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
  return (dt) => {
    if (settled || dt <= 0 || dt > 0.25) return;
    samples++;
    total += dt;
    if (samples < 120) return;
    const fps = samples / total;
    samples = 0;
    total = 0;
    if (fps >= 45) settled = true;
    else if (ratio > 1) {
      ratio = Math.max(1, ratio - 0.5);
      renderer.setPixelRatio(ratio);
    } else if (renderer.shadowMap.enabled && disableShadows) disableShadows();
    else settled = true;
  };
}
