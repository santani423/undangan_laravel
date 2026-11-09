/* =====================================================================
   Wedding Theme 16 — Taman Voxel 3D (undangan pernikahan)
   Tamu menjelajahi satu taman voxel real-time: menggulir halaman menggerakkan
   kamera dari gapura masuk sampai gapura akad, dan setiap fitur undangan tampil
   sebagai kartu HTML di tempatnya sendiri di taman. Siang perlahan berubah senja.
   Port dari proyek Vite asli (resources/views/themes/weddingThemes/wedding_theme_16/source).
   ===================================================================== */
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ComponentType } from 'react';
import { InvitationCover } from './components/InvitationCover';
import { LoadingScreen } from './components/LoadingScreen';
import { MusicController } from './components/MusicController';
import { SampleBadge } from './components/SampleBadge';
import { SceneLayer } from './components/SceneLayer';
import { SectionNavigation } from './components/SectionNavigation';
import { ExperienceContext, InvitationContext, type ExperiencePhase, type InvitationValue } from './context/contexts';
import { MusicProvider } from './context/MusicProvider';
import { ToastProvider } from './context/ToastProvider';
import { useInvitationData, useMusic, useToast } from './hooks/useAppContext';
import { useReducedMotion } from './hooks/useMediaQuery';
import { useScrollCamera } from './hooks/useScrollCamera';
import { CAMERA_WAYPOINTS, waypointIndex } from './lib/cameraWaypoints';
import { cx } from './lib/cx';
import { buildInvitation } from './lib/data';
import { detectQualityTier } from './lib/quality';
import { visibleSections, type SectionId } from './lib/sections';
import { isWebGLForcedOff } from './lib/urlFlags';
import { detectWebGL } from './lib/webgl';
import { journey, resetJourney } from './scene/journeyState';
import { sceneStatus } from './scene/sceneStatus';
import { ClosingSection } from './sections/ClosingSection';
import { CoupleSection } from './sections/CoupleSection';
import { DigitalGiftSection } from './sections/DigitalGiftSection';
import { DressCodeSection } from './sections/DressCodeSection';
import { EventSection } from './sections/EventSection';
import { GallerySection } from './sections/GallerySection';
import { GuestbookSection } from './sections/GuestbookSection';
import { HeroSection } from './sections/HeroSection';
import { LocationSection } from './sections/LocationSection';
import { LoveStorySection } from './sections/LoveStorySection';
import { RSVPSection } from './sections/RSVPSection';
import './wedding-theme-16.css';

const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
    beranda: HeroSection,
    mempelai: CoupleSection,
    acara: EventSection,
    lokasi: LocationSection,
    kisah: LoveStorySection,
    galeri: GallerySection,
    rsvp: RSVPSection,
    'buku-tamu': GuestbookSection,
    'dress-code': DressCodeSection,
    hadiah: DigitalGiftSection,
    penutup: ClosingSection,
};

const FONT_ID = 'wt16-font';
const FONT_URL =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Jost:wght@400;500&display=swap';

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

/** The invitation after mount: cover, 3D garden, sections and floating controls. */
function Experience() {
    const { config, first, second, sections } = useInvitationData();
    const music = useMusic();
    const { notify } = useToast();
    const reducedMotion = useReducedMotion();
    const [webgl, setWebgl] = useState(() => !isWebGLForcedOff() && detectWebGL());
    const [tier] = useState(detectQualityTier);
    const withCover = config.sections.cover;
    const [phase, setPhase] = useState<ExperiencePhase>(withCover ? 'cover' : 'open');
    const [coverVisible, setCoverVisible] = useState(withCover);
    const [cameraArrived, setCameraArrived] = useState(false);
    const ids = useMemo(() => sections.map((section) => section.id), [sections]);
    const heroStop = waypointIndex('beranda');

    // The cover is modal: page scrolling stays locked until it has gone.
    useLayoutEffect(() => {
        document.documentElement.classList.toggle('wt16-locked', coverVisible);
    }, [coverVisible]);

    /** Flies the camera from the establishing shot to the hero waypoint. */
    const flyToHero = useCallback(
        (duration: number) =>
            gsap.to(journey, {
                u: heroStop,
                dusk: CAMERA_WAYPOINTS[heroStop].dusk,
                duration,
                ease: 'power2.inOut',
                onComplete: () => setCameraArrived(true),
            }),
        [heroStop],
    );

    // Cover switched off in the invitation settings: the garden opens by itself (music waits for the guest's tap).
    useEffect(() => {
        if (withCover) return;
        const tween = flyToHero(reducedMotion ? 0 : 2.6);
        return () => {
            tween.kill();
        };
        // Runs once on mount; the reduced-motion preference at that moment is what matters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpen = () => {
        // Music may only start from this explicit user gesture.
        if (config.music.playOnOpen) music.play();
        setPhase('opening');
        flyToHero(reducedMotion ? 0 : 2.6);
    };

    const handleCoverExited = useCallback(() => {
        setCoverVisible(false);
        setPhase('open');
        window.scrollTo(0, 0);
        requestAnimationFrame(() => document.getElementById('beranda-title')?.focus({ preventScroll: true }));
    }, []);

    const handleSceneFailure = useCallback(
        (reason: string) => {
            console.warn('[wt16] Beralih ke tampilan statis:', reason);
            setWebgl(false);
            notify('Taman 3D tidak tersedia di perangkat ini — undangan tetap lengkap.', 'info');
        },
        [notify],
    );

    useScrollCamera(phase === 'open' && cameraArrived, reducedMotion, ids);

    const experience = useMemo(() => ({ phase, reducedMotion }), [phase, reducedMotion]);

    return (
        <ExperienceContext.Provider value={experience}>
            {!coverVisible && (
                <a href="#beranda" className="wt16-skip-link">
                    Lewati ke isi undangan
                </a>
            )}
            <SceneLayer enabled={webgl} tier={tier} reducedMotion={reducedMotion} onFailure={handleSceneFailure} />
            <LoadingScreen active={webgl} title={`${first.nickname} & ${second.nickname}`} />
            {coverVisible && (
                <InvitationCover opening={phase !== 'cover'} reducedMotion={reducedMotion} onOpen={handleOpen} onExited={handleCoverExited} />
            )}

            <main className={cx('wt16-main', phase === 'cover' && 'is-hidden')} inert={coverVisible}>
                {sections.map(({ id }) => {
                    const Section = SECTION_COMPONENTS[id];
                    return <Section key={id} />;
                })}
            </main>

            {!coverVisible && (
                <>
                    <SectionNavigation reducedMotion={reducedMotion} />
                    {music.enabled && <MusicController />}
                </>
            )}
            {config.meta.isSample && <SampleBadge />}
        </ExperienceContext.Provider>
    );
}

interface WeddingTheme16Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

export default function WeddingTheme16({ invitation, visitor, greeting }: WeddingTheme16Props) {
    const config = useMemo(() => buildInvitation(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const value = useMemo<InvitationValue>(() => {
        const { bride, groom, order } = config.couple;
        return {
            config,
            first: order === 'bride-first' ? bride : groom,
            second: order === 'bride-first' ? groom : bride,
            sections: visibleSections(config.sections),
        };
    }, [config]);

    // Browser-only state (WebGL probe, storage, scroll) is decided after mount, which keeps server rendering safe.
    const [booted, setBooted] = useState(false);

    useEffect(() => {
        // A newly opened invitation always starts at the cover's establishing shot.
        resetJourney();
        sceneStatus.set({ phase: 'idle', progress: 0 });
        const removeFont = installFont();
        const html = document.documentElement;
        html.classList.add('wt16-html');
        const restoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        setBooted(true);
        return () => {
            removeFont();
            html.classList.remove('wt16-html', 'wt16-locked', 'wt16-modal');
            history.scrollRestoration = restoration;
            gsap.killTweensOf(journey);
        };
    }, []);

    return (
        <InvitationContext.Provider value={value}>
            <div className="wt16">
                <ToastProvider>
                    <MusicProvider config={config.music} enabled={config.sections.music}>
                        {booted ? <Experience /> : <div className="wt16-boot" aria-hidden="true" />}
                    </MusicProvider>
                </ToastProvider>
            </div>
        </InvitationContext.Provider>
    );
}
