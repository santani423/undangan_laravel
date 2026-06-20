import type { BankAccount, DigitalWallet } from '@/types/invitation';
import { useEffect, useState } from 'react';

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

// ── QRIS Lightbox ─────────────────────────────────────────────────────────────

interface QrisLightboxProps {
    wallet: DigitalWallet;
    onClose: () => void;
}

function QrisLightbox({ wallet, onClose }: QrisLightboxProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
        >
            <div style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '320px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
                            {wallet.label || wallet.provider}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                            {wallet.accountNumber} &middot; {wallet.accountName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1.4rem', lineHeight: 1, color: '#888',
                            padding: '4px 8px',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* QR Image */}
                <div style={{
                    background: '#fff',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <img
                        src={wallet.qrisQrUrl!}
                        alt={`QRIS ${wallet.label}`}
                        style={{
                            width: '100%',
                            maxWidth: '240px',
                            height: 'auto',
                            display: 'block',
                            borderRadius: '8px',
                        }}
                    />
                </div>

                {/* Footer */}
                <div style={{
                    background: '#fafafa',
                    padding: '12px 18px',
                    textAlign: 'center',
                    borderTop: '1px solid #f0f0f0',
                }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                        Scan QR Code untuk transfer
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DigitalWalletSection({
    bankAccounts,
    digitalWallets,
    onToast,
    styles,
}: DigitalWalletSectionProps) {
    const [previewWallet, setPreviewWallet] = useState<DigitalWallet | null>(null);

    if (!bankAccounts.length && !digitalWallets.length) return null;

    return (
        <>
            {/* Bank Accounts */}
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

            {/* E-Wallets */}
            {digitalWallets.length > 0 && (
                <>
                    <h3 className={styles.ewalletTitle}>E-Wallet</h3>
                    <div className={styles.ewalletGrid}>
                        {digitalWallets.map((w, i) => (
                            <div
                                key={i}
                                className={`${styles.ewalletCard} ewallet-${(w.provider || 'other').toLowerCase()}`}
                            >
                                {/* Logo or name */}
                                {w.logoUrl ? (
                                    <img
                                        src={w.logoUrl}
                                        alt={w.label}
                                        style={{ height: '36px', objectFit: 'contain', marginBottom: '8px' }}
                                    />
                                ) : (
                                    <p className={styles.ewalletName}>{w.label || w.provider}</p>
                                )}

                                {/* QRIS image — only shown when available */}
                                {w.qrisQrUrl ? (
                                    <button
                                        onClick={() => setPreviewWallet(w)}
                                        title="Lihat QRIS"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            margin: '8px auto',
                                            display: 'block',
                                            borderRadius: '8px',
                                            transition: 'opacity 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                    >
                                        <img
                                            src={w.qrisQrUrl}
                                            alt={`QRIS ${w.label}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'contain',
                                                display: 'block',
                                                borderRadius: '6px',
                                                border: '2px solid rgba(0,0,0,0.08)',
                                            }}
                                        />
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.65rem',
                                            color: '#888',
                                            marginTop: '4px',
                                            letterSpacing: '0.5px',
                                        }}>
                                            🔍 Tap untuk perbesar
                                        </span>
                                    </button>
                                ) : null}

                                {/* Account info */}
                                <p className={styles.ewalletPhone}>{w.accountNumber}</p>
                                <p style={{ fontSize: '0.8rem', marginBottom: '8px' }}>{w.accountName}</p>

                                {/* Copy button */}
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

            {/* QRIS Lightbox */}
            {previewWallet?.qrisQrUrl && (
                <QrisLightbox
                    wallet={previewWallet}
                    onClose={() => setPreviewWallet(null)}
                />
            )}
        </>
    );
}
