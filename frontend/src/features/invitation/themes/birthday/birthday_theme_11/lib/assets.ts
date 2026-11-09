/**
 * Asset map of the "Little Smile Dental Adventure" pack. Files live in ../assets and go
 * through Vite (hashed, bundled with the theme), so every component and the 3D world read
 * URLs from here instead of hard-coding paths.
 */
import type { ActivityIcon, Photo } from './types';

const files = import.meta.glob<string>('../assets/**/*.{svg,json}', { eager: true, query: '?url', import: 'default' });

const asset = (path: string) => files[`../assets/${path}`] ?? '';

export const smileAssets = {
    mascot: asset('dr-smiley.svg'),
    toothFriend: asset('tooth-friend.svg'),
    cake: asset('birthday-cake.svg'),
    gift: asset('gift-box.svg'),
    balloons: asset('balloons.svg'),
    toothbrush: asset('toothbrush.svg'),
    envelope: asset('envelope.svg'),
    calendar: asset('calendar.svg'),
    locationPin: asset('location-pin.svg'),
    games: asset('icons/games.svg'),
    camera: asset('icons/camera.svg'),
    /** Fredoka Bold as a three.js typeface (OFL 1.1) for the 3D title. */
    titleFont: asset('fonts/fredoka-bold.typeface.json'),
} as const;

/** Card illustration for each activity icon. */
export const ACTIVITY_ART: Record<ActivityIcon, string> = {
    games: smileAssets.games,
    dental: smileAssets.toothbrush,
    photo: smileAssets.camera,
    cake: smileAssets.cake,
    gift: smileAssets.gift,
    balloons: smileAssets.balloons,
};

/** Labelled placeholder cards (not photos of anyone) for sample invitations without a gallery. */
export const SAMPLE_GALLERY: Photo[] = [
    'Hari gigi pertama',
    'Pengejar balon',
    'Belepotan kue, usia 2',
    'Jagoan sikat gigi',
    'Pembuka kado',
    'Senyum lebar, usia 4',
].map((caption, i) => ({
    src: asset(`gallery/photo-placeholder-${i + 1}.svg`),
    alt: `Kartu contoh pengganti foto ${i + 1}`,
    caption,
    demo: true,
}));

/** Shown in the grid and the lightbox when a photo fails to load. */
export const MISSING_PHOTO =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#e8f6fb"/><text x="300" y="310" font-family="Nunito, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2d94c6">Foto tidak ditemukan</text></svg>',
    );
