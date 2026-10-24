import { forwardRef, type MouseEvent } from 'react';
import { Countdown } from '../components/Countdown';
import { SceneSection } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { formatEventDay, formatTimeRange } from '../lib/date';
import { SECTION_BY_KEY } from '../lib/sections';

/** 1 · Welcome — toothbrush gate, 3D title and Dr. Senyum waving. The page's cover. */
export const HeroSection = forwardRef<HTMLButtonElement, { onStart: () => void }>(function HeroSection({ onStart }, startRef) {
    const { config, goTo, nextAfter } = useSmile();
    const { child, guest, event, features } = config;
    const def = SECTION_BY_KEY.hero;
    const next = SECTION_BY_KEY[nextAfter('hero')];
    const day = formatEventDay(event);
    const time = formatTimeRange(event);

    const onCue = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        goTo(next.key);
    };

    return (
        <SceneSection
            def={def}
            art={smileAssets.mascot}
            artSize={[320, 320]}
            className="bt11-scene--hero"
            panelClassName="bt11-hero"
            reveal={false}
            after={
                <a className="bt11-scroll-cue" href={`#${next.id}`} onClick={onCue}>
                    <span className="bt11-scroll-cue__icon" aria-hidden="true" />
                    <span>Gulir untuk menjelajah</span>
                </a>
            }
        >
            <h1 id={`${def.id}-heading`} className="bt11-hero__site">
                {config.copy.siteTitle}
            </h1>
            <p className="bt11-hero__guest" data-hero-item="">
                <span>{guest.label}</span> <strong>{guest.name}</strong>
            </p>
            <p className="bt11-hero__invite" data-hero-item="">
                {config.copy.heroInvite}
                {config.showDemoNotices && <span className="bt11-demo-pill">contoh</span>}
            </p>
            <p className="bt11-hero__name" data-hero-item="">
                <span className="bt11-hero__child">{child.name}</span>
                <span className="bt11-hero__turning">
                    {child.age ? (
                        <>
                            genap <span className="bt11-hero__age">{child.age}</span> tahun
                        </>
                    ) : (
                        'berulang tahun'
                    )}
                </span>
            </p>
            {(day || time) && (
                <p className="bt11-hero__when" data-hero-item="">
                    {day && <span>{day}</span>}
                    {day && time && <br />}
                    {time && <span className="bt11-hero__time">{time}</span>}
                </p>
            )}
            {features.countdown && config.range && (
                <div className="bt11-hero__countdown" data-hero-item="">
                    <Countdown range={config.range} />
                </div>
            )}
            <div className="bt11-hero__actions" data-hero-item="">
                <button ref={startRef} className="bt11-btn bt11-btn--primary bt11-btn--big" type="button" onClick={onStart}>
                    Mulai petualangan
                </button>
            </div>
        </SceneSection>
    );
});
