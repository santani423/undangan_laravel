/* =====================================================================
   Wedding Theme 15 — Enchanted Twilight Forest (undangan pernikahan 3D)
   Satu hutan senja prosedural di belakang halaman; setiap section menggerakkan
   kamera ke komposisinya sendiri: amplop & gerbang hutan → bukit bunga → panggung
   bulan → lembah kisah → gapura akad → cincin galeri → gazebo lentera → pohon harapan.
   Port dari proyek Vite asli (resources/views/themes/weddingThemes/wedding_theme_15/source).
   ===================================================================== */
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { Component, lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Cover } from './components/Cover';
import { FallbackBackdrop } from './components/FallbackBackdrop';
import { Lightbox } from './components/Lightbox';
import { Nav } from './components/Nav';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { ThemeProvider, type ThemeState } from './lib/context';
import { buildWedding } from './lib/data';
import { MusicPlayer } from './lib/music';
import { killOpening, playOpening } from './lib/opening';
import { createRsvpService } from './lib/rsvp';
import { sceneFx } from './lib/sceneFx';
import { visibleScenes, type SceneId } from './lib/scenes';
import { useScrollScene } from './lib/scrollScene';
import { isSceneActive, resetApp, setApp, useApp } from './lib/store';
import { ClosingSection } from './sections/ClosingSection';
import { EventSection, GallerySection } from './sections/EventGallerySections';
import { GiftSection } from './sections/GiftSection';
import { CountdownSection, CoupleSection, HeroSection, StorySection } from './sections/IntroSections';
import { RsvpSection } from './sections/RsvpSection';
import { WishesSection } from './sections/WishesSection';
import './wedding-theme-15.css';

// three.js and the forest are code-split so the cover paints immediately.
const SceneCanvas = lazy(() => import('./scene/SceneCanvas'));

/** Falls back to the 2D forest when the 3D chunk itself cannot be downloaded or evaluated. */
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

const SECTIONS: Record<SceneId, ComponentType> = {
    home: HeroSection,
    couple: CoupleSection,
    countdown: CountdownSection,
    story: StorySection,
    event: EventSection,
    gallery: GallerySection,
    rsvp: RsvpSection,
    wishes: WishesSection,
    gift: GiftSection,
    closing: ClosingSection,
};

interface WeddingTheme15Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const FONT_ID = 'wt15-font';
const FONT_URL =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Plus+Jakarta+Sans:wght@300..800&display=swap';

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

/** Reduced-motion preference and mouse parallax, fed to the 3D scene without re-renders. */
function useGlobalInputs() {
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncMotion = () => (sceneFx.reducedMotion = mq.matches);
        syncMotion();
        mq.addEventListener('change', syncMotion);
        const onPointer = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            sceneFx.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
            sceneFx.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onPointer, { passive: true });
        return () => {
            mq.removeEventListener('change', syncMotion);
            window.removeEventListener('pointermove', onPointer);
        };
    }, []);
}

export default function WeddingTheme15({ invitation, visitor, greeting }: WeddingTheme15Props) {
    const wedding = useMemo(() => buildWedding(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const rsvp = useMemo(() => createRsvpService(wedding.rsvp, wedding.guest.slug), [wedding.rsvp, wedding.guest.slug]);
    const scenes = useMemo(() => visibleScenes(wedding), [wedding]);
    const [music, setMusic] = useState<MusicPlayer | null>(null);
    const theme = useMemo<ThemeState>(() => ({ wedding, rsvp, music, scenes }), [wedding, rsvp, music, scenes]);

    // Store state needs the browser (WebGL probe, saved preferences): decided after mount, which keeps server rendering safe.
    const [booted, setBooted] = useState(false);
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const opened = useApp((s) => s.opened);
    const status = useApp((s) => s.sceneStatus);
    const sceneOn = booted && isSceneActive(status);

    useGlobalInputs();
    useScrollScene(booted && opened);

    useEffect(() => {
        resetApp();
        setBooted(true);
        const removeFont = installFont();
        const html = document.documentElement;
        html.classList.add('wt15-html');
        // The invitation always starts at the cover; the hash (if any) is honoured after opening.
        const restoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        return () => {
            killOpening();
            removeFont();
            html.classList.remove('wt15-html', 'wt15-locked', 'wt15-2d', 'wt15-modal');
            history.scrollRestoration = restoration;
            resetApp();
        };
    }, []);

    useEffect(() => {
        if (!wedding.sections.music) return;
        const player = new MusicPlayer(wedding.music.src, wedding.music.loop);
        setMusic(player);
        return () => {
            player.dispose();
            setMusic(null);
        };
    }, [wedding.sections.music, wedding.music.src, wedding.music.loop]);

    useEffect(() => {
        if (!booted) return;
        document.documentElement.classList.toggle('wt15-locked', !opened);
        document.documentElement.classList.toggle('wt15-2d', !sceneOn);
    }, [booted, opened, sceneOn]);

    // Cover switched off in the invitation settings: the envelope opens by itself (music waits for the guest's tap).
    useEffect(() => {
        if (booted && !wedding.sections.cover) playOpening(null);
    }, [booted, wedding.sections.cover]);

    return (
        <ThemeProvider value={theme}>
            <div ref={setRoot} className="wt15">
                {!booted ? (
                    <div className="wt15-scene-placeholder" aria-hidden="true" />
                ) : (
                    <>
                        {sceneOn && root ? (
                            <ChunkBoundary onError={() => setApp({ sceneStatus: 'failed' })}>
                                <Suspense fallback={<div className="wt15-scene-placeholder" aria-hidden="true" />}>
                                    <SceneCanvas eventSource={root} />
                                </Suspense>
                            </ChunkBoundary>
                        ) : (
                            <FallbackBackdrop />
                        )}
                        <div className="wt15-scene-veil" aria-hidden="true" />

                        <a className="wt15-skip-link" href="#wt15-main">
                            Lewati ke isi undangan
                        </a>
                        {opened && <TopBar />}
                        {opened && <Nav />}

                        <main id="wt15-main" inert={!opened}>
                            {scenes.map(({ id }) => {
                                const Section = SECTIONS[id];
                                return <Section key={id} />;
                            })}
                        </main>

                        {!opened && wedding.sections.cover && <Cover />}
                        <Lightbox />
                        <Toast />
                    </>
                )}
            </div>
        </ThemeProvider>
    );
}
