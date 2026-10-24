import { useEffect, useState } from 'react';
import { toyAssets } from '../../config/assets';
import { useExperience } from '../../store/experience';

/**
 * Covers the page while the 3D world downloads. Progress comes from the
 * Three.js loading manager (reported by the canvas); a safety timeout lets
 * guests through even if a non-critical asset hangs.
 */
export function LoadingScreen({ active }: { active: boolean }) {
  const sceneReady = useExperience((s) => s.sceneReady);
  const progress = useExperience((s) => s.loadProgress);
  const failed = useExperience((s) => s.webglUnavailable);
  const [timedOut, setTimedOut] = useState(false);
  const [hidden, setHidden] = useState(!active);

  const done = !active || sceneReady || failed || timedOut;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setTimedOut(true), 15000);
    return () => window.clearTimeout(t);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setHidden(true), 700);
    return () => window.clearTimeout(t);
  }, [done]);

  if (hidden) return null;
  const pct = Math.round(done ? 100 : progress);

  return (
    <div
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#8fd3f5] via-[#c9ecfb] to-[#fff1d9] px-6 transition-opacity duration-700 ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative h-44 w-56" aria-hidden="true">
        <img src={toyAssets.illustrations.house} alt="" className="absolute bottom-0 left-2 h-36 w-36" />
        <img src={toyAssets.illustrations.balloons} alt="" className="absolute top-0 right-0 h-28 w-28 animate-bob" />
        <img src={toyAssets.illustrations.tree} alt="" className="absolute right-3 bottom-0 h-24 w-20" />
      </div>
      <div className="w-full max-w-xs text-center">
        <p className="font-display text-xl font-semibold text-toy-ink">Menyiapkan Dunia Mainan…</p>
        <div
          className="mt-4 h-5 overflow-hidden rounded-full border-[3px] border-white bg-white/60 shadow-inner"
          role="progressbar"
          aria-label="Memuat dunia 3D"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div
            className="h-full rounded-full bg-[repeating-linear-gradient(45deg,var(--color-toy-coral)_0_10px,var(--color-toy-butter)_10px_20px)] transition-[width] duration-300"
            style={{ width: `${Math.max(6, pct)}%` }}
          />
        </div>
        <p className="mt-2 font-display text-sm text-toy-ink/70">{pct}%</p>
      </div>
    </div>
  );
}
