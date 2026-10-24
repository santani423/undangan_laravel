import type { PanelSide, SectionId } from '../types/invitation';

export type StopId = 'entrance' | 'profile' | 'party' | 'gallery' | 'rsvp' | 'gift' | 'finale';

export interface CameraStopDef {
  id: StopId;
  section: SectionId;
  /** Panel position on wide screens; the camera frames the 3D subject on the opposite side. */
  panel: PanelSide;
}

/**
 * Ordered camera stops. Each DOM block with `data-camera-stop={index}` maps to
 * one entry; the RSVP section holds three sub-stops (form, gift, finale).
 */
export const CAMERA_STOPS: readonly CameraStopDef[] = [
  { id: 'entrance', section: 'beranda', panel: 'center' },
  { id: 'profile', section: 'profil', panel: 'right' },
  { id: 'party', section: 'acara', panel: 'left' },
  { id: 'gallery', section: 'galeri', panel: 'right' },
  { id: 'rsvp', section: 'rsvp', panel: 'left' },
  { id: 'gift', section: 'rsvp', panel: 'right' },
  { id: 'finale', section: 'rsvp', panel: 'left' },
];

export const STOP_INDEX: Record<StopId, number> = Object.fromEntries(
  CAMERA_STOPS.map((s, i) => [s.id, i]),
) as Record<StopId, number>;

export interface SectionDef {
  id: SectionId;
  label: string;
  /** First camera stop of the section — navigation scrolls here. */
  stop: number;
  travelLabel: string;
}

export const SECTIONS: readonly SectionDef[] = [
  { id: 'beranda', label: 'Gerbang', stop: STOP_INDEX.entrance, travelLabel: 'Kembali ke gerbang' },
  { id: 'profil', label: 'Profil', stop: STOP_INDEX.profile, travelLabel: 'Menuju panggung balok' },
  { id: 'acara', label: 'Acara', stop: STOP_INDEX.party, travelLabel: 'Menuju taman pesta' },
  { id: 'galeri', label: 'Galeri', stop: STOP_INDEX.gallery, travelLabel: 'Menyusuri jalan taman' },
  { id: 'rsvp', label: 'RSVP', stop: STOP_INDEX.rsvp, travelLabel: 'Tiba di plaza kado' },
];

export function sectionForStop(stop: number): SectionId {
  const i = Math.min(CAMERA_STOPS.length - 1, Math.max(0, Math.round(stop)));
  return CAMERA_STOPS[i].section;
}
