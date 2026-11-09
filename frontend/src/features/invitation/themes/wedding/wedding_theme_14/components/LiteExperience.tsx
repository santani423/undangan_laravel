import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Box, Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '../lib/context';
import { useReducedMotion } from '../lib/hooks';
import { setUi } from '../lib/journey';
import { SCENES } from '../lib/scenes';
import type { SceneId } from '../lib/types';
import { ClosingMessage } from './ClosingMessage';
import { Countdown } from './Countdown';
import { CoupleProfile } from './CoupleProfile';
import { CoverContent } from './Cover';
import { EventDetails } from './EventDetails';
import { Gallery } from './Gallery';
import { GiftDetails } from './GiftDetails';
import { LoveStory } from './LoveStory';
import { MusicToggle } from './MusicToggle';
import { RsvpGuestbook } from './RsvpGuestbook';
import { SceneNav } from './SceneNav';

gsap.registerPlugin(ScrollToPlugin);

/** Section that fades/rises in once when it enters the viewport (instant with reduced motion). */
function Reveal({ id, tone, children }: { id: SceneId; tone: 'ivory' | 'dark'; children: ReactNode }) {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    const [shown, setShown] = useState(reduced);
    useEffect(() => {
        const el = ref.current;
        if (reduced || !el || !('IntersectionObserver' in window)) {
            setShown(true);
            return;
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [reduced]);
    return (
        <section ref={ref} id={`wt14-bagian-${id}`} data-scene={id} className={`wt14-lite-section wt14-tone-${tone}`}>
            <div className="wt14-lite-overlay" aria-hidden="true" />
            <div className={`wt14-panel wt14-lite-panel ${shown ? 'wt14-revealed' : ''}`}>{children}</div>
        </section>
    );
}

const SECTIONS: { id: SceneId; render: (restart: () => void) => ReactNode }[] = [
    { id: 'pendopo', render: () => <CoupleProfile /> },
    { id: 'garden', render: () => <Countdown /> },
    { id: 'ceremony', render: () => <EventDetails /> },
    { id: 'gallery', render: () => <Gallery /> },
    { id: 'story', render: () => <LoveStory /> },
    { id: 'rsvp', render: () => <RsvpGuestbook /> },
    { id: 'gift', render: () => <GiftDetails /> },
    { id: 'closing', render: (restart) => <ClosingMessage onRestart={restart} /> },
];

/**
 * Lightweight invitation (WebGL unavailable, user choice, or a 3D failure).
 * Same features and content, standard document flow, simple section transitions.
 */
export function LiteExperience({ notice, canUse3D, onUse3D }: { notice: string | null; canUse3D: boolean; onUse3D: () => void }) {
    const { wedding: w, audio, scenes } = useTheme();
    const [opened, setOpened] = useState(!w.sections.cover);
    const reduced = useReducedMotion();
    const jumpTween = useRef<gsap.core.Tween | null>(null);
    const jumping = useRef(false);
    const shown = new Set(scenes.map((s) => s.id));

    useEffect(() => {
        document.documentElement.classList.remove('wt14-locked');
        return () => void jumpTween.current?.kill();
    }, []);

    // keep the nav's current-scene highlight in sync
    useEffect(() => {
        if (!opened || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting && !jumping.current) {
                        const idx = SCENES.findIndex((s) => s.id === (e.target as HTMLElement).dataset.scene);
                        if (idx >= 0) setUi({ sceneIndex: idx });
                    }
                }
            },
            { rootMargin: '-45% 0px -45% 0px' },
        );
        document.querySelectorAll('.wt14-lite [data-scene]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [opened]);

    const open = () => {
        if (w.audio.autoplay) void audio?.play(); // user gesture → autoplay-safe
        setOpened(true);
        requestAnimationFrame(() =>
            document.querySelector('.wt14-lite main [data-scene]')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }),
        );
    };
    const jump = useCallback(
        (i: number) => {
            const id = SCENES[i].id;
            const el = id === 'gate' ? null : document.getElementById(`wt14-bagian-${id}`);
            const y = el ? el.getBoundingClientRect().top + window.scrollY : 0;
            jumpTween.current?.kill();
            if (reduced) {
                window.scrollTo({ top: y, behavior: 'instant' });
                return;
            }
            // eased glide whose length grows gently with distance, so far jumps don't whip past
            const screens = Math.abs(y - window.scrollY) / window.innerHeight;
            const done = () => {
                jumping.current = false;
                jumpTween.current = null;
            };
            jumping.current = true;
            setUi({ sceneIndex: i });
            jumpTween.current = gsap.to(window, {
                scrollTo: { y, autoKill: true, onAutoKill: done },
                duration: Math.min(0.7 + Math.sqrt(screens) * 0.35, 1.8),
                ease: 'power3.inOut',
                onComplete: done,
            });
        },
        [reduced],
    );
    const restart = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

    const sections = SECTIONS.filter((s) => shown.has(s.id));

    return (
        <div className={`wt14-lite ${opened ? 'wt14-lite-open' : ''}`}>
            <header data-scene="gate" className="wt14-lite-cover wt14-tone-dark">
                <div className="wt14-lite-cover-overlay" aria-hidden="true" />
                <div className="wt14-lite-cover-inner">
                    <CoverContent onOpen={open} />
                    {notice && (
                        <p className="wt14-lite-notice">
                            <Info size={14} aria-hidden="true" /> {notice}
                        </p>
                    )}
                </div>
            </header>

            {opened && (
                <main>
                    {sections.map((s, i) => (
                        <Reveal key={s.id} id={s.id} tone={i % 2 === 0 ? 'ivory' : 'dark'}>
                            {s.render(restart)}
                        </Reveal>
                    ))}
                    {canUse3D && (
                        <div className="wt14-lite-3d">
                            <button type="button" onClick={onUse3D}>
                                <Box size={15} aria-hidden="true" /> Buka versi 3D sinematik
                            </button>
                        </div>
                    )}
                </main>
            )}

            {opened && <SceneNav onJump={jump} onLite={canUse3D ? onUse3D : undefined} liteLabel="Buka versi 3D sinematik" />}
            <MusicToggle />
        </div>
    );
}
