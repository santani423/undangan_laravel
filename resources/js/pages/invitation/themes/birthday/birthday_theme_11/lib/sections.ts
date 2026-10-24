import type { SectionKey, SmileConfig } from './types';

export interface SectionDef {
    key: SectionKey;
    /** DOM id, also the deep link (#rsvp). */
    id: string;
    /** Index of the 3D station the camera visits (scene/stations.ts). */
    station: number;
    nav: string;
    title: string;
    /** Where the panel sits on wide screens, so the 3D subject is framed on the other side. */
    side: 'left' | 'right' | 'bottom';
}

/** Section ids, titles and camera stops — docs/asset-pack/scene-plan.json of the original pack. */
export const SECTIONS: SectionDef[] = (
    [
        ['hero', 'beranda', 'Beranda', 'Selamat Datang di Petualangan Senyum', 'left'],
        ['invitation', 'undangan', 'Undangan', 'Undangan Spesial', 'right'],
        ['details', 'waktu-tempat', 'Waktu & Tempat', 'Kapan & Di Mana?', 'left'],
        ['activities', 'aktivitas', 'Aktivitas', 'Ayo Bermain Bersama!', 'right'],
        ['gallery', 'galeri', 'Galeri', 'Momen Kecil, Senyum Besar', 'left'],
        ['cake', 'kue', 'Kue', 'Ayo Buat Permohonan!', 'left'],
        ['rsvp', 'rsvp', 'RSVP', 'Kamu Bisa Datang?', 'right'],
        ['finale', 'terima-kasih', 'Terima Kasih', 'Terima Kasih!', 'bottom'],
    ] as const
).map(([key, id, nav, title, side], station) => ({ key, id, station, nav, title, side }));

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s])) as Record<SectionKey, SectionDef>;

/** Sections switched off in the invitation settings are left out; the camera flies past their stations. */
export function visibleSections(config: SmileConfig): SectionDef[] {
    const f = config.features;
    const shown: Record<SectionKey, boolean> = {
        hero: true,
        invitation: f.greeting,
        details: f.event,
        activities: true,
        gallery: config.gallery.length > 0,
        cake: true,
        rsvp: f.rsvp || f.wishes || f.gift,
        finale: true,
    };
    return SECTIONS.filter((s) => shown[s.key]);
}
