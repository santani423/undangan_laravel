import { Download, Landmark, QrCode, Wallet } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import { formatAccountNumber } from '../lib/format';
import type { GiftAccount, QrisCode } from '../lib/types';

function AccountCard({ account }: { account: GiftAccount }) {
    const Icon = account.type === 'bank' ? Landmark : Wallet;
    const kind = account.type === 'bank' ? 'rekening' : 'akun';
    return (
        <article className="wt16-sub wt16-account" data-reveal>
            <div className="wt16-account__head">
                <Icon aria-hidden="true" size={20} />
                <h3 className="wt16-account__provider">{account.provider}</h3>
                <span className="wt16-account__tag">{account.type === 'bank' ? 'Bank' : 'E-Wallet'}</span>
            </div>
            <p className="wt16-account__number">{formatAccountNumber(account.accountNumber)}</p>
            {account.accountHolder && <p className="wt16-account__holder">a.n. {account.accountHolder}</p>}
            <div className="wt16-account__copy">
                <CopyButton
                    text={account.accountNumber.replace(/\s+/g, '')}
                    label="Salin Nomor"
                    ariaLabel={`Salin nomor ${kind} ${account.provider}`}
                    successMessage={`Nomor ${kind} disalin`}
                    variant="primary"
                />
            </div>
        </article>
    );
}

function QrisCard({ qris }: { qris: QrisCode }) {
    return (
        <div className="wt16-sub wt16-qris" data-reveal>
            <h3 className="wt16-qris__title">
                <QrCode aria-hidden="true" size={20} />
                QRIS {qris.label}
            </h3>
            <figure>
                <img src={qris.image} alt={`Kode QRIS ${qris.label} untuk tanda kasih`} loading="lazy" className="wt16-qris__img" />
                <a className="wt16-btn wt16-btn--secondary wt16-btn--sm" href={qris.image} download target="_blank" rel="noopener noreferrer">
                    <Download aria-hidden="true" size={16} />
                    Unduh QRIS
                </a>
            </figure>
        </div>
    );
}

/** Section J — bank / e-wallet details and QRIS codes. */
export function DigitalGiftSection() {
    const { config } = useInvitationData();
    const { gift } = config;

    return (
        <SectionShell id="hadiah" eyebrow="Tanda Kasih" title="Hadiah Digital" icon="gift" width="lg">
            <p className="wt16-body wt16-center">{gift.message}</p>
            <div className="wt16-grid-2 wt16-gift">
                {gift.accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                ))}
                {gift.qris.map((qris) => (
                    <QrisCard key={qris.id} qris={qris} />
                ))}
            </div>
        </SectionShell>
    );
}
