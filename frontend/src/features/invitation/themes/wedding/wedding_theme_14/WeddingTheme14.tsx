/* =====================================================================
   Wedding Theme 14 — Pawiwahan Agung (undangan pernikahan adat Jawa, 3D sinematik)
   Satu dunia prosedural yang dijelajahi kamera sambil menggulir: regol → pendhapa →
   taman sari → pawiwahan → pringgitan → serat katresnan → among tamu → tanda kasih.
   Port dari proyek Vite asli (resources/views/themes/weddingThemes/wedding_theme_14/source).
   ===================================================================== */
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LiteExperience } from './components/LiteExperience';
import { LoadingScreen } from './components/LoadingScreen';
import { AmbientAudio } from './lib/audio';
import { ThemeProvider, visibleScenes, type ThemeState } from './lib/context';
import { buildWedding } from './lib/data';
import { hasWebGL } from './lib/hooks';
import { resetJourney } from './lib/journey';
import { createRsvpService } from './lib/rsvp';
import './wedding-theme-14.css';

// three.js + React Three Fiber only download when the 3D journey is actually shown.
const CinematicExperience = lazy(() => import('./components/CinematicExperience'));

/** Falls back to the lite layout when the 3D chunk itself cannot be downloaded or evaluated. */
class ChunkBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch() {
        this.props.onError();
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}

interface WeddingTheme14Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

type Mode = '3d' | 'lite';

const NOTICES: Record<string, string | null> = {
    'no-webgl': 'Peramban atau perangkat ini tidak mendukung WebGL, jadi undangan ditampilkan dalam versi ringan. Semua fitur tetap tersedia.',
    'context-lost': 'Tampilan 3D dihentikan oleh peramban karena kendala grafis. Semua fitur tetap tersedia di versi ringan ini.',
    'render-error': 'Tampilan 3D tidak dapat ditampilkan di perangkat ini. Semua fitur tetap tersedia di versi ringan ini.',
    'asset-error': 'Sebagian aset 3D gagal dimuat. Semua fitur tetap tersedia di versi ringan ini.',
    user: null,
    param: null,
};

const FONT_ID = 'wt14-font';
const FONT_URL =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&family=Pinyon+Script&display=swap';

/** Installs the theme's Google Fonts stylesheet; returns the cleanup. */
function installFont(): () => void {
    if (document.getElementById(FONT_ID)) return () => {};
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
    return () => link.remove();
}

export default function WeddingTheme14({ invitation, visitor, greeting }: WeddingTheme14Props) {
    const wedding = useMemo(() => buildWedding(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const rsvp = useMemo(() => createRsvpService(wedding.rsvp, wedding.guest.slug), [wedding.rsvp, wedding.guest.slug]);
    const audio = useMemo(
        () => (wedding.sections.music ? new AmbientAudio(wedding.audio.src || null, wedding.audio.loop) : null),
        [wedding.sections.music, wedding.audio.src, wedding.audio.loop],
    );
    useEffect(() => () => audio?.dispose(), [audio]);
    const theme = useMemo<ThemeState>(() => ({ wedding, rsvp, audio, scenes: visibleScenes(wedding) }), [wedding, rsvp, audio]);

    // Decided after mount: WebGL probing needs the browser (keeps server rendering safe).
    const [webgl, setWebgl] = useState(false);
    const [mode, setMode] = useState<Mode | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        resetJourney();
        const ok = hasWebGL();
        const forcedLite = new URLSearchParams(window.location.search).get('mode') === 'lite';
        setWebgl(ok);
        setNotice(ok ? null : NOTICES['no-webgl']);
        setMode(ok && !forcedLite ? '3d' : 'lite');
    }, []);

    useEffect(() => {
        const removeFont = installFont();
        document.documentElement.classList.add('wt14-html');
        return () => {
            removeFont();
            document.documentElement.classList.remove('wt14-html', 'wt14-locked');
            resetJourney();
        };
    }, []);

    const toLite = useCallback((reason: string) => {
        resetJourney();
        setNotice(NOTICES[reason] ?? null);
        setMode('lite');
        window.scrollTo(0, 0);
    }, []);

    const to3D = useCallback(() => {
        resetJourney();
        setNotice(null);
        window.scrollTo(0, 0);
        setMode('3d');
    }, []);

    return (
        <ThemeProvider value={theme}>
            <div className="wt14">
                {mode === '3d' && (
                    <ChunkBoundary onError={() => toLite('asset-error')}>
                        <Suspense fallback={<LoadingScreen progress={0} label="Memuat aset" hidden={false} />}>
                            <CinematicExperience key="3d" onFallback={toLite} />
                        </Suspense>
                    </ChunkBoundary>
                )}
                {mode === 'lite' && <LiteExperience key="lite" notice={notice} canUse3D={webgl} onUse3D={to3D} />}
                {mode === null && <LoadingScreen progress={0} label="Memuat undangan" hidden={false} />}
            </div>
        </ThemeProvider>
    );
}
