/**
 * Central asset map of the "Toy World Birthday Invitation Asset Pack". Files
 * live in ../assets and go through Vite (hashed, bundled with the theme), so
 * every component reads URLs from here instead of hard-coding paths.
 */
import type { GalleryImage } from './types';

const files = import.meta.glob<string>('../assets/**/*.{svg,png}', { eager: true, query: '?url', import: 'default' });

const asset = (path: string) => files[`../assets/${path}`] ?? '';

export const toyAssets = {
    illustrations: {
        house: asset('illustrations/toy-house.svg'),
        tree: asset('illustrations/toy-tree.svg'),
        balloons: asset('illustrations/balloon-bunch.svg'),
        cake: asset('illustrations/birthday-cake.svg'),
        gift: asset('illustrations/gift-box.svg'),
        car: asset('illustrations/toy-car.svg'),
        mascot: asset('illustrations/mascot-bear.svg'),
        blocks: asset('illustrations/toy-blocks.svg'),
    },
    textures: {
        grassColor: asset('textures/grass-basecolor.png'),
        grassNormal: asset('textures/grass-normal.png'),
        grassRoughness: asset('textures/grass-roughness.png'),
    },
    sprites: {
        confetti: asset('sprites/confetti-sprite.png'),
        softParticle: asset('sprites/soft-particle.png'),
    },
    ui: {
        music: asset('ui/music.svg'),
        mapPin: asset('ui/map-pin.svg'),
        calendar: asset('ui/calendar.svg'),
        gift: asset('ui/gift.svg'),
        camera: asset('ui/camera.svg'),
        check: asset('ui/check.svg'),
        chevronDown: asset('ui/chevron-down.svg'),
        close: asset('ui/close.svg'),
        play: asset('ui/play.svg'),
        pause: asset('ui/pause.svg'),
    },
    gallery: {
        /** Shown when a gallery photo fails to load. */
        fallback: asset('illustrations/toy-blocks.svg'),
        /** Illustrated portrait for sample invitations without a photo. */
        portrait: asset('gallery/portrait-kirana.svg'),
    },
} as const;

export type IllustrationKey = keyof typeof toyAssets.illustrations;
export type PackIconName = keyof typeof toyAssets.ui;

/** Illustrated placeholders (not photos of anyone) for sample invitations without a gallery. */
export const SAMPLE_GALLERY: GalleryImage[] = [
    ['01', 'Ilustrasi kue ulang tahun dengan tiga lilin menyala', 'Tiup lilin pertama'],
    ['02', 'Ilustrasi mobil mainan merah di jalan taman', 'Balapan mobil-mobilan di taman'],
    ['03', 'Ilustrasi boneka beruang memegang balon', 'Bersama sahabat beruang kesayangan'],
    ['04', 'Ilustrasi tumpukan balok mainan warna-warni', 'Menara balok tertinggi buatan sendiri'],
    ['05', 'Ilustrasi kotak kado biru dengan pita merah muda', 'Kejutan kado dari Kakek dan Nenek'],
    ['06', 'Ilustrasi rumah mainan dan pohon di bukit', 'Piknik sore di dekat rumah'],
].map(([n, alt, caption]) => ({ id: `contoh-${n}`, src: asset(`gallery/memory-${n}.svg`), alt, caption, demo: true }));
