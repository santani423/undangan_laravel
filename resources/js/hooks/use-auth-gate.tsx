import AuthModal from '@/components/onboarding/auth-modal';
import { type SharedData } from '@/types';
import { type OnboardingIntent } from '@/types/onboarding';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

/**
 * Gates a "Buat Undangan" action behind authentication. Authenticated
 * customers go straight to `url`; guests get the shared auth modal instead
 * of being bounced to a full register/login page, with their theme/package
 * choice (`intent`) carried through so they land back on `url` after
 * signing in (see OnboardingContextResolver on the backend).
 */
export function useAuthGate() {
    const { auth } = usePage<SharedData>().props;
    const authed = !!auth.user;

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [intent, setIntent] = useState<OnboardingIntent>({});

    const requireAuth = useCallback(
        (url: string, ctxIntent: OnboardingIntent = {}) => {
            if (authed) {
                router.visit(url);
                return;
            }
            setIntent(ctxIntent);
            setMode('register');
            setOpen(true);
        },
        [authed],
    );

    const modal = <AuthModal open={open} onOpenChange={setOpen} mode={mode} onModeChange={setMode} intent={intent} />;

    return { authed, requireAuth, modal };
}
