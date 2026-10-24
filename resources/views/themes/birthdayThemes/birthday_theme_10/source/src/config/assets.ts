/**
 * Central asset map. Every component reads asset URLs from here instead of
 * hard-coding paths. Filenames and folders mirror the supplied
 * "Toy World Birthday Invitation Asset Pack" (see public/assets/asset-manifest.json).
 */
const BASE = import.meta.env.BASE_URL;
const asset = (path: string) => `${BASE}assets/${path}`;

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
    /** Shown when a configured gallery photo fails to load. */
    fallback: asset('illustrations/toy-blocks.svg'),
  },
  manifest: asset('asset-manifest.json'),
} as const;

export type IllustrationKey = keyof typeof toyAssets.illustrations;
export type PackIconName = keyof typeof toyAssets.ui;

/** Builds a URL for project-owned files in public/assets (gallery, portrait, audio). */
export const projectAsset = asset;
