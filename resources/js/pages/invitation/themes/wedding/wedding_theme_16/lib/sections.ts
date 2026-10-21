import type { Sections } from './types';

/** Ordered invitation sections. The order defines the 3D camera journey. */
export const SECTIONS = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'mempelai', label: 'Mempelai' },
    { id: 'acara', label: 'Acara' },
    { id: 'lokasi', label: 'Lokasi' },
    { id: 'kisah', label: 'Kisah Cinta' },
    { id: 'galeri', label: 'Galeri' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'buku-tamu', label: 'Buku Tamu' },
    { id: 'dress-code', label: 'Dress Code' },
    { id: 'hadiah', label: 'Hadiah Digital' },
    { id: 'penutup', label: 'Penutup' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
export type SectionInfo = (typeof SECTIONS)[number];

/** Feature toggle that hides each section (hero and closing are always shown). */
const TOGGLE: Partial<Record<SectionId, keyof Sections>> = {
    mempelai: 'couple',
    acara: 'events',
    lokasi: 'location',
    kisah: 'story',
    galeri: 'gallery',
    rsvp: 'rsvp',
    'buku-tamu': 'guestbook',
    'dress-code': 'dressCode',
    hadiah: 'gift',
};

/** Sections shown for this invitation, in journey order. The camera flies past the places of hidden ones. */
export function visibleSections(sections: Sections): SectionInfo[] {
    return SECTIONS.filter((section) => {
        const toggle = TOGGLE[section.id];
        return !toggle || sections[toggle];
    });
}
