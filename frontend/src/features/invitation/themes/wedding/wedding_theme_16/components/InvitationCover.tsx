import { gsap } from 'gsap';
import { ChevronsDown, MailOpen } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { useInvitationData } from '../hooks/useAppContext';

interface InvitationCoverProps {
    opening: boolean;
    reducedMotion: boolean;
    onOpen: () => void;
    /** Called when the exit animation has finished. */
    onExited: () => void;
}

/** Opening screen shown over the establishing shot of the garden. */
export function InvitationCover({ opening, reducedMotion, onOpen, onExited }: InvitationCoverProps) {
    const { config, first, second } = useInvitationData();
    const { greeting } = config;
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
            className="wt16-cover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wt16-cover-title"
            aria-describedby="wt16-cover-note"
        >
            <div className="wt16-card wt16-cover__card">
                <p className="wt16-eyebrow" data-cover-item>
                    Undangan Pernikahan
                </p>
                <h2 id="wt16-cover-title" className="wt16-script wt16-cover__names" data-cover-item>
                    <span className="wt16-cover__name">{first.nickname}</span>
                    <span className="wt16-cover__amp" aria-label="dan">
                        &amp;
                    </span>
                    <span className="wt16-cover__name">{second.nickname}</span>
                </h2>
                {config.weddingDateLabel && (
                    <p className="wt16-cover__date" data-cover-item>
                        {config.weddingDateLabel}
                    </p>
                )}

                {config.sections.greeting && (
                    <div className="wt16-sub wt16-cover__recipient" data-cover-item>
                        <p className="wt16-cover__prefix">{greeting.recipientPrefix}</p>
                        <p className="wt16-cover__guest">{greeting.recipientName || greeting.defaultRecipient}</p>
                    </div>
                )}

                <p id="wt16-cover-note" className="wt16-body wt16-cover__note" data-cover-item>
                    {greeting.coverNote}
                </p>

                <div data-cover-item>
                    <button type="button" className="wt16-btn wt16-btn--primary wt16-cover__open" onClick={onOpen} disabled={opening} autoFocus>
                        <MailOpen aria-hidden="true" size={20} />
                        {greeting.buttonText}
                    </button>
                </div>
                <p className="wt16-cover__hint" data-cover-item>
                    <ChevronsDown aria-hidden="true" size={16} className="wt16-scroll-hint" />
                    Setelah dibuka, gulir untuk menjelajahi taman undangan
                </p>
            </div>
        </div>
    );
}
