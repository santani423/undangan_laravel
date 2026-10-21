import { useEffect, useState } from 'react';
import { useSceneStatus } from '../../scene/sceneStatus';

const HEART = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];

/**
 * Shown while the 3D garden loads. Guests can skip it after a few seconds;
 * it also gives up automatically so slow devices are never stuck here.
 */
export function LoadingScreen({ active }: { active: boolean }) {
  const status = useSceneStatus();
  const [skipped, setSkipped] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [removed, setRemoved] = useState(false);
  const done = !active || skipped || status.phase === 'ready' || status.phase === 'failed';
  const percent = Math.round(status.progress * 100);

  useEffect(() => {
    if (!active) return;
    const skipTimer = window.setTimeout(() => setCanSkip(true), 4000);
    const giveUpTimer = window.setTimeout(() => setSkipped(true), 15000);
    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(giveUpTimer);
    };
  }, [active]);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setRemoved(true), 700);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] grid place-items-center bg-ivory transition-opacity duration-700 ${done ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
      aria-busy={!done}
      data-testid="loading-screen"
    >
      <div className="flex flex-col items-center px-6 text-center">
        <div className="voxel-heart" aria-hidden="true">
          {HEART.flatMap((row, y) =>
            [...row].map((cell, x) => (
              <span key={`${x}-${y}`} style={{ background: cell === '1' ? (y < 2 && (x === 1 || x === 4) ? '#eda6a6' : '#c56f78') : 'transparent' }} />
            )),
          )}
        </div>
        <p className="mt-6 font-serif text-3xl font-semibold tracking-wide text-ink">Undesia</p>
        <p className="mt-1 text-sm text-ink-soft">Menyiapkan taman undangan…</p>
        <div className="mt-5 h-2 w-56 overflow-hidden rounded-full bg-champagne/60" aria-hidden="true">
          <div className="h-full bg-gold-deep transition-[width] duration-300" style={{ width: `${Math.max(6, percent)}%` }} />
        </div>
        <p className="mt-2 text-xs tabular-nums text-ink-soft">{percent}%</p>
        {canSkip && !done && (
          <button type="button" className="btn btn-secondary btn-sm mt-5" onClick={() => setSkipped(true)}>
            Lanjutkan tanpa menunggu
          </button>
        )}
      </div>
    </div>
  );
}
