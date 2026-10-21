import { Download, Landmark, Package, QrCode, Wallet } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { assetUrl } from '../../lib/assets';
import { formatAccountNumber } from '../../lib/format';
import type { GiftAccount } from '../../types/invitation';
import { CopyButton } from '../ui/CopyButton';
import { SectionShell } from '../ui/SectionShell';

function AccountCard({ account }: { account: GiftAccount }) {
  const Icon = account.type === 'bank' ? Landmark : Wallet;
  const number = account.accountNumber.trim();
  return (
    <article className="sub-card flex flex-col" data-reveal data-testid={`gift-${account.id}`}>
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-5 text-gold-deep" />
        <h3 className="font-serif text-xl font-semibold text-ink">{account.provider}</h3>
        <span className="ml-auto rounded bg-champagne/60 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-gold-ink">
          {account.type === 'bank' ? 'Bank' : 'E-Wallet'}
        </span>
      </div>
      {number ? (
        <>
          <p className="mt-3 font-mono text-xl tracking-wider text-ink tabular-nums" data-testid="account-number">
            {formatAccountNumber(number)}
          </p>
          <p className="text-sm text-ink-soft">a.n. {account.accountHolder}</p>
          <div className="mt-3">
            <CopyButton
              text={number.replace(/\s+/g, '')}
              label="Salin Nomor"
              ariaLabel={`Salin nomor ${account.type === 'bank' ? 'rekening' : 'akun'} ${account.provider}`}
              successMessage="Nomor rekening disalin"
              variant="primary"
            />
          </div>
        </>
      ) : (
        <p className="mt-3 rounded border border-dashed border-gold/60 p-3 text-sm text-ink-soft" data-testid="account-placeholder">
          Nomor {account.type === 'bank' ? 'rekening' : 'akun'} belum diisi oleh pemilik undangan.
        </p>
      )}
    </article>
  );
}

/** Section J — bank / e-wallet details, QRIS and physical gift address. */
export function DigitalGiftSection() {
  const { config } = useInvitationData();
  const { gift } = config;

  return (
    <SectionShell id="hadiah" eyebrow="Tanda Kasih" title="Hadiah Digital" icon="gift" width="lg">
      <p className="body-copy text-center">{gift.message}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {gift.accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="sub-card text-center" data-reveal>
          <h3 className="flex items-center justify-center gap-2 font-serif text-xl font-semibold text-ink">
            <QrCode aria-hidden="true" className="size-5 text-gold-deep" />
            {gift.qris?.label ?? 'QRIS'}
          </h3>
          {gift.qris ? (
            <figure className="mt-3">
              <img src={assetUrl(gift.qris.image)} alt={gift.qris.alt} loading="lazy" className="mx-auto w-44 rounded border border-gold/40 bg-white p-2" />
              <a className="btn btn-secondary btn-sm mt-3" href={assetUrl(gift.qris.image)} download>
                <Download aria-hidden="true" className="size-4" />
                Unduh QRIS
              </a>
            </figure>
          ) : (
            <p className="mt-3 rounded border border-dashed border-gold/60 p-3 text-sm text-ink-soft">Kode QRIS belum ditambahkan oleh pemilik undangan.</p>
          )}
        </div>

        {gift.physicalGift && (
          <div className="sub-card text-center" data-reveal>
            <h3 className="flex items-center justify-center gap-2 font-serif text-xl font-semibold text-ink">
              <Package aria-hidden="true" className="size-5 text-gold-deep" />
              Kirim Kado
            </h3>
            {gift.physicalGift.address.trim() ? (
              <>
                <p className="mt-3 text-sm font-medium text-ink">{gift.physicalGift.recipient}</p>
                <address className="body-copy text-sm not-italic">{gift.physicalGift.address}</address>
                <div className="mt-3">
                  <CopyButton
                    text={`${gift.physicalGift.recipient}, ${gift.physicalGift.address}`}
                    label="Salin Alamat"
                    ariaLabel="Salin alamat pengiriman kado"
                    successMessage="Alamat pengiriman disalin"
                  />
                </div>
              </>
            ) : (
              <p className="mt-3 rounded border border-dashed border-gold/60 p-3 text-sm text-ink-soft">
                Alamat pengiriman kado belum diisi oleh pemilik undangan.
              </p>
            )}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
