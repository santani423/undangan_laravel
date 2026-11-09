import { useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties, type SVGProps } from 'react';
import { useTheme } from '../lib/context';
import type { SceneId } from '../lib/scenes';
import { useApp } from '../lib/store';
import { IconArch, IconBook, IconGift, IconHeart, IconHome, IconImage, IconLetter, IconMoon, IconSparkleChat } from './Icons';

const ITEMS: Partial<Record<SceneId, { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }>> = {
    home: { label: 'Home', icon: IconHome },
    couple: { label: 'Couple', icon: IconHeart },
    countdown: { label: 'Date', icon: IconMoon },
    story: { label: 'Story', icon: IconBook },
    event: { label: 'Event', icon: IconArch },
    gallery: { label: 'Gallery', icon: IconImage },
    rsvp: { label: 'RSVP', icon: IconLetter },
    wishes: { label: 'Wishes', icon: IconSparkleChat },
    gift: { label: 'Gift', icon: IconGift },
};

/** The phone tab bar fits eight items; past that "Home" gives way (the monogram in the top bar links home too). */
const MAX_ITEMS = 8;

/**
 * Plain anchor links: native scrolling moves the page, the scroll timeline moves the camera,
 * and every click is a history entry, so Back/Forward walk through the scenes.
 */
export function Nav() {
    const { scenes } = useTheme();
    const active = useApp((s) => s.activeSection);
    const list = useRef<HTMLUListElement>(null);
    const [pill, setPill] = useState<CSSProperties | null>(null);

    let items = scenes.filter((s) => ITEMS[s.id]);
    if (items.length > MAX_ITEMS) items = items.filter((s) => s.id !== 'home');
    // The closing scene has no tab: it lights the last one.
    const activeId = scenes[active]?.id === 'closing' ? items[items.length - 1]?.id : scenes[active]?.id;

    // One pill glides between the tabs (the original's shared-layout animation, in CSS).
    useLayoutEffect(() => {
        const place = () => {
            const link = list.current?.querySelector<HTMLElement>('.wt15-nav__link.is-active');
            setPill(
                link
                    ? { width: link.offsetWidth, height: link.offsetHeight, transform: `translate(${link.offsetLeft}px, ${link.offsetTop}px)` }
                    : null,
            );
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [activeId, items.length]);

    return (
        <nav className="wt15-nav" aria-label="Navigasi undangan">
            <ul ref={list} className="wt15-nav__list" style={{ '--wt15-nav-count': items.length } as CSSProperties}>
                {pill && <li className="wt15-nav__pill" style={pill} aria-hidden="true" />}
                {items.map((s) => {
                    const item = ITEMS[s.id]!;
                    const isActive = s.id === activeId;
                    const Icon = item.icon;
                    return (
                        <li key={s.id}>
                            <a
                                href={`#${s.id}`}
                                className={`wt15-nav__link ${isActive ? 'is-active' : ''}`}
                                aria-current={isActive ? 'location' : undefined}
                            >
                                <Icon className="wt15-nav__icon" />
                                <span className="wt15-nav__label">{item.label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
