import * as THREE from 'three'
import { asset, SVGS, TEXTURES, type TextureKey } from '../config/assets'
import { wedding } from '../config/wedding'

export type LoadedTextures = Partial<Record<TextureKey, THREE.Texture>>

export interface LoadedAssets {
  textures: LoadedTextures
  /** Gallery photos rasterised to canvases (keyed by gallery id). Missing → generated fallback. */
  photos: Record<string, THREE.Texture>
  frameOverlay: THREE.Texture | null
  failures: string[]
}

const TIMEOUT_MS = 10000

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    const timer = window.setTimeout(() => reject(new Error(`timeout: ${url}`)), TIMEOUT_MS)
    img.onload = () => {
      window.clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error(`failed: ${url}`))
    }
    img.src = url
  })
}

/** Draw any image (incl. viewBox-only SVGs) into a fixed-size canvas so sizing is deterministic. */
function rasterise(img: HTMLImageElement, w: number, h: number, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')!
  // cover-fit
  const iw = img.naturalWidth || w
  const ih = img.naturalHeight || h
  const s = Math.max(canvas.width / iw, canvas.height / ih)
  const dw = iw * s
  const dh = ih * s
  ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)
  return canvas
}

function fallbackPhoto(label: string, w: number, h: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#5f3b27')
  g.addColorStop(1, '#1c120d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#d4b072'
  ctx.font = `${Math.round(w / 12)}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.fillText(label, w / 2, h / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Loads every asset the world needs with progress feedback. Never rejects: anything that fails
 * is recorded in `failures` and the scene falls back to plain materials / generated images.
 */
export async function loadWorldAssets(onProgress: (loaded: number, total: number) => void, maxPhotoSide = 1024): Promise<LoadedAssets> {
  const texEntries = Object.entries(TEXTURES) as [TextureKey, string][]
  const total = texEntries.length + wedding.gallery.length + 1
  let loaded = 0
  const tick = () => onProgress(++loaded, total)
  const failures: string[] = []
  const textures: LoadedTextures = {}
  const photos: Record<string, THREE.Texture> = {}
  let frameOverlay: THREE.Texture | null = null

  const texJobs = texEntries.map(async ([key, path]) => {
    try {
      const img = await loadImage(asset(path))
      const tex = new THREE.Texture(img)
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.colorSpace = key === 'teakRoughness' ? THREE.NoColorSpace : THREE.SRGBColorSpace
      tex.anisotropy = 4
      tex.needsUpdate = true
      textures[key] = tex
    } catch {
      failures.push(path)
    } finally {
      tick()
    }
  })

  const photoJobs = wedding.gallery.map(async (item, i) => {
    const [w, h] = item.orientation === 'portrait' ? [900, 1200] : [1200, 900]
    try {
      const img = await loadImage(asset(item.src))
      const tex = new THREE.CanvasTexture(rasterise(img, w, h, maxPhotoSide))
      tex.colorSpace = THREE.SRGBColorSpace
      photos[item.id] = tex
    } catch {
      failures.push(item.src)
      photos[item.id] = fallbackPhoto(`Foto ${i + 1}`, 512, item.orientation === 'portrait' ? 683 : 384)
    } finally {
      tick()
    }
  })

  const frameJob = (async () => {
    try {
      const img = await loadImage(asset(SVGS.photoFrame))
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800
      canvas.getContext('2d')!.drawImage(img, 0, 0, 600, 800)
      frameOverlay = new THREE.CanvasTexture(canvas)
      frameOverlay.colorSpace = THREE.SRGBColorSpace
    } catch {
      failures.push(SVGS.photoFrame)
    } finally {
      tick()
    }
  })()

  await Promise.all([...texJobs, ...photoJobs, frameJob])
  return { textures, photos, frameOverlay, failures }
}
