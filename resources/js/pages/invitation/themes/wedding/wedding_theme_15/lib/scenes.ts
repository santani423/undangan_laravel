import { SECTION_IDS, type SectionId } from '../scene/waypoints';
import type { WeddingConfig } from './types';

export type SceneId = SectionId;

export interface SceneDef {
    id: SceneId;
    /** Index of the scene's waypoint in the full 3D journey (scene/waypoints.ts). */
    waypoint: number;
}

/**
 * Sections shown for this invitation, in scroll order. The camera path is built from
 * these only, so a switched-off section is simply skipped by the journey.
 */
export function visibleScenes(w: WeddingConfig): SceneDef[] {
    const s = w.sections;
    const show: Record<SceneId, boolean> = {
        home: true,
        couple: s.couple,
        countdown: s.countdown,
        story: s.story,
        event: s.events,
        gallery: s.gallery || s.video,
        rsvp: s.rsvp,
        wishes: s.wishes,
        gift: s.gift,
        closing: true,
    };
    return SECTION_IDS.map((id, waypoint) => ({ id, waypoint })).filter((sc) => show[sc.id]);
}
