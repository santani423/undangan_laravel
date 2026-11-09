import { useId, useState } from 'react';
import { Copy, Wallet } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { toyAssets } from '../../config/assets';
import { STOP_INDEX } from '../../config/journey';
import { setExperience, useExperience } from '../../store/experience';
import { celebrate } from '../../store/celebrations';
import { sfx } from '../../hooks/useMusic';
import { copyToClipboard } from '../../utils/clipboard';
import { groupDigits } from '../../utils/format';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';
import { PackIcon } from '../ui/PackIcon';
import { useToast } from '../ui/Toast';

function CopyButton({ value, label }: { value: string; label: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="toy-btn toy-btn-white toy-btn-sm shrink-0"
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

/** Scene 5b — optional digital gift details behind an "open the present" interaction. */
export function DigitalGift() {
  const { digitalGift, showDemoNotices } = invitationConfig;
  const giftOpened = useExperience((s) => s.giftOpened);
  const panelId = useId();

  const open = () => {
    if (giftOpened) return;
    setExperience({ giftOpened: true });
    celebrate('gift', 1.2);
    sfx('pop');
  };

  return (
    <StopBlock stop={STOP_INDEX.gift} labelledBy="gift-title">
      <ToyCard studs={3} studOffset={2}>
        <img
          src={toyAssets.illustrations.gift}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute -top-14 -right-3 h-24 w-24 sm:-right-8 ${giftOpened ? '' : 'animate-bob'}`}
        />
        <p className="eyebrow">
          <PackIcon name="gift" size={16} className="text-toy-coral-deep" /> {digitalGift.enabled ? digitalGift.title : 'Tanda Kasih'}
        </p>
        <h2 id="gift-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Kotak Kado Ajaib
        </h2>
        <p className="mt-3">{digitalGift.enabled ? digitalGift.message : 'Doa dan kehadiran Anda adalah kado terindah.'}</p>

        {digitalGift.enabled && (
          <>
            {!giftOpened && (
              <button type="button" className="toy-btn toy-btn-butter mt-5 w-full" onClick={open} aria-expanded={false} aria-controls={panelId}>
                <PackIcon name="gift" size={20} /> Buka Kado
              </button>
            )}
            <div id={panelId} hidden={!giftOpened} className="mt-5 space-y-3">
              {digitalGift.accounts.map((acc) => (
                <div key={acc.id} className="animate-pop-in rounded-2xl bg-white/85 p-4 shadow-[inset_0_-3px_0_rgb(59_51_85/0.06)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-toy-ink-soft uppercase">
                        <Wallet size={14} aria-hidden="true" /> {acc.kind === 'bank' ? 'Transfer bank' : 'Dompet digital'} · {acc.provider}
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold tracking-wide tabular-nums">{groupDigits(acc.number)}</p>
                      <p className="text-sm">a.n. {acc.holder}</p>
                    </div>
                    <CopyButton value={acc.number} label={acc.kind === 'bank' ? 'Nomor rekening' : 'Nomor dompet digital'} />
                  </div>
                </div>
              ))}
              {digitalGift.shippingAddress && (
                <div className="animate-pop-in rounded-2xl bg-white/85 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-toy-ink-soft uppercase">
                    <PackIcon name="mapPin" size={14} /> Kirim kado ke alamat
                  </p>
                  <p className="mt-1 font-display font-semibold">{digitalGift.shippingAddress.recipient}</p>
                  <p className="text-sm">{digitalGift.shippingAddress.address}</p>
                  {digitalGift.shippingAddress.phone && <p className="text-sm">Telp. {digitalGift.shippingAddress.phone}</p>}
                  <div className="mt-2">
                    <CopyButton value={`${digitalGift.shippingAddress.recipient}, ${digitalGift.shippingAddress.address}`} label="Alamat" />
                  </div>
                </div>
              )}
              {showDemoNotices && <p className="demo-badge">Data rekening contoh — ganti di invitation.config.ts</p>}
            </div>
          </>
        )}
      </ToyCard>
    </StopBlock>
  );
}
