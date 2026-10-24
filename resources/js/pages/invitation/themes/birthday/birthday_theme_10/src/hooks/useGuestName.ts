import { useMemo } from 'react';
import { invitationConfig } from '../config/invitation.config';

/** Reads the personalised guest name from the URL (`?to=Budi+Santoso`). */
export function useGuestName() {
  return useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get(invitationConfig.invitation.guestQueryParam) ?? '';
    // eslint-disable-next-line no-control-regex
    const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return { name: cleaned || invitationConfig.invitation.defaultGuestName, personalised: cleaned.length > 0 };
  }, []);
}
