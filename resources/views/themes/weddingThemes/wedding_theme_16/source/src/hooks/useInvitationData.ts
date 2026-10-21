import { useContext } from 'react';
import { InvitationContext, type InvitationValue } from '../context/contexts';

/** Typed access to the invitation configuration and personalised recipient. */
export function useInvitationData(): InvitationValue {
  const value = useContext(InvitationContext);
  if (!value) throw new Error('useInvitationData must be used inside <InvitationProvider>');
  return value;
}
