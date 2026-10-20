/* Aset tema (ilustrasi SVG, ilustrasi galeri contoh) — diproses Vite agar ikut ter-build dan ber-hash. */
const files = import.meta.glob<string>('../assets/**/*.{svg,webp}', { eager: true, query: '?url', import: 'default' });

export function aset(path: string): string {
    return files[`../assets/${path}`] ?? '';
}

/** SVG illustrations from the Enchanted Twilight Forest pack. */
export const SVGS = {
    forestHills: aset('svg/forest-hills.svg'),
    moon: aset('svg/moon.svg'),
    fireflies: aset('svg/fireflies.svg'),
    lantern: aset('svg/lantern.svg'),
    mushrooms: aset('svg/mushroom-cluster.svg'),
    wildflowers: aset('svg/wildflowers.svg'),
    floralArch: aset('svg/floral-arch.svg'),
    divider: aset('svg/sparkle-divider.svg'),
} as const;

/** Original demo illustrations (not photos of anyone) for sample invitations without a gallery. */
export const DEMO_GALLERY = [
    ['01-moonlit-hills', 'bulan purnama di atas bukit hutan senja', 'Bulan di atas bukit'],
    ['02-twilight-lanterns', 'lentera kertas bercahaya tergantung di dahan', 'Lentera senja'],
    ['03-mushroom-garden', 'taman jamur bercahaya dan bunga liar', 'Taman jamur'],
    ['04-floral-arch', 'siluet pasangan di bawah gapura bunga', 'Gapura bunga'],
    ['05-little-bridge', 'jembatan kayu kecil di atas sungai berkilau', 'Jembatan kecil'],
    ['06-petal-sky', 'kelopak bunga berjatuhan di langit malam', 'Hujan kelopak'],
    ['07-wishing-tree', 'pohon harapan dengan kartu-kartu doa bercahaya', 'Pohon harapan'],
    ['08-forest-path', 'jalan setapak berlentera menuju hutan', 'Jalan setapak'],
].map(([file, alt, caption]) => ({
    src: aset(`gallery/${file}.webp`),
    thumb: aset(`gallery/thumbs/${file}.webp`),
    alt: `Ilustrasi contoh: ${alt}`,
    caption,
    isDemo: true,
}));

/** Story chapters of the original design use these thumbnails, in this order. */
export const DEMO_STORY_IMAGES = ['08-forest-path', '03-mushroom-garden', '02-twilight-lanterns', '04-floral-arch'].map((f) =>
    aset(`gallery/thumbs/${f}.webp`),
);
