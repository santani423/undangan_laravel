import { useMemo, type ReactNode } from 'react';
import { getRecipientName } from '../lib/urlFlags';
import type { InvitationConfig } from '../types/invitation';
import { InvitationContext, type InvitationValue } from './contexts';

export function InvitationProvider({ config, children }: { config: InvitationConfig; children: ReactNode }) {
  const value = useMemo<InvitationValue>(() => {
    const { bride, groom, order } = config.couple;
    return {
      config,
      recipientName: getRecipientName(),
      first: order === 'bride-first' ? bride : groom,
      second: order === 'bride-first' ? groom : bride,
    };
  }, [config]);

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>;
}
