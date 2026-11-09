import { IconCopy, IconWallet } from '../components/Icons';
import { DemoBadge, Reveal, SectionHeading } from '../components/ui';
import { useWedding } from '../lib/context';
import { copyText } from '../lib/links';
import { showToast } from '../lib/store';

/** Scene 9: digital envelope by the moonlit pond, under the wishing tree's lights. */
export function GiftSection() {
    const { gift, isSample } = useWedding();
    const copy = async (number: string) =>
        showToast((await copyText(number.replace(/\s+/g, ''))) ? 'Nomor rekening disalin ✓' : 'Gagal menyalin — silakan salin manual.');
    return (
        <section id="gift" data-scene className="wt15-section wt15-section--right wt15-section--tall" aria-labelledby="wt15-gift-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-gift-title"
                    eyebrow="Wedding Gift"
                    title={
                        <>
                            Tanda <em>kasih</em>
                        </>
                    }
                />
                <Reveal as="p" className="wt15-lead" delay={0.1}>
                    {gift.intro}
                </Reveal>
                {isSample && <DemoBadge>Rekening di bawah adalah contoh — jangan mengirim dana ke rekening ini.</DemoBadge>}
                <div className="wt15-gifts">
                    {gift.accounts.map((a, i) => (
                        <Reveal key={a.id} className="wt15-gift-card" delay={0.06 * i}>
                            <span className="wt15-gift-card__icon" aria-hidden="true">
                                <IconWallet />
                            </span>
                            <div className="wt15-gift-card__body">
                                <p className="wt15-gift-card__bank">{a.bankName}</p>
                                <p className="wt15-gift-card__number">{a.accountNumber}</p>
                                {a.accountHolder && <p className="wt15-gift-card__holder">a.n. {a.accountHolder}</p>}
                            </div>
                            <button
                                type="button"
                                className="wt15-btn wt15-btn--ghost wt15-btn--sm"
                                onClick={() => void copy(a.accountNumber)}
                                aria-label={`Salin nomor ${a.bankName} ${a.accountNumber}`}
                            >
                                <IconCopy /> Salin
                            </button>
                        </Reveal>
                    ))}
                    {gift.qris.map((q, i) => (
                        <Reveal key={q.id} className="wt15-gift-qris" delay={0.06 * (gift.accounts.length + i)}>
                            <img src={q.src} alt={`Kode QRIS ${q.label}`} width={200} height={200} loading="lazy" decoding="async" />
                            <p>{q.label ? `QRIS · ${q.label}` : 'QRIS'}</p>
                        </Reveal>
                    ))}
                </div>
                <Reveal as="p" className="wt15-muted wt15-small wt15-gift-thanks" delay={0.2}>
                    {gift.thanks}
                </Reveal>
            </div>
        </section>
    );
}
