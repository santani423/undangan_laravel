import { useEffect, useRef } from 'react';
import { SVGS } from '../lib/aset';
import { useTheme } from '../lib/context';
import { useApp } from '../lib/store';

/**
 * 2D twilight forest used when WebGL is unavailable, fails, or the guest picks "mode ringan".
 * Built from the bundled SVG illustrations with light CSS parallax.
 */
export function FallbackBackdrop() {
    const root = useRef<HTMLDivElement>(null);
    const { scenes } = useTheme();
    const active = useApp((s) => s.activeSection);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                root.current?.style.setProperty('--p', String(window.scrollY / max));
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);
    return (
        <div ref={root} className="wt15-fallback" data-section={scenes[active]?.id} aria-hidden="true">
            <img className="wt15-fallback__hills" src={SVGS.forestHills} alt="" />
            <img className="wt15-fallback__moon wt15-float-gently" src={SVGS.moon} alt="" />
            <img className="wt15-fallback__flies wt15-twinkle" src={SVGS.fireflies} alt="" />
            <img className="wt15-fallback__lantern wt15-float-gently" src={SVGS.lantern} alt="" />
            <img className="wt15-fallback__mushrooms" src={SVGS.mushrooms} alt="" />
            <img className="wt15-fallback__flowers" src={SVGS.wildflowers} alt="" />
            <div className="wt15-fallback__tint" />
        </div>
    );
}
