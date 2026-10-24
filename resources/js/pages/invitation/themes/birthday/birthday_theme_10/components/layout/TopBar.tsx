import { House, Mail, Star } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { music, unlockAudio } from '../../audio/audioEngine';
import { useInvitation } from '../../context/InvitationContext';
import { scrollToStop } from '../../hooks/useScrollCamera';
import { toyAssets } from '../../lib/assets';
import { cx } from '../../lib/cx';
import { CAMERA_STOPS, SECTIONS } from '../../lib/journey';
import type { SectionId } from '../../lib/types';
import { setExperience, useExperience } from '../../store/experience';
import { journey } from '../../store/journey';
import { PackIcon } from '../ui/PackIcon';

const SECTION_ICONS: Record<SectionId, ReactNode> = {
    beranda: <House size={18} aria-hidden="true" />,
    profil: <Star size={18} aria-hidden="true" />,
    acara: <PackIcon name="calendar" size={18} />,
    galeri: <PackIcon name="camera" size={18} />,
    rsvp: <Mail size={18} aria-hidden="true" />,
};

function MusicToggle() {
    const { config } = useInvitation();
    const soundOn = useExperience((s) => s.soundOn);
    if (!config.features.music || !music.hasSource) return <span />;
    return (
        <button
            type="button"
            className="bt10-icon-btn bt10-music"
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Matikan musik' : 'Putar musik'}
            title={config.music.title}
            onClick={() => {
                unlockAudio();
                setExperience({ soundOn: !soundOn });
            }}
        >
            <PackIcon name="music" size={20} className={soundOn ? 'bt10-text-coral-deep' : 'bt10-text-ink-60'} />
            <span className="bt10-music__badge">
                <PackIcon name={soundOn ? 'pause' : 'play'} size={12} />
            </span>
        </button>
    );
}

function SiteNav({ reducedMotion }: { reducedMotion: boolean }) {
    const { sections, config } = useInvitation();
    const active = useExperience((s) => s.activeSection);
    // Without the RSVP form the plaza stop is the wishes wall, or straight the gift.
    const plazaLabel = config.features.rsvp ? 'RSVP' : config.features.wishes ? 'Ucapan' : 'Kado';
    return (
        <nav aria-label="Navigasi undangan" className="bt10-nav">
            <ul className="bt10-nav__list">
                {SECTIONS.filter((s) => sections.has(s.id)).map((s) => {
                    const isActive = s.id === active;
                    return (
                        <li key={s.id}>
                            <button
                                type="button"
                                onClick={() => scrollToStop(s.stop, reducedMotion)}
                                aria-current={isActive ? 'step' : undefined}
                                aria-label={s.id === 'rsvp' ? plazaLabel : s.label}
                                className={cx('bt10-nav__btn', isActive && 'is-active')}
                            >
                                {SECTION_ICONS[s.id]}
                                <span className="bt10-nav__label">{s.id === 'rsvp' ? plazaLabel : s.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/** Thin road at the very top with the pack's toy car driving along with the camera. */
function JourneyProgress() {
    const barRef = useRef<HTMLDivElement>(null);
    const carRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let frame = 0;
        const last = CAMERA_STOPS.length - 1;
        const loop = () => {
            const p = Math.min(1, Math.max(0, journey.value / last));
            if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
            if (carRef.current) carRef.current.style.left = `calc(${p * 100}% - ${p * 28}px)`;
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div aria-hidden="true" className="bt10-progress-road">
            <div ref={barRef} className="bt10-progress-road__bar" style={{ transform: 'scaleX(0)' }} />
            <img ref={carRef} src={toyAssets.illustrations.car} alt="" className="bt10-progress-road__car" style={{ left: 0 }} />
        </div>
    );
}

export function TopBar({ reducedMotion }: { reducedMotion: boolean }) {
    return (
        <header className="bt10-topbar bt10-hide-typing">
            <JourneyProgress />
            <div className="bt10-topbar__row">
                <MusicToggle />
                <SiteNav reducedMotion={reducedMotion} />
            </div>
        </header>
    );
}
