import { useContext } from 'react';
import {
    ExperienceContext,
    InvitationContext,
    MusicContext,
    ToastContext,
    type InvitationValue,
    type MusicValue,
    type ToastValue,
} from '../context/contexts';

/** Typed access to the invitation configuration and the visible sections. */
export function useInvitationData(): InvitationValue {
    const value = useContext(InvitationContext);
    if (!value) throw new Error('useInvitationData must be used inside <WeddingTheme16>');
    return value;
}

export function useToast(): ToastValue {
    const value = useContext(ToastContext);
    if (!value) throw new Error('useToast must be used inside <ToastProvider>');
    return value;
}

export function useMusic(): MusicValue {
    const value = useContext(MusicContext);
    if (!value) throw new Error('useMusic must be used inside <MusicProvider>');
    return value;
}

export function useExperience() {
    return useContext(ExperienceContext);
}
