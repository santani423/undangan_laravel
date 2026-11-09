/* Paket aset desain (ikon, tekstur, ilustrasi galeri contoh) — diproses Vite agar ikut ter-build dan ber-hash.
   Model OBJ/MTL dimuat terpisah oleh scene/voxelLoader.ts (hanya di chunk 3D). */
import type { GalleryItem } from './types';

const files = import.meta.glob<string>('../assets/{icons,textures,gallery}/*.svg', { eager: true, query: '?url', import: 'default' });

export function aset(path: string): string {
    return files[`../assets/${path}`] ?? '';
}

/** The supplied UI icons from the asset pack. */
export type AssetIconName = 'calendar' | 'location' | 'music' | 'gift' | 'heart' | 'gallery';

export function iconUrl(name: AssetIconName): string {
    return aset(`icons/${name}.svg`);
}

export type TextureName = 'grass' | 'dirt' | 'stone' | 'wood' | 'ivory_fabric' | 'water';

export function textureUrl(name: TextureName): string {
    return aset(`textures/${name}.svg`);
}

/** Labelled voxel illustrations (not photos of anyone) for sample invitations without a gallery. */
export const GALLERY_PLACEHOLDERS: GalleryItem[] = [
    ['portrait-1', 'Ilustrasi contoh pengganti foto potret pasangan', 'Foto potret pasangan (contoh)'],
    ['prewedding-1', 'Ilustrasi contoh pengganti foto prewedding di taman', 'Foto prewedding (contoh)'],
    ['engagement-1', 'Ilustrasi contoh pengganti foto lamaran', 'Foto lamaran (contoh)'],
    ['portrait-2', 'Ilustrasi contoh pengganti foto potret kedua', 'Foto potret (contoh)'],
    ['prewedding-2', 'Ilustrasi contoh pengganti foto prewedding saat senja', 'Foto prewedding senja (contoh)'],
    ['engagement-2', 'Ilustrasi contoh pengganti foto cincin lamaran', 'Detail cincin lamaran (contoh)'],
].map(
    ([file, alt, caption]): GalleryItem => ({
        id: `contoh-${file}`,
        kind: 'image',
        category: 'photo',
        src: aset(`gallery/placeholder-${file}.svg`),
        alt,
        caption,
        isPlaceholder: true,
    }),
);

export const VIDEO_POSTER = aset('gallery/placeholder-video.svg');
