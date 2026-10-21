import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronsDown, MailOpen } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { formatLongDate } from '../../lib/date';

interface InvitationCoverProps {
  opening: boolean;
  reducedMotion: boolean;
  onOpen: () => void;
  /** Called when the exit animation has finished. */
  onExited: () => void;
}

/** Opening screen shown over the establishing shot of the garden. */
export function InvitationCover({ opening, reducedMotion, onOpen, onExited }: InvitationCoverProps) {
  const { config, recipientName, first, second } = useInvitationData();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-cover-item]', { autoAlpha: 0, y: 22, stagger: 0.1, duration: 1, ease: 'power2.out', delay: 0.2 });
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (!opening) return;
    const root = rootRef.current;
    const tl = gsap.timeline({ onComplete: onExited });
    if (reducedMotion) {
      tl.to(root, { autoAlpha: 0, duration: 0.3 });
    } else {
      tl.to(root?.querySelectorAll('[data-cover-item]') ?? [], { autoAlpha: 0, y: -26, stagger: 0.05, duration: 0.55, ease: 'power2.in' });
      tl.to(root, { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, '-=0.2');
    }
    return () => {
      tl.kill();
    };
  }, [opening, reducedMotion, onExited]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-linear-to-b from-transparent via-transparent to-ivory/70 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 sm:items-center sm:bg-none sm:pb-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cover-title"
      aria-describedby="cover-note"
      data-testid="invitation-cover"
    >
      <div className="invite-card w-full max-w-md text-center">
        <p className="eyebrow" data-cover-item>
          Undangan Pernikahan
        </p>
        <h2 id="cover-title" className="script mt-3 text-[2.9rem] text-rose-deep sm:text-6xl" data-cover-item>
          <span className="block">{first.nickname}</span>
          <span className="block font-serif text-3xl text-gold-deep" aria-label="dan">
            &amp;
          </span>
          <span className="block">{second.nickname}</span>
        </h2>
        <p className="mt-3 font-serif text-lg tracking-wide text-ink" data-cover-item>
          {formatLongDate(config.weddingDate, config.weddingTimeZone)}
        </p>

        <div className="sub-card mt-5" data-cover-item>
          <p className="text-sm text-ink-soft">{config.greeting.recipientPrefix}</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink" data-testid="recipient-name">
            {recipientName ?? config.greeting.defaultRecipient}
          </p>
        </div>

        <p id="cover-note" className="body-copy mt-4 text-sm" data-cover-item>
          {config.greeting.coverNote}
        </p>

        <div data-cover-item>
          <button type="button" className="btn btn-primary mt-5 w-full sm:w-auto sm:px-8" onClick={onOpen} disabled={opening} autoFocus>
            <MailOpen aria-hidden="true" className="size-5" />
            Buka Undangan
          </button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft" data-cover-item>
          <ChevronsDown aria-hidden="true" className="scroll-hint-dot size-4" />
          Setelah dibuka, gulir untuk menjelajahi taman undangan
        </p>
      </div>
    </div>
  );
}
