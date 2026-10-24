/* =====================================================================
   Birthday Theme 11 — Petualangan Gigi Ceria (undangan ulang tahun anak)
   Undangan 3D yang digerakkan scroll: tamu berjalan melintasi pulau kue
   bersama Dr. Senyum dan para Sahabat Gigi. Setiap gulir memindahkan kamera
   ke perhentian berikutnya — gerbang sikat gigi, amplop undangan, kalender &
   lokasi, taman bermain, galeri polaroid, kue ulang tahun, papan RSVP, dan
   alun-alun penutup dengan kembang api.
   Port dari proyek Vite asli (resources/views/themes/birthdayThemes/birthday_theme_11/source).
   ===================================================================== */
import type { BirthdayInvitation, Greeting } from '@/types/invitation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MusicController } from './audio/MusicController';
import './birthday-theme-11.css';
import { ActivityDialog } from './components/ActivityDialog';
import { GiftDialog } from './components/GiftDialog';
import { Header } from './components/Header';
import { Lightbox } from './components/Lightbox';
import { Loader, type LoaderPhase } from './components/Loader';
import { Toast } from './components/Toast';
import { SmileContext, type SmileValue } from './context/SmileContext';
import { installFonts, waitForFonts } from './lib/browser';
import { buildInvitation } from './lib/data';
import { cx, isSideLayout, nextFrame, prefersReducedMotion, scrollToElement, wait } from './lib/helpers';
import { SECTION_BY_KEY, visibleSections } from './lib/sections';
import type { SectionKey, SmileConfig } from './lib/types';
import type { Experience } from './scene';
import { detectQuality, isWebGLAvailable } from './scene/quality';
import type { World, WorldHandlers } from './scene/WorldBuilder';
import { gsap, ScrollExperience, ScrollTrigger } from './scroll/ScrollExperience';
import { ActivitiesSection } from './sections/ActivitiesSection';
import { CakeSection, type CakeHandle } from './sections/CakeSection';
import { DetailsSection } from './sections/DetailsSection';
import { FinaleSection } from './sections/FinaleSection';
import { GallerySection } from './sections/GallerySection';
import { HeroSection } from './sections/HeroSection';
import { InvitationSection } from './sections/InvitationSection';
import { RsvpSection, type RsvpHandle } from './sections/RsvpSection';
import { createRsvpService } from './services/rsvpService';

type Mode = 'loading' | '3d' | '2d';

/** The invitation after mount: 3D world (or its illustrated fallback), header, eight sections and dialogs. */
function SmileExperience({ config }: { config: SmileConfig }) {
    const [reducedMotion] = useState(prefersReducedMotion);
    const sections = useMemo(() => visibleSections(config), [config]);
    const rsvpService = useMemo(() => createRsvpService(config), [config]);
    const [audio] = useState(
        () => new MusicController({ src: config.features.music ? config.music.src : null, loop: config.music.loop, volume: config.music.volume }),
    );

    const rootRef = useRef<HTMLDivElement>(null);
    const worldRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);
    const startRef = useRef<HTMLButtonElement>(null);
    const cakeRef = useRef<CakeHandle>(null);
    const rsvpRef = useRef<RsvpHandle>(null);
    const experienceRef = useRef<Experience | null>(null);
    /** The world while it is actually on screen (null while loading, without WebGL, or after a lost context). */
    const liveWorld = useRef<World | null>(null);
    const scrollRef = useRef<ScrollExperience | null>(null);

    const [mode, setMode] = useState<Mode>('loading');
    const [title3d, setTitle3d] = useState(false);
    const [loader, setLoader] = useState<{ progress: number; message: string; phase: LoaderPhase }>({
        progress: 0,
        message: 'Menyikat undangan…',
        phase: 'loading',
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activityIndex, setActivityIndex] = useState<number | null>(null);
    const [photoIndex, setPhotoIndex] = useState<number | null>(null);
    const [giftOpen, setGiftOpen] = useState(false);
    const [toastState, setToastState] = useState({ message: '', visible: false });
    const [wipe, setWipe] = useState(false);
    const toastTimer = useRef(0);

    const toast = useCallback((message: string) => {
        window.clearTimeout(toastTimer.current);
        setToastState({ message, visible: true });
        toastTimer.current = window.setTimeout(() => setToastState((s) => ({ ...s, visible: false })), 3800);
    }, []);

    const goTo = useCallback(
        (key: SectionKey) => {
            const def = SECTION_BY_KEY[key];
            const el = document.getElementById(def.id);
            if (!el) return; // switched off for this invitation
            setMenuOpen(false);
            scrollToElement(el);
            audio.play('pop', { volume: 0.6 });
            // Move keyboard focus to the section heading without jumping the scroll position.
            const heading = el.querySelector<HTMLElement>('h1, h2');
            if (heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
            // Keep Inertia's history state; only the hash changes.
            window.history.replaceState(window.history.state, '', `#${def.id}`);
        },
        [audio],
    );

    const nextAfter = useCallback(
        (key: SectionKey): SectionKey => {
            const i = sections.findIndex((s) => s.key === key);
            return sections[Math.min(sections.length - 1, i + 1)]?.key ?? key;
        },
        [sections],
    );

    const getWorld = useCallback(() => liveWorld.current, []);

    const openActivity = useCallback(
        (index: number) => {
            const activity = config.activities[index];
            if (!activity) return;
            setActivityIndex(index);
            audio.play('pop');
            liveWorld.current?.highlightActivity(activity.id);
        },
        [audio, config.activities],
    );

    const openPhoto = useCallback(
        (index: number) => {
            setPhotoIndex(index);
            audio.play('pop', { volume: 0.5 });
        },
        [audio],
    );

    // The 3D world calls back through this ref, so it always reaches the latest handlers.
    const handlersRef = useRef<WorldHandlers | null>(null);
    handlersRef.current = {
        sound: (name, options) => audio.play(name, options),
        onSection: goTo,
        onActivity: (id) => openActivity(config.activities.findIndex((a) => a.id === id)),
        onPhoto: openPhoto,
        onCake: () => cakeRef.current?.tap(),
        onMailbox: () => {
            goTo('rsvp');
            window.setTimeout(() => rsvpRef.current?.focusForm(), 600);
        },
    };

    const heroItems = useCallback(() => rootRef.current?.querySelectorAll('[data-hero-item]') ?? [], []);

    /** Camera fly-in, the 3D title dropping in letter by letter, then the hero text. */
    const playIntro = useCallback(
        (onComplete?: () => void) => {
            const experience = liveWorld.current ? experienceRef.current : null;
            if (experience && !reducedMotion) {
                experience.cameraController.intro.amount = 1;
                gsap.to(experience.cameraController.intro, { amount: 0, duration: 3.4, ease: 'power3.inOut', overwrite: true });
            }
            experience?.world.playIntro();
            const items = heroItems();
            if (reducedMotion) {
                gsap.set(items, { autoAlpha: 1 });
                onComplete?.();
            } else {
                gsap.fromTo(
                    items,
                    { autoAlpha: 0, y: 26 },
                    { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'back.out(1.6)', delay: experience ? 1.2 : 0.2, onComplete },
                );
            }
        },
        [heroItems, reducedMotion],
    );

    const replay = async () => {
        setWipe(true);
        audio.play('whoosh');
        await wait(reducedMotion ? 0 : 480);
        cakeRef.current?.reset();
        liveWorld.current?.resetForReplay();
        window.scrollTo({ top: 0, behavior: 'auto' });
        ScrollTrigger.update();
        experienceRef.current?.cameraController.snap();
        await nextFrame();
        await nextFrame();
        setWipe(false);
        // Focus the start button once it's visible again (hidden elements can't take focus).
        playIntro(() => startRef.current?.focus({ preventScroll: true }));
    };

    const onStart = () => {
        audio.play('pop');
        // Music may only start from this explicit tap (browser autoplay policy).
        if (config.features.music && config.music.autoplay && audio.musicAllowedByPreference) void audio.playMusic();
        goTo(nextAfter('hero'));
    };

    // Boot: fonts → 3D world (lazy chunk) → scroll story → loader out → intro.
    useEffect(() => {
        let cancelled = false;
        let experience: Experience | null = null;
        let scroll: ScrollExperience | null = null;
        const root = rootRef.current!;
        const container = worldRef.current!;
        const setProgress = (value: number, message?: string) =>
            setLoader((l) => ({ ...l, progress: Math.max(l.progress, Math.min(1, value)), message: message ?? l.message }));
        const finishLoader = () =>
            new Promise<void>((resolve) => {
                setLoader((l) => ({ ...l, progress: 1, message: 'Siap!', phase: 'fading' }));
                window.setTimeout(
                    () => {
                        setLoader((l) => ({ ...l, phase: 'done' }));
                        resolve();
                    },
                    reducedMotion ? 0 : 700,
                );
            });
        const fallback = (reason: string) => {
            liveWorld.current = null;
            setMode('2d');
            setTitle3d(false);
            console.info(`[bt11] Showing the illustrated (non-3D) version: ${reason}`);
        };
        const handlers: WorldHandlers = {
            sound: (name, options) => handlersRef.current?.sound(name, options),
            onSection: (key) => handlersRef.current?.onSection(key),
            onActivity: (id) => handlersRef.current?.onActivity(id),
            onPhoto: (index) => handlersRef.current?.onPhoto(index),
            onCake: () => handlersRef.current?.onCake(),
            onMailbox: () => handlersRef.current?.onMailbox(),
        };

        const start3D = async () => {
            if (!isWebGLAvailable()) return fallback('WebGL is not available in this browser.');
            try {
                setProgress(0.2, 'Memuat dunia 3D');
                const { createExperience } = await import('./scene');
                if (cancelled) return;
                const created = await createExperience({
                    container,
                    config,
                    quality: detectQuality(),
                    reducedMotion,
                    handlers,
                    onProgress: (p, message) => setProgress(0.25 + p * 0.72, message),
                    onContextLost: () => {
                        fallback('the WebGL context was lost.');
                        toast('Tampilan 3D berhenti, tetapi seluruh undangan tetap berfungsi.');
                    },
                    cancelled: () => cancelled,
                });
                if (cancelled) return created.dispose();
                experience = created;
                experienceRef.current = created;
                liveWorld.current = created.world;
                setMode('3d');
                setTitle3d(Boolean(created.world.title));
            } catch (err) {
                if (cancelled) return;
                console.error('[bt11] Could not start the 3D world:', err);
                fallback('the 3D world failed to start.');
            }
        };

        const boot = async () => {
            setProgress(0.05, 'Menyikat undangan…');
            await waitForFonts();
            if (cancelled) return;
            setProgress(0.18, 'Huruf sudah siap');
            await start3D();
            if (cancelled) return;
            await nextFrame(); // let the mode / title classes reach the DOM before measuring
            if (cancelled) return;

            scroll = new ScrollExperience({
                root,
                sections: sections.map((def) => ({ def, el: document.getElementById(def.id)! })),
                world: experience?.world ?? null,
                cameraController: experience?.cameraController ?? null,
                reducedMotion,
                isNarrow: () => !isSideLayout(),
                onProgress: (p) => progressRef.current?.style.setProperty('transform', `scaleX(${p.toFixed(4)})`),
                onSectionChange: (index, previous) => {
                    setActiveIndex(index);
                    if (previous >= 0) audio.play('chime', { volume: 0.35 });
                },
            });
            scroll.init();
            scrollRef.current = scroll;

            // Honour a deep link like #rsvp once layout is ready.
            const hash = decodeURIComponent(window.location.hash.slice(1));
            const deepLink = sections.find((s) => s.id === hash && s.key !== 'hero');
            if (deepLink) {
                document.getElementById(deepLink.id)?.scrollIntoView({ behavior: 'auto' });
                ScrollTrigger.update();
            }
            if (experience) {
                experience.cameraController.snap();
                experience.sceneManager.start();
            }

            await finishLoader();
            if (cancelled) return;
            // The loader's scroll lock is gone, so a classic scrollbar may have narrowed the page.
            scroll.refresh();
            if (deepLink) gsap.set(heroItems(), { autoAlpha: 1 });
            else playIntro();

            if (import.meta.env.DEV) {
                // Small debug handle for the console and automated checks.
                (window as unknown as { __smile?: unknown }).__smile = { config, sections, audio, experience, scroll };
            }
        };

        boot().catch((err) => {
            if (cancelled) return;
            console.error(err);
            fallback('startup error');
            void finishLoader();
            gsap.set(heroItems(), { autoAlpha: 1 });
        });

        return () => {
            cancelled = true;
            scroll?.destroy();
            scrollRef.current = null;
            if (experience) gsap.killTweensOf(experience.cameraController.intro);
            experience?.dispose();
            experienceRef.current = null;
            liveWorld.current = null;
            gsap.killTweensOf(root.querySelectorAll('[data-hero-item]'));
            audio.dispose();
            window.clearTimeout(toastTimer.current);
            delete (window as unknown as { __smile?: unknown }).__smile;
        };
        // Runs once per invitation; later config changes only re-render the HTML.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The page stays put while the loading screen is up.
    useEffect(() => {
        if (loader.phase !== 'loading') return;
        const html = document.documentElement;
        const previous = html.style.overflow;
        html.style.overflow = 'hidden';
        return () => {
            html.style.overflow = previous;
        };
    }, [loader.phase]);

    // Content that changes height (RSVP answer, more wishes…) re-measures the scroll story.
    useEffect(() => {
        const main = mainRef.current;
        if (!main) return;
        let timer = 0;
        let height = main.offsetHeight;
        const observer = new ResizeObserver(() => {
            if (main.offsetHeight === height) return;
            height = main.offsetHeight;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => scrollRef.current?.refresh(), 150);
        });
        observer.observe(main);
        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
        };
    }, []);

    const value = useMemo<SmileValue>(
        () => ({ config, sections, audio, rsvpService, reducedMotion, goTo, getWorld, toast, nextAfter }),
        [config, sections, audio, rsvpService, reducedMotion, goTo, getWorld, toast, nextAfter],
    );
    const shown = new Set(sections.map((s) => s.key));
    const skipTarget = SECTION_BY_KEY[shown.has('details') ? 'details' : nextAfter('hero')];

    return (
        <SmileContext.Provider value={value}>
            <div ref={rootRef} className={cx('bt11', `is-${mode}`, title3d && 'has-3d-title', !reducedMotion && 'is-intro')}>
                <a
                    className="bt11-skip-link"
                    href={`#${skipTarget.id}`}
                    onClick={(e) => {
                        e.preventDefault();
                        goTo(skipTarget.key);
                    }}
                >
                    Langsung ke {skipTarget.key === 'details' ? 'detail pesta' : skipTarget.nav.toLowerCase()}
                </a>

                <Loader title={config.copy.siteTitle} progress={loader.progress} message={loader.message} phase={loader.phase} />

                {/* 3D world (a decorative mirror of the content below; every action also has an HTML control). */}
                <div ref={worldRef} className="bt11-world" aria-hidden="true" />
                <div className="bt11-world-fallback" aria-hidden="true" />

                <Header activeIndex={activeIndex} progressRef={progressRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

                <main ref={mainRef} className="bt11-main">
                    <HeroSection ref={startRef} onStart={onStart} />
                    {shown.has('invitation') && <InvitationSection />}
                    {shown.has('details') && <DetailsSection />}
                    <ActivitiesSection onOpen={(id) => openActivity(config.activities.findIndex((a) => a.id === id))} />
                    {shown.has('gallery') && <GallerySection onOpen={openPhoto} />}
                    <CakeSection ref={cakeRef} />
                    {shown.has('rsvp') && <RsvpSection ref={rsvpRef} onOpenGift={() => setGiftOpen(true)} />}
                    <FinaleSection onReplay={() => void replay()} />
                </main>

                {config.features.footer && (
                    <footer className="bt11-site-footer">
                        <p>
                            Dibuat dengan penuh senyum untuk {config.child.name}.
                            {config.features.music &&
                                (config.music.src
                                    ? ' Musik latar dari tuan rumah.'
                                    : ' Musik: “Happy Birthday to You” (domain publik), dimainkan langsung oleh browsermu.')}
                        </p>
                    </footer>
                )}

                <ActivityDialog index={activityIndex} onChange={openActivity} onClose={() => setActivityIndex(null)} />
                {config.gallery.length > 0 && <Lightbox index={photoIndex} onChange={setPhotoIndex} onClose={() => setPhotoIndex(null)} />}
                {config.features.gift && <GiftDialog open={giftOpen} onClose={() => setGiftOpen(false)} />}

                <Toast message={toastState.message} visible={toastState.visible} />
                <div className={cx('bt11-wipe', wipe && 'is-active')} aria-hidden="true" />
            </div>
        </SmileContext.Provider>
    );
}

interface BirthdayTheme11Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

export default function BirthdayTheme11({ invitation, visitor, greeting }: BirthdayTheme11Props) {
    const config = useMemo(() => buildInvitation(invitation, visitor, greeting), [invitation, visitor, greeting]);
    // Browser-only state (WebGL probe, audio, storage, scroll) is decided after mount.
    const [booted, setBooted] = useState(false);

    useEffect(() => {
        const removeFonts = installFonts();
        const html = document.documentElement;
        html.classList.add('bt11-html');
        const restoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        setBooted(true);
        return () => {
            removeFonts();
            html.classList.remove('bt11-html');
            window.history.scrollRestoration = restoration;
        };
    }, []);

    return booted ? <SmileExperience key={config.meta.slug} config={config} /> : <div className="bt11 bt11-boot" aria-hidden="true" />;
}
