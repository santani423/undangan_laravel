/* =====================================================================
   Birthday Theme 10 — Dunia Mainan 3D (undangan ulang tahun anak)
   Tamu membuka undangan di gerbang kota mainan, lalu menggulir halaman
   menerbangkan kamera melintasi satu pulau mainan dengan lima tujuan:
   gerbang, panggung balok, taman pesta + kue raksasa, korsel foto, dan
   plaza kado (RSVP, kado digital, ucapan terima kasih).
   Port dari proyek Vite asli (resources/views/themes/birthdayThemes/birthday_theme_10/source).
   ===================================================================== */
import type { BirthdayInvitation, Greeting } from '@/types/invitation';
import { gsap } from 'gsap';
import { lazy, memo, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { music } from './audio/audioEngine';
import './birthday-theme-10.css';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { StaticWorldFallback } from './components/layout/StaticWorldFallback';
import { TopBar } from './components/layout/TopBar';
import { TravelSpacer } from './components/layout/TravelSpacer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider, useToast } from './components/ui/Toast';
import { InvitationContext, useInvitation, type InvitationValue } from './context/InvitationContext';
import { useMusic } from './hooks/useMusic';
import { useReducedMotion } from './hooks/useReducedMotion';
import { ScrollTrigger, useScrollCamera } from './hooks/useScrollCamera';
import { useTypingState } from './hooks/useTypingState';
import { buildInvitation } from './lib/data';
import { detectQuality, isWebGLAllowed } from './lib/device';
import { SECTIONS, visibleSectionIds } from './lib/journey';
import { lockScroll } from './lib/scrollLock';
import { installFonts } from './lib/theme';
import { BirthdayProfile } from './sections/BirthdayProfile';
import { DigitalGift } from './sections/DigitalGift';
import { EventDetails } from './sections/EventDetails';
import { InvitationCover } from './sections/InvitationCover';
import { Lightbox } from './sections/Lightbox';
import { MemoryGallery } from './sections/MemoryGallery';
import { RSVPSection } from './sections/RSVPSection';
import { ThankYou } from './sections/ThankYou';
import { createRsvpService } from './services/rsvpService';
import { celebrate, setCelebrationsEnabled } from './store/celebrations';
import { resetExperience, setExperience, useExperience } from './store/experience';
import { journey, resetJourney } from './store/journey';

// The 3D world (three.js + React Three Fiber) is split into its own chunk and loaded in parallel.
const ToyWorldCanvas = lazy(() => import('./scene/ToyWorldCanvas'));

/** Scenes 2–5, minus the sections switched off for this invitation. Memoised so opening the cover only toggles `inert`. */
const InvitationSections = memo(function InvitationSections({ reducedMotion }: { reducedMotion: boolean }) {
    const { sections } = useInvitation();
    return (
        <>
            {sections.has('profil') && (
                <>
                    <TravelSpacer label={SECTIONS[1].travelLabel} />
                    <BirthdayProfile />
                </>
            )}
            {sections.has('acara') && (
                <>
                    <TravelSpacer label={SECTIONS[2].travelLabel} />
                    <EventDetails />
                </>
            )}
            {sections.has('galeri') && (
                <>
                    <TravelSpacer label={SECTIONS[3].travelLabel} />
                    <MemoryGallery />
                </>
            )}
            <TravelSpacer label={SECTIONS[4].travelLabel} />
            <RSVPSection />
            <DigitalGift />
            <ThankYou reducedMotion={reducedMotion} />
        </>
    );
});

/** Plays the opening camera move from the establishing shot to the gate. */
function flyIn(reducedMotion: boolean) {
    if (reducedMotion) journey.intro = 1;
    else gsap.to(journey, { intro: 1, duration: 2.6, ease: 'power2.inOut', overwrite: true });
}

/** The invitation after mount: 3D world (or its 2D fallback), cover, sections and floating chrome. */
function Experience() {
    const { config, sections } = useInvitation();
    const reducedMotion = useReducedMotion();
    const opened = useExperience((s) => s.opened);
    const webglUnavailable = useExperience((s) => s.webglUnavailable);
    const [webglAllowed] = useState(isWebGLAllowed);
    const quality = useMemo(detectQuality, []);
    const toast = useToast();
    const show3D = webglAllowed && !webglUnavailable;
    const firstSection = SECTIONS.find((s) => s.id !== 'beranda' && sections.has(s.id))?.id ?? 'rsvp';

    useEffect(() => {
        if (!webglAllowed) setExperience({ webglUnavailable: true });
    }, [webglAllowed]);

    useScrollCamera({ enabled: opened, reducedMotion });
    useMusic(() => toast('Musik tidak dapat diputar di perangkat ini', 'error'));
    useTypingState();

    // The page stays locked on the cover until the invitation is opened.
    useEffect(() => {
        if (opened) {
            const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
            return () => cancelAnimationFrame(frame);
        }
        return lockScroll();
    }, [opened]);

    // Cover switched off in the invitation settings: the world opens by itself (music waits for the guest's tap).
    useEffect(() => {
        if (!config.features.cover) flyIn(reducedMotion);
        // Runs once on mount; the reduced-motion preference at that moment is what matters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpen = useCallback(() => {
        // Music may only start from this explicit user gesture.
        setExperience({ opened: true, soundOn: config.features.music && music.hasSource && config.music.autoplay });
        celebrate('gate', 1);
        flyIn(reducedMotion);
    }, [reducedMotion, config]);

    const handleSceneFailure = useCallback(() => {
        setExperience({ webglUnavailable: true });
        toast('Dunia 3D tidak tersedia di perangkat ini — undangan tetap lengkap.', 'info');
    }, [toast]);

    return (
        <>
            {opened && (
                <a href={`#${firstSection}`} className="bt10-btn bt10-btn--white bt10-btn--sm bt10-skip">
                    Lewati ke isi undangan
                </a>
            )}

            {show3D ? (
                <ErrorBoundary fallback={null} onError={handleSceneFailure}>
                    <Suspense fallback={null}>
                        <ToyWorldCanvas quality={quality} reducedMotion={reducedMotion} />
                    </Suspense>
                </ErrorBoundary>
            ) : (
                <StaticWorldFallback />
            )}
            <LoadingScreen active={show3D} />

            {opened && <TopBar reducedMotion={reducedMotion} />}

            {/* Click-through layer: only panels opt back in (pointer-events: auto), so taps on
                empty space reach the 3D objects and wheel/touch scrolling still moves the page. */}
            <main id="bt10-journey" className="bt10-journey">
                <InvitationCover onOpen={handleOpen} reducedMotion={reducedMotion} />
                <div inert={!opened}>
                    <InvitationSections reducedMotion={reducedMotion} />
                </div>
            </main>

            <Lightbox />
        </>
    );
}

interface BirthdayTheme10Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

export default function BirthdayTheme10({ invitation, visitor, greeting }: BirthdayTheme10Props) {
    const config = useMemo(() => buildInvitation(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const value = useMemo<InvitationValue>(
        () => ({
            config,
            rsvpService: createRsvpService(config),
            sections: visibleSectionIds(config.features, config.gallery.length > 0),
        }),
        [config],
    );

    // Browser-only state (WebGL probe, storage, scroll) is decided after mount, which keeps server rendering safe.
    const [booted, setBooted] = useState(false);

    useLayoutEffect(() => {
        // Stores outlive the page in Inertia: a newly opened invitation always starts at the gate.
        resetJourney();
        resetExperience({ opened: !config.features.cover });
        setCelebrationsEnabled(config.features.confetti);
        // A track that cannot play falls back to the theme's generated music box.
        music.configure({ src: config.music.src, volume: config.music.volume, loop: config.music.loop, useGeneratedFallback: true });
    }, [config]);

    useEffect(() => {
        const removeFonts = installFonts();
        const html = document.documentElement;
        html.classList.add('bt10-html');
        const restoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        setBooted(true);
        return () => {
            removeFonts();
            html.classList.remove('bt10-html');
            history.scrollRestoration = restoration;
            gsap.killTweensOf(journey);
            gsap.killTweensOf(window);
            music.reset();
            document.body.style.cursor = '';
        };
    }, []);

    return (
        <InvitationContext.Provider value={value}>
            <div className="bt10">
                <ToastProvider>{booted ? <Experience /> : <div className="bt10-boot" aria-hidden="true" />}</ToastProvider>
            </div>
        </InvitationContext.Provider>
    );
}
