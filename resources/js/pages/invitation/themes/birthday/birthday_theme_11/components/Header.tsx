import { useEffect, useRef, useSyncExternalStore, type MouseEvent, type RefObject } from 'react';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import type { SectionKey } from '../lib/types';
import { MusicIcon, SoundIcon } from './Icons';

interface HeaderProps {
    activeIndex: number;
    progressRef: RefObject<HTMLSpanElement | null>;
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
}

/**
 * Header navigation: a section trail on wide screens and a menu sheet on small ones, the
 * music / sound-effect toggles and the scroll progress bar. Links are real anchors (#rsvp)
 * enhanced with smooth scrolling.
 */
export function Header({ activeIndex, progressRef, menuOpen, setMenuOpen }: HeaderProps) {
    const { config, sections, audio, goTo, toast } = useSmile();
    const sound = useSyncExternalStore(audio.subscribe, audio.getState, audio.getState);
    const menuRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const follow = (key: SectionKey) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        goTo(key);
    };

    // Open: animate in on the next frame and focus the current step. Close: Esc (focus back
    // to the menu button), an outside tap, or a link (focus moves to that section's heading).
    useEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        if (!menuOpen) {
            menu.classList.remove('is-open');
            return;
        }
        const frame = requestAnimationFrame(() => menu.classList.add('is-open'));
        (menu.querySelector<HTMLElement>('a[aria-current="step"]') ?? menu.querySelector<HTMLElement>('a'))?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setMenuOpen(false);
            buttonRef.current?.focus();
        };
        const onPointer = (e: PointerEvent) => {
            const target = e.target as Node;
            if (!menu.contains(target) && !buttonRef.current?.contains(target)) setMenuOpen(false);
        };
        menu.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointer);
        return () => {
            cancelAnimationFrame(frame);
            menu.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onPointer);
        };
    }, [menuOpen, setMenuOpen]);

    const toggleMusic = async () => {
        const wasOn = sound.music;
        const playing = await audio.toggleMusic();
        if (!wasOn && !playing) toast('Browser memblokir musik. Ketuk tombol musik sekali lagi untuk memulainya.');
    };

    const showSound = sound.supported;
    const steps = sections.map((s, i) => ({ ...s, current: i === activeIndex }));

    return (
        <>
            <header className="bt11-site-header">
                <a className="bt11-brand" href={`#${sections[0].id}`} onClick={follow('hero')}>
                    <img src={smileAssets.toothFriend} alt="" width={34} height={34} />
                    <span className="bt11-brand__text">Pesta {config.child.name}</span>
                </a>
                <nav className="bt11-trail" aria-label="Bagian petualangan">
                    <ol>
                        {steps.map((s) => (
                            <li key={s.key}>
                                <a href={`#${s.id}`} aria-current={s.current ? 'step' : undefined} onClick={follow(s.key)}>
                                    <span className="bt11-trail__dot" aria-hidden="true" />
                                    <span className="bt11-trail__label">{s.nav}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="bt11-header-actions">
                    {showSound && config.features.music && (
                        <button
                            className="bt11-icon-btn"
                            type="button"
                            aria-pressed={sound.music}
                            title={sound.music ? 'Jeda musik' : 'Putar musik'}
                            onClick={toggleMusic}
                        >
                            <MusicIcon />
                            <span className="bt11-visually-hidden">Musik</span>
                        </button>
                    )}
                    {showSound && (
                        <button
                            className="bt11-icon-btn"
                            type="button"
                            aria-pressed={sound.sfx}
                            title={sound.sfx ? 'Matikan efek suara' : 'Nyalakan efek suara'}
                            onClick={() => audio.toggleSfx()}
                        >
                            <SoundIcon />
                            <span className="bt11-visually-hidden">Efek suara</span>
                        </button>
                    )}
                    <button
                        ref={buttonRef}
                        className="bt11-menu-btn"
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="bt11-menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span className="bt11-menu-btn__icon" aria-hidden="true" />
                        Menu
                    </button>
                </div>
                <div className="bt11-progress" aria-hidden="true">
                    <span ref={progressRef} />
                </div>
            </header>
            <nav ref={menuRef} className="bt11-menu" id="bt11-menu" aria-label="Bagian petualangan" hidden={!menuOpen}>
                <ol>
                    {steps.map((s, i) => (
                        <li key={s.key}>
                            <a href={`#${s.id}`} aria-current={s.current ? 'step' : undefined} onClick={follow(s.key)}>
                                <span className="bt11-menu__step" aria-hidden="true">
                                    {i + 1}
                                </span>
                                {s.nav}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
