import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronsDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '../lib/context';
import { MAX_WORLD_PHOTOS } from '../lib/data';
import { useIsMobile, useReducedMotion } from '../lib/hooks';
import { journey, setUi, useUi } from '../lib/journey';
import { detectQuality } from '../lib/quality';
import { JOURNEY_SCREENS, PANEL_FADE, sceneIndexAt, SCENES, STORY_REVEAL_START, STORY_REVEAL_STEP } from '../lib/scenes';
import type { SceneId } from '../lib/types';
import { loadWorldAssets, type LoadedAssets } from '../three/assetLoader';
import { buildTextureLibrary, disposeLibrary, type TextureLibrary } from '../three/textures/library';
import { WorldCanvas } from '../three/WorldCanvas';
import { ClosingMessage } from './ClosingMessage';
import { Countdown } from './Countdown';
import { CoupleProfile } from './CoupleProfile';
import { CoverContent } from './Cover';
import { EventDetails } from './EventDetails';
import { Gallery } from './Gallery';
import { GiftDetails } from './GiftDetails';
import { LoadingScreen } from './LoadingScreen';
import { LoveStory } from './LoveStory';
import { MusicToggle } from './MusicToggle';
import { RsvpGuestbook } from './RsvpGuestbook';
import { ProgressRail, SceneNav } from './SceneNav';
import { ScenePanel } from './ScenePanel';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/** Nav jumps up to this much progress glide through the world; longer ones cross-fade through a veil. */
const GLIDE_MAX = 0.3;
/** Story milestones must all be revealed before the story panel starts fading out. */
const STORY_REVEAL_END = 0.7;

const sceneById = Object.fromEntries(SCENES.map((s) => [s.id, s])) as Record<SceneId, (typeof SCENES)[number]>;

const PANELS: { id: SceneId; label: string; render: (restart: () => void) => ReactNode }[] = [
    { id: 'pendopo', label: 'Profil mempelai', render: () => <CoupleProfile /> },
    { id: 'garden', label: 'Hitung mundur', render: () => <Countdown /> },
    { id: 'ceremony', label: 'Detail acara', render: () => <EventDetails /> },
    { id: 'gallery', label: 'Galeri foto', render: () => <Gallery /> },
    { id: 'story', label: 'Kisah kasih', render: () => <LoveStory /> },
    { id: 'rsvp', label: 'RSVP dan buku tamu', render: () => <RsvpGuestbook /> },
    { id: 'gift', label: 'Tanda kasih', render: () => <GiftDetails /> },
    { id: 'closing', label: 'Penutup', render: (restart) => <ClosingMessage onRestart={restart} /> },
];

/**
 * The scroll-driven 3D invitation. Native page scroll → one GSAP ScrollTrigger timeline (scrubbed)
 * → journey.progress (camera, light, objects) + panel visibility. Everything is a pure function of
 * scroll position, so scrolling backwards replays the journey in reverse with no stale state.
 */
export default function CinematicExperience({ onFallback }: { onFallback: (reason: string) => void }) {
    const { wedding: w, audio, scenes } = useTheme();
    const isMobile = useIsMobile();
    const reduced = useReducedMotion();
    const quality = useMemo(() => detectQuality(), []);
    const capture = useMemo(() => new URLSearchParams(window.location.search).has('capture'), []);
    const opened = useUi((s) => s.opened);
    const shown = useMemo(() => new Set(scenes.map((s) => s.id)), [scenes]);
    const worldPhotos = useMemo(() => w.gallery.slice(0, MAX_WORLD_PHOTOS), [w.gallery]);

    const [world, setWorld] = useState<{ assets: LoadedAssets; lib: TextureLibrary } | null>(null);
    const [loadPct, setLoadPct] = useState(0);
    const [stage, setStage] = useState<'files' | 'textures'>('files');
    const [worldReady, setWorldReady] = useState(false);

    const root = useRef<HTMLDivElement>(null);
    const spacer = useRef<HTMLDivElement>(null);
    const cover = useRef<HTMLDivElement>(null);
    const fade = useRef<HTMLDivElement>(null);
    const railFill = useRef<HTMLDivElement>(null);
    const veil = useRef<HTMLDivElement>(null);
    const st = useRef<ScrollTrigger | null>(null);
    /** In-flight nav jump (scroll glide or veil timeline) and the wait for the scrub to catch up. */
    const jumpAnim = useRef<gsap.core.Animation | null>(null);
    const jumpSettle = useRef<gsap.core.Tween | null>(null);
    const jumping = useRef(false);
    const [veilScene, setVeilScene] = useState(0);

    useEffect(() => {
        journey.reducedMotion = reduced;
    }, [reduced]);

    useEffect(() => {
        journey.hiddenPanels = new Set(SCENES.filter((s) => !shown.has(s.id)).map((s) => s.id));
    }, [shown]);

    useEffect(() => {
        if (capture) gsap.ticker.lagSmoothing(0); // `?capture=1`: deterministic timing for automated screenshots
    }, [capture]);

    /* ── assets ── */
    useEffect(() => {
        let alive = true;
        let built: TextureLibrary | null = null;
        (async () => {
            const a = await loadWorldAssets(worldPhotos, (l, t) => alive && setLoadPct((l / t) * 0.45), quality.tier === 'low' ? 512 : 1024);
            if (!alive) return;
            if (a.failures.length) console.warn('[wedding-theme-14] some assets failed to load and use fallbacks:', a.failures);
            setStage('textures');
            // progressive: files first, then procedural PBR sets generated in small yielding steps
            const lib = await buildTextureLibrary(a, quality.tier, (f) => alive && setLoadPct(0.45 + f * 0.45));
            built = lib;
            if (!alive) {
                disposeLibrary(lib);
                return;
            }
            setWorld({ assets: a, lib });
        })().catch(() => alive && onFallback('asset-error'));
        return () => {
            alive = false;
            if (built) disposeLibrary(built);
        };
    }, [quality.tier, onFallback, worldPhotos]);

    /* ── start at the top, locked until the invitation is opened ── */
    useLayoutEffect(() => {
        const prev = 'scrollRestoration' in history ? history.scrollRestoration : null;
        if (prev) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        return () => {
            if (prev) history.scrollRestoration = prev;
        };
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle('wt14-locked', !opened);
        return () => document.documentElement.classList.remove('wt14-locked');
    }, [opened]);

    /* ── scroll length in px (only recomputed when the width changes, so mobile URL bars & keyboards never shift progress) ── */
    useLayoutEffect(() => {
        const el = spacer.current;
        if (!el) return;
        let lastW = window.innerWidth;
        const apply = () => {
            el.style.height = `${Math.round(window.innerHeight * JOURNEY_SCREENS)}px`;
        };
        apply();
        const onResize = () => {
            if (window.innerWidth === lastW) return;
            lastW = window.innerWidth;
            apply();
            ScrollTrigger.refresh();
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── the master scroll timeline ── */
    useLayoutEffect(() => {
        ScrollTrigger.config({ ignoreMobileResize: true });
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: spacer.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: reduced || capture ? true : 1.1,
                    onUpdate: (self) => !jumping.current && setUi({ sceneIndex: sceneIndexAt(self.progress) }),
                },
            });
            tl.to(journey, { progress: 1, duration: 1 }, 0);
            if (railFill.current) tl.fromTo(railFill.current, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

            const dy = reduced ? 0 : 22;
            for (const s of SCENES) {
                const el = root.current?.querySelector(`[data-panel="${s.id}"]`);
                if (!el) continue;
                if (s.panel.in <= 0) gsap.set(el, { autoAlpha: 1, y: 0 });
                else tl.fromTo(el, { autoAlpha: 0, y: dy }, { autoAlpha: 1, y: 0, duration: PANEL_FADE }, s.panel.in);
                if (s.panel.out < 1)
                    tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -dy * 0.6, duration: PANEL_FADE, immediateRender: false }, s.panel.out);
            }
            const milestones = root.current?.querySelectorAll('[data-panel="story"] [data-milestone]') ?? [];
            // long stories reveal faster so the last milestone still appears inside the hold
            const step = Math.min(STORY_REVEAL_STEP, (STORY_REVEAL_END - STORY_REVEAL_START) / Math.max(1, milestones.length));
            milestones.forEach((li, i) => {
                tl.fromTo(
                    li,
                    { autoAlpha: 0, x: reduced ? 0 : -12 },
                    { autoAlpha: 1, x: 0, duration: Math.min(0.008, step) },
                    STORY_REVEAL_START + i * step,
                );
            });
            st.current = tl.scrollTrigger ?? null;
        }, root);
        return () => {
            st.current = null;
            ctx.revert();
        };
    }, [reduced, capture]);

    /* ── pointer parallax input ── */
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            journey.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
            journey.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    useEffect(() => () => void gsap.killTweensOf(journey), []);

    /* ── open / restart / jump ── */
    const openInvitation = useCallback(
        (withMusic: boolean) => {
            if (withMusic && w.audio.autoplay) void audio?.play(); // user gesture → autoplay-safe
            window.scrollTo(0, 0);
            setUi({ opened: true });
            gsap.to(cover.current, { autoAlpha: 0, duration: reduced ? 0.01 : 0.9, ease: 'power2.out' });
            gsap.to(journey, { intro: 0, duration: reduced ? 0.01 : 2.6, ease: 'power2.inOut', overwrite: 'auto' });
            (document.activeElement as HTMLElement | null)?.blur();
        },
        [audio, reduced, w.audio.autoplay],
    );

    // Cover switched off: the journey opens by itself once the world is ready (music waits for the toggle).
    useEffect(() => {
        if (worldReady && !w.sections.cover && !opened) openInvitation(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [worldReady]);

    /** Snap the scrubbed timeline to the scroll position so the camera doesn't fly through the world. */
    const settleScrub = useCallback(() => {
        ScrollTrigger.update();
        const tween = st.current?.getTween?.() as gsap.core.Tween | undefined;
        if (tween && typeof tween.progress === 'function') tween.progress(1);
        else st.current?.animation?.progress(st.current.progress);
    }, []);

    const endJump = useCallback(() => {
        jumpAnim.current?.kill();
        jumpSettle.current?.kill();
        jumpAnim.current = jumpSettle.current = null;
        jumping.current = false;
        root.current?.removeAttribute('data-jumping');
        root.current?.querySelector('[data-jump-target]')?.removeAttribute('data-jump-target');
        if (st.current) setUi({ sceneIndex: sceneIndexAt(st.current.progress) });
    }, []);

    const restart = useCallback(() => {
        endJump();
        gsap.set(veil.current, { autoAlpha: 0 });
        const f = fade.current;
        gsap.timeline()
            .to(f, { autoAlpha: 1, duration: reduced ? 0.01 : 0.6, ease: 'power1.inOut' })
            .add(() => {
                // 'instant' also cancels any smooth scroll still in flight (e.g. from the scene menu)
                window.scrollTo({ top: 0, behavior: 'instant' });
                gsap.killTweensOf(journey, 'intro');
                journey.intro = 1;
                setUi({ opened: false, sceneIndex: 0 });
                gsap.set(cover.current, { autoAlpha: 1 });
                // settle the scrub instantly so the camera doesn't rewind through the whole world
                settleScrub();
            })
            .to(f, { autoAlpha: 0, duration: reduced ? 0.01 : 0.9, delay: 0.2, ease: 'power1.inOut' })
            .add(() => cover.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }));
    }, [reduced, endJump, settleScrub]);

    const jump = useCallback(
        (index: number) => {
            const t = st.current;
            if (!t) return;
            const target = SCENES[index];
            const y = t.start + (t.end - t.start) * target.navAt;
            const dist = Math.abs(target.navAt - t.progress);
            endJump();
            if (dist < 0.002) return;
            jumping.current = true;
            setUi({ sceneIndex: index }); // highlight the destination right away, not every scene flown past

            if (reduced) {
                window.scrollTo({ top: y, behavior: 'instant' });
                settleScrub();
                endJump();
                return;
            }

            // Release only once the scrubbed timeline has caught up, so no in-between panel flashes at the end.
            const finish = () => {
                const check = () => {
                    const s = st.current;
                    if (!s?.animation || Math.abs(s.animation.progress() - s.progress) < 0.002) endJump();
                    else jumpSettle.current = gsap.delayedCall(0.05, check);
                };
                check();
            };

            if (dist <= GLIDE_MAX) {
                // glide: ease the scroll itself; the scrub adds the camera's inertia on top
                gsap.to(veil.current, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' });
                root.current?.setAttribute('data-jumping', '');
                root.current?.querySelector(`[data-panel="${target.id}"]`)?.setAttribute('data-jump-target', '');
                jumpAnim.current = gsap.to(window, {
                    scrollTo: { y, autoKill: true, onAutoKill: finish },
                    duration: Math.min(1.1 + dist * 4.5, 2.4),
                    ease: 'power2.inOut',
                    onComplete: finish,
                });
            } else {
                // far: cross-fade through a veil naming the destination, cut the camera there underneath
                setVeilScene(index);
                jumpAnim.current = gsap
                    .timeline({ onComplete: endJump })
                    .to(veil.current, { autoAlpha: 1, duration: 0.45, ease: 'power2.in' })
                    .fromTo(
                        veil.current?.querySelector('[data-veil-label]') ?? {},
                        { autoAlpha: 0, y: 10 },
                        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                        0.2,
                    )
                    .add(() => {
                        window.scrollTo({ top: y, behavior: 'instant' });
                        settleScrub();
                    })
                    .to(veil.current, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.35');
            }
        },
        [reduced, endJump, settleScrub],
    );

    const loadingLabel = !world
        ? stage === 'files'
            ? 'Memuat aset'
            : 'Menenun tekstur kayu, batu & genteng'
        : !worldReady
          ? 'Membangun pendhapa'
          : 'Siap';
    const progress = !world ? loadPct : worldReady ? 1 : 0.94;
    const { bride, groom } = w.couple;

    return (
        <div ref={root} className="wt14-cinematic">
            {world && (
                <WorldCanvas
                    initialQuality={quality}
                    assets={world.assets}
                    lib={world.lib}
                    isMobile={isMobile}
                    onReady={() => setWorldReady(true)}
                    onFailure={onFallback}
                />
            )}

            {/* cinematic vignette for depth and text contrast */}
            <div className="wt14-vignette" aria-hidden="true" />

            {/* scroll length */}
            <div ref={spacer} aria-hidden="true" style={{ height: `${JOURNEY_SCREENS * 100}vh` }} />

            {/* Scene 1 title card (after opening) */}
            <div className={`wt14-titlecard ${opened ? 'wt14-shown' : ''}`}>
                <div data-panel="gate" style={{ visibility: 'hidden', opacity: 0 }}>
                    <div className="wt14-titlecard-inner">
                        <p className="wt14-titlecard-greeting">{w.couple.openingGreeting}</p>
                        <p className="wt14-titlecard-names">
                            {bride.nickname} <span className="wt14-amp">&amp;</span> {groom.nickname}
                        </p>
                        {w.mainDateLabel && <p className="wt14-titlecard-date">{w.mainDateLabel}</p>}
                        <p className="wt14-titlecard-hint">
                            Gulir untuk memasuki regol
                            <ChevronsDown size={18} className="wt14-scroll-hint" aria-hidden="true" />
                        </p>
                    </div>
                </div>
            </div>

            {PANELS.filter((p) => shown.has(p.id)).map((p) => (
                <ScenePanel key={p.id} id={p.id} side={sceneById[p.id].panel.side} label={p.label}>
                    {p.render(restart)}
                </ScenePanel>
            ))}

            {/* HUD */}
            {opened && <SceneNav onJump={jump} onLite={() => onFallback('user')} />}
            <div className={opened ? '' : 'wt14-invisible'}>
                <ProgressRail fillRef={railFill} onJump={jump} />
            </div>
            <MusicToggle />

            {/* Cover */}
            <div ref={cover} className="wt14-cover-overlay">
                <CoverContent onOpen={() => openInvitation(true)} />
            </div>

            {/* far-jump veil */}
            <div ref={veil} className="wt14-veil" style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true">
                <div data-veil-label>
                    <p className="wt14-veil-jv">{SCENES[veilScene].javanese}</p>
                    <p className="wt14-veil-label">{SCENES[veilScene].label}</p>
                </div>
            </div>

            {/* restart fade */}
            <div ref={fade} className="wt14-fade" style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true" />

            <LoadingScreen progress={progress} label={loadingLabel} hidden={worldReady} />
        </div>
    );
}
