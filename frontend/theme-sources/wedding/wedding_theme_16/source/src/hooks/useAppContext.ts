import { useContext } from 'react';
import { ExperienceContext, MusicContext, ToastContext, type MusicValue, type ToastValue } from '../context/contexts';

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
