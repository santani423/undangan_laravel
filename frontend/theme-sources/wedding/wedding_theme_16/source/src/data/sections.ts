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

export const SECTION_IDS: SectionId[] = SECTIONS.map((section) => section.id);
