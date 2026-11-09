import { Copy, QrCode, Wallet } from 'lucide-react';
import { useId, useState } from 'react';
import { StopBlock } from '../components/layout/StopBlock';
import { PackIcon } from '../components/ui/PackIcon';
import { useToast } from '../components/ui/Toast';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { sfx } from '../hooks/useMusic';
import { toyAssets } from '../lib/assets';
import { copyToClipboard } from '../lib/clipboard';
import { cx } from '../lib/cx';
import { groupDigits } from '../lib/format';
import { STOP_INDEX } from '../lib/journey';
import type { GiftAccount } from '../lib/types';
import { celebrate } from '../store/celebrations';
import { setExperience, useExperience } from '../store/experience';

function CopyButton({ value, label }: { value: string; label: string }) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            className="bt10-btn bt10-btn--white bt10-btn--sm bt10-shrink-0"
            onClick={async () => {
                const ok = await copyToClipboard(value);
                if (ok) {
                    setCopied(true);
                    toast(`${label} disalin`);
                    window.setTimeout(() => setCopied(false), 1800);
                } else {
                    toast('Gagal menyalin — salin secara manual', 'error');
                }
            }}
            aria-label={`Salin ${label.toLowerCase()}`}
        >
            {copied ? <PackIcon name="check" size={16} /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Disalin' : 'Salin'}
        </button>
    );
}

function AccountCard({ account }: { account: GiftAccount }) {
    const [showQr, setShowQr] = useState(false);
    const label = account.kind === 'bank' ? 'Nomor rekening' : 'Nomor dompet digital';
    return (
        <div className="bt10-account bt10-pop-in">
            <div className="bt10-account__row">
                <div className="bt10-min-w-0">
                    <p className="bt10-account__kind">
                        <Wallet size={14} aria-hidden="true" /> {account.kind === 'bank' ? 'Transfer bank' : 'Dompet digital'} · {account.provider}
                    </p>
                    {account.number && <p className="bt10-account__number">{groupDigits(account.number)}</p>}
                    {account.holder && <p className="bt10-small">a.n. {account.holder}</p>}
                </div>
                {account.number && <CopyButton value={account.number} label={label} />}
            </div>
            {account.qrisUrl && (
                <>
                    <button
                        type="button"
                        className="bt10-btn bt10-btn--white bt10-btn--sm bt10-mt-3"
                        aria-expanded={showQr}
                        onClick={() => setShowQr((v) => !v)}
                    >
                        <QrCode size={16} aria-hidden="true" /> {showQr ? 'Sembunyikan QRIS' : 'Tampilkan QRIS'}
                    </button>
                    {showQr && <img src={account.qrisUrl} alt={`Kode QRIS ${account.provider}`} className="bt10-account__qris" loading="lazy" />}
                </>
            )}
        </div>
    );
}

/** Scene 5b — optional digital gift details behind an "open the present" interaction. */
export function DigitalGift() {
    const { gift, features, showDemoNotices } = useInvitation().config;
    const giftOpened = useExperience((s) => s.giftOpened);
    const panelId = useId();

    const open = () => {
        if (giftOpened) return;
        setExperience({ giftOpened: true });
        celebrate('gift', 1.2);
        sfx('pop');
    };

    return (
        <StopBlock stop={STOP_INDEX.gift} labelledBy="bt10-gift-title">
            <ToyCard studs={3} studOffset={2}>
                <img
                    src={toyAssets.illustrations.gift}
                    alt=""
                    aria-hidden="true"
                    className={cx('bt10-deco bt10-deco--corner', !giftOpened && 'bt10-bob')}
                />
                <p className="bt10-eyebrow">
                    <PackIcon name="gift" size={16} className="bt10-text-coral-deep" /> {features.gift ? gift.title : 'Tanda Kasih'}
                </p>
                <h2 id="bt10-gift-title" className="bt10-title">
                    Kotak Kado Ajaib
                </h2>
                <p className="bt10-mt-3">{features.gift ? gift.message : 'Doa dan kehadiran Anda adalah kado terindah.'}</p>

                {features.gift && (
                    <>
                        {!giftOpened && (
                            <button
                                type="button"
                                className="bt10-btn bt10-btn--butter bt10-btn--block bt10-mt-5"
                                onClick={open}
                                aria-expanded={false}
                                aria-controls={panelId}
                            >
                                <PackIcon name="gift" size={20} /> Buka Kado
                            </button>
                        )}
                        <div id={panelId} hidden={!giftOpened} className="bt10-accounts">
                            {gift.accounts.map((acc) => (
                                <AccountCard key={acc.id} account={acc} />
                            ))}
                            {showDemoNotices && <p className="bt10-demo-badge">Data rekening contoh</p>}
                        </div>
                    </>
                )}
            </ToyCard>
        </StopBlock>
    );
}
