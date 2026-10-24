import { useEffect, useRef } from 'react';
import { toyAssets, type IllustrationKey } from '../../config/assets';
import { CAMERA_STOPS } from '../../config/journey';
import { useExperience } from '../../store/experience';
import { onCelebrate } from '../../store/celebrations';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

type Placement = { key: IllustrationKey; className: string };

/** One illustrated vignette per camera stop, composed from the asset pack SVGs. */
const VIGNETTES: Placement[][] = [
  [
    { key: 'house', className: 'left-[8%] bottom-[18%] w-[38%] max-w-64' },
    { key: 'tree', className: 'right-[10%] bottom-[18%] w-[24%] max-w-40' },
    { key: 'balloons', className: 'right-[30%] bottom-[40%] w-[22%] max-w-36 animate-bob' },
  ],
  [
    { key: 'blocks', className: 'left-[6%] bottom-[16%] w-[34%] max-w-56' },
    { key: 'mascot', className: 'left-[34%] bottom-[20%] w-[34%] max-w-56 animate-bob' },
    { key: 'balloons', className: 'right-[6%] bottom-[38%] w-[24%] max-w-40 animate-bob' },
  ],
  [
    { key: 'gift', className: 'left-[8%] bottom-[16%] w-[26%] max-w-44' },
    { key: 'cake', className: 'left-[32%] bottom-[18%] w-[36%] max-w-60' },
    { key: 'balloons', className: 'right-[6%] bottom-[38%] w-[24%] max-w-40 animate-bob' },
  ],
  [
    { key: 'tree', className: 'left-[6%] bottom-[18%] w-[22%] max-w-36' },
    { key: 'car', className: 'left-[30%] bottom-[12%] w-[34%] max-w-56' },
    { key: 'tree', className: 'right-[8%] bottom-[18%] w-[20%] max-w-32' },
  ],
  [
    { key: 'gift', className: 'left-[30%] bottom-[16%] w-[34%] max-w-56' },
    { key: 'mascot', className: 'left-[6%] bottom-[16%] w-[26%] max-w-44' },
    { key: 'balloons', className: 'right-[8%] bottom-[34%] w-[24%] max-w-40 animate-bob' },
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
              { transform: `translate3d(${drift}px, ${window.innerHeight * 0.9}px, 0) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0.2 },
            ],
            { duration: (reduced ? 1200 : 2400) + Math.random() * 1200, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 },
          );
          animation.onfinish = () => piece.remove();
        }
      }),
    [],
  );

  return <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" />;
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
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#86cef3] via-[#c7ebfb] to-[#fff1d9]">
        <div className="absolute top-[8%] right-[12%] h-24 w-24 rounded-full bg-toy-butter/90 shadow-[0_0_80px_30px_rgb(255_209_102/0.5)]" />
        <div className="absolute top-[14%] left-[8%] h-12 w-40 rounded-full bg-white/90 shadow-[40px_-14px_0_6px_rgb(255_255_255/0.9)]" />
        <div className="absolute top-[24%] right-[30%] h-10 w-32 rounded-full bg-white/80 shadow-[30px_-10px_0_4px_rgb(255_255_255/0.8)]" />
        <div className="absolute -bottom-[30%] -left-[10%] h-[70%] w-[75%] rounded-[50%] bg-[#8fe0a8]" />
        <div className="absolute -right-[15%] -bottom-[32%] h-[72%] w-[80%] rounded-[50%] bg-[#74d394]" />
        <div className="absolute inset-x-0 bottom-[6%] h-[7%] -skew-y-2 bg-[#f6dfae]" />

        <div
          className={`absolute inset-x-0 top-0 h-[48%] transition-transform duration-700 md:h-full ${
            panel === 'left' ? 'md:translate-x-[18%]' : panel === 'right' ? 'md:-translate-x-[18%]' : ''
          }`}
        >
          {VIGNETTES.map((items, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === vignette ? 'opacity-100' : 'opacity-0'}`}>
              {items.map((p, j) => (
                <img key={j} src={toyAssets.illustrations[p.key]} alt="" className={`absolute h-auto ${p.className}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <DomConfetti />
    </>
  );
}
