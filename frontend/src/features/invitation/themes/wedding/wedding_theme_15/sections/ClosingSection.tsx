import { IconArrowUp } from '../components/Icons';
import { Monogram } from '../components/Monogram';
import { Divider, Reveal } from '../components/ui';
import { useWedding } from '../lib/context';

/** Closing: the camera rises toward the moon above the wishing tree. */
export function ClosingSection() {
    const wedding = useWedding();
    const { couple, closing, music, sections } = wedding;
    return (
        <section id="closing" data-scene className="wt15-section wt15-section--center" aria-labelledby="wt15-closing-title">
            <div className="wt15-closing" data-ui>
                <Reveal>
                    <Monogram size={84} className="wt15-closing__monogram" />
                </Reveal>
                <Reveal as="p" className="wt15-eyebrow" delay={0.05}>
                    Terima kasih
                </Reveal>
                <Reveal delay={0.1}>
                    <h2 id="wt15-closing-title" className="wt15-display wt15-closing__names">
                        {couple.bride.nickname} <span className="wt15-amp">&amp;</span> {couple.groom.nickname}
                    </h2>
                </Reveal>
                <Reveal as="p" className="wt15-closing__message" delay={0.16}>
                    {closing.message}
                </Reveal>
                <Reveal as="p" className="wt15-closing__signature" delay={0.22}>
                    {closing.signature}
                </Reveal>
                <Reveal delay={0.26}>
                    <Divider />
                </Reveal>
                <Reveal delay={0.3}>
                    <a href="#home" className="wt15-btn wt15-btn--ghost wt15-btn--sm">
                        <IconArrowUp /> Kembali ke awal
                    </a>
                </Reveal>
                {sections.footer && (
                    <footer className="wt15-credits">
                        {sections.music && (
                            <p>
                                Musik: {music.title} — {music.credit}.
                            </p>
                        )}
                        <p>Semua ilustrasi dan model 3D dibuat khusus untuk undangan ini.</p>
                    </footer>
                )}
            </div>
        </section>
    );
}
