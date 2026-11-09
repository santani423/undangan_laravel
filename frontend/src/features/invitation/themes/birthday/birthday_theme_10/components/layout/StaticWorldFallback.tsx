import { useEffect, useRef, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { toyAssets, type IllustrationKey } from '../../lib/assets';
import { cx } from '../../lib/cx';
import { CAMERA_STOPS } from '../../lib/journey';
import { onCelebrate } from '../../store/celebrations';
import { useExperience } from '../../store/experience';

type Placement = { key: IllustrationKey; style: CSSProperties; bob?: boolean };

const at = (side: 'left' | 'right', x: string, bottom: string, width: string, maxWidth: number): CSSProperties => ({
    [side]: x,
    bottom,
    width,
    maxWidth,
});

/** One illustrated vignette per camera stop, composed from the asset pack SVGs. */
const VIGNETTES: Placement[][] = [
    [
        { key: 'house', style: at('left', '8%', '18%', '38%', 256) },
        { key: 'tree', style: at('right', '10%', '18%', '24%', 160) },
        { key: 'balloons', style: at('right', '30%', '40%', '22%', 144), bob: true },
    ],
    [
        { key: 'blocks', style: at('left', '6%', '16%', '34%', 224) },
        { key: 'mascot', style: at('left', '34%', '20%', '34%', 224), bob: true },
        { key: 'balloons', style: at('right', '6%', '38%', '24%', 160), bob: true },
    ],
    [
        { key: 'gift', style: at('left', '8%', '16%', '26%', 176) },
        { key: 'cake', style: at('left', '32%', '18%', '36%', 240) },
        { key: 'balloons', style: at('right', '6%', '38%', '24%', 160), bob: true },
    ],
    [
        { key: 'tree', style: at('left', '6%', '18%', '22%', 144) },
        { key: 'car', style: at('left', '30%', '12%', '34%', 224) },
        { key: 'tree', style: at('right', '8%', '18%', '20%', 128) },
    ],
    [
        { key: 'gift', style: at('left', '30%', '16%', '34%', 224) },
        { key: 'mascot', style: at('left', '6%', '16%', '26%', 176) },
        { key: 'balloons', style: at('right', '8%', '34%', '24%', 160), bob: true },
    ],
];

function DomConfetti() {
    const layerRef = useRef<HTMLDivElement>(null);

    useEffect(
        () =>
            onCelebrate(({ strength }) => {
                const layer = layerRef.current;
                if (!layer) return;
                const reduced = prefersReducedMotion();
                const count = Math.round((reduced ? 12 : 42) * strength);
                for (let i = 0; i < count; i++) {
                    const piece = document.createElement('span');
                    const size = 26 + Math.random() * 22;
                    piece.style.cssText = `position:absolute;left:${10 + Math.random() * 80}%;top:-40px;width:${size}px;height:${size}px;background:url("${toyAssets.sprites.confetti}") ${Math.floor(Math.random() * 4) * -size}px ${Math.floor(Math.random() * 4) * -size}px / ${size * 4}px ${size * 4}px;`;
                    layer.appendChild(piece);
                    const drift = (Math.random() - 0.5) * 160;
                    const animation = piece.animate(
                        [
                            { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
                            {
                                transform: `translate3d(${drift}px, ${window.innerHeight * 0.9}px, 0) rotate(${Math.random() * 720 - 360}deg)`,
                                opacity: 0.2,
                            },
                        ],
                        { duration: (reduced ? 1200 : 2400) + Math.random() * 1200, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 },
                    );
                    animation.onfinish = () => piece.remove();
                }
            }),
        [],
    );

    return <div ref={layerRef} aria-hidden="true" className="bt10-dom-confetti" />;
}

/**
 * Illustrated 2D Toy World shown when WebGL is unavailable. All invitation
 * content still works; only the 3D journey is replaced by these vignettes.
 */
export function StaticWorldFallback() {
    const activeStop = useExperience((s) => s.activeStop);
    const vignette = Math.min(activeStop, VIGNETTES.length - 1);
    const panel = CAMERA_STOPS[activeStop]?.panel ?? 'center';

    return (
        <>
            <div aria-hidden="true" className="bt10-static">
                <div className="bt10-static__sun" />
                <div className="bt10-static__cloud bt10-static__cloud--a" />
                <div className="bt10-static__cloud bt10-static__cloud--b" />
                <div className="bt10-static__hill bt10-static__hill--a" />
                <div className="bt10-static__hill bt10-static__hill--b" />
                <div className="bt10-static__road" />

                <div className={`bt10-static__stage bt10-static__stage--${panel}`}>
                    {VIGNETTES.map((items, i) => (
                        <div key={i} className={cx('bt10-static__vignette', i === vignette && 'is-active')}>
                            {items.map((p, j) => (
                                <img
                                    key={j}
                                    src={toyAssets.illustrations[p.key]}
                                    alt=""
                                    className={cx('bt10-static__item', p.bob && 'bt10-bob')}
                                    style={p.style}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <DomConfetti />
        </>
    );
}
