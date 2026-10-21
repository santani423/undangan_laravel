import { LinearMipmapLinearFilter, NearestFilter, RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';

export const ASSET_BASE = `${import.meta.env.BASE_URL}assets/`;

export type TextureName = 'grass' | 'dirt' | 'stone' | 'wood' | 'ivory_fabric' | 'water';

const cache = new Map<TextureName, Promise<Texture | null>>();
const loaded = new Set<Texture>();

function configure(texture: Texture): Texture {
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // Crisp pixel-art up close, mip-mapped in the distance to avoid shimmer.
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Loads one of the supplied SVG textures. Resolves to `null` on failure so
 * materials simply keep their flat MTL colour instead of rendering black.
 */
export function loadTexture(name: TextureName): Promise<Texture | null> {
  let pending = cache.get(name);
  if (!pending) {
    pending = new TextureLoader()
      .loadAsync(`${ASSET_BASE}textures/${name}.svg`)
      .then((texture) => {
        loaded.add(texture);
        return configure(texture);
      })
      .catch((error: unknown) => {
        console.warn(`[undesia] Texture "${name}" gagal dimuat; memakai warna polos.`, error);
        return null;
      });
    cache.set(name, pending);
  }
  return pending;
}

/** Loads an arbitrary image (e.g. gallery photos for the 3D easels). */
export function loadImageTexture(url: string): Promise<Texture | null> {
  return new TextureLoader()
    .loadAsync(url)
    .then((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      loaded.add(texture);
      return texture;
    })
    .catch(() => null);
}

export function disposeTextures(): void {
  loaded.forEach((texture) => texture.dispose());
}
