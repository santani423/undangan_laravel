import type { BankAccount, DigitalWallet } from '@/types/invitation';

interface DigitalWalletSectionProps {
    bankAccounts: BankAccount[];
    digitalWallets: DigitalWallet[];
    onToast: (msg: string) => void;
    styles: {
        bankGrid: string;
        bankCard: string;
        bankLogo: string;
        bankType: string;
        bankNumber: string;
        bankName: string;
        copyBankBtn: string;
        ewalletGrid: string;
        ewalletCard: string;
        ewalletName: string;
        ewalletPhone: string;
        copyEwalletBtn: string;
        ewalletTitle: string;
    };
}

function copyText(text: string, label: string, onToast: (msg: string) => void) {
    navigator.clipboard.writeText(text).then(() => {
        onToast(`✓ ${label} disalin!`);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onToast(`✓ ${label} disalin!`);
    });
}

function formatAccountNumber(num: string) {
    return num.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export default function DigitalWalletSection({
    bankAccounts,
    digitalWallets,
    onToast,
    styles,
}: DigitalWalletSectionProps) {
    if (!bankAccounts.length && !digitalWallets.length) return null;

    return (
        <>
            {bankAccounts.length > 0 && (
                <div className={styles.bankGrid}>
                    {bankAccounts.map((b, i) => (
                        <div key={i} className={styles.bankCard}>
                            <div className={styles.bankLogo}>{(b.bankName || '').toUpperCase()}</div>
                            <p className={styles.bankType}>Bank Transfer</p>
                            <p className={styles.bankNumber}>{formatAccountNumber(b.accountNumber)}</p>
                            <p className={styles.bankName}>a.n. {b.accountName}</p>
                            <button
                                className={styles.copyBankBtn}
                                onClick={() => copyText(b.accountNumber, `No. Rekening ${b.bankName}`, onToast)}
                            >
                                Salin Nomor
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {digitalWallets.length > 0 && (
                <>
                    <h3 className={styles.ewalletTitle}>E-Wallet</h3>
                    <div className={styles.ewalletGrid}>
                        {digitalWallets.map((w, i) => (
                            <div key={i} className={`${styles.ewalletCard} ewallet-${(w.provider || 'other').toLowerCase()}`}>
                                {w.logoUrl ? (
                                    <img
                                        src={w.logoUrl}
                                        alt={w.label}
                                        style={{ height: '36px', objectFit: 'contain', marginBottom: '8px' }}
                                    />
                                ) : (
                                    <p className={styles.ewalletName}>{w.label || w.provider}</p>
                                )}
                                <div style={{ width: '70px', height: '70px', background: 'white', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '0.75rem', fontWeight: 700 }}>
                                    QR
                                </div>
                                <p className={styles.ewalletPhone}>{w.accountNumber}</p>
                                <p style={{ fontSize: '0.8rem', marginBottom: '8px' }}>{w.accountName}</p>
                                <button
                                    className={styles.copyEwalletBtn}
                                    onClick={() => copyText(w.accountNumber, w.label || w.provider, onToast)}
                                >
                                    Salin
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
