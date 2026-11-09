import { createContext, useContext } from 'react';
import type { SectionId, ToyConfig } from '../lib/types';
import type { RsvpService } from '../services/rsvpService';

export interface InvitationValue {
    config: ToyConfig;
    rsvpService: RsvpService;
    /** Sections shown for this invitation (switched-off features are left out of the journey). */
    sections: Set<SectionId>;
}

export const InvitationContext = createContext<InvitationValue | null>(null);

/** Invitation data for the HTML panels and the 3D scene (R3F bridges this context into the canvas). */
export function useInvitation(): InvitationValue {
    const value = useContext(InvitationContext);
    if (!value) throw new Error('useInvitation must be used inside <BirthdayTheme10>.');
    return value;
}
