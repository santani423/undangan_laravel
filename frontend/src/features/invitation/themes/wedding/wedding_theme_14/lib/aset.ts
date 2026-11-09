/* Aset tema (tekstur 3D, ornamen SVG, foto contoh) — diproses Vite agar ikut ter-build dan ber-hash. */
const files = import.meta.glob<string>('../assets/**/*.{png,svg}', { eager: true, query: '?url', import: 'default' });

export function aset(path: string): string {
    return files[`../assets/${path}`] ?? '';
}

/** Textures loaded by the 3D world (from the Pawiwahan Agung asset pack). */
export const TEXTURES = {
    teak: aset('textures/teak.png'),
    teakRoughness: aset('textures/teak_roughness.png'),
    kawung: aset('textures/kawung.png'),
    parang: aset('textures/parang.png'),
    stone: aset('textures/stone.png'),
    grass: aset('textures/grass.png'),
    soil: aset('textures/soil.png'),
    brass: aset('textures/brass.png'),
} as const;

export type TextureKey = keyof typeof TEXTURES;

export const SVGS = {
    photoFrame: aset('ui/photo-frame.svg'),
    divider: aset('ui/divider.svg'),
    kawungMotif: aset('ui/kawung-motif.svg'),
    icons: {
        bookOpen: aset('ui/icon-book-open.svg'),
        calendar: aset('ui/icon-calendar.svg'),
        gift: aset('ui/icon-gift.svg'),
        heart: aset('ui/icon-heart.svg'),
        images: aset('ui/icon-images.svg'),
        mapPin: aset('ui/icon-map-pin.svg'),
        music: aset('ui/icon-music.svg'),
    },
} as const;

/** Labeled placeholder photos for sample invitations without a gallery. */
export const PLACEHOLDER_PHOTOS = [1, 2, 3, 4, 5, 6].map((i) => aset(`photos/placeholder-${i}.svg`));
