import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    BookHeart,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Receipt,
    XCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRecord {
    id: number;
    payment_gateway: string;
    gateway_reference_id: string;
    gateway_order_id: string;
    amount: string;
    fee: string | null;
    currency: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
    error_code: string | null;
    error_message: string | null;
    webhook_received_at: string | null;
    created_at: string;
}

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
    due_date: string | null;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    invitation: { id: number; slug: string; title: string; status: string } | null;
    package: { id: number; label: string; description: string } | null;
    payments: PaymentRecord[];
    payment_url: string | null;
}

interface Props {
    transaction: TransactionData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
        Number(amount),
    );
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TX_STATUS_CONFIG = {
    pending:   { label: 'Menunggu Pembayaran', icon: Clock,        class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    paid:      { label: 'Lunas',               icon: CheckCircle2, class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    failed:    { label: 'Gagal',               icon: XCircle,      class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Dibatalkan',          icon: XCircle,      class: 'bg-muted text-muted-foreground' },
    expired:   { label: 'Kadaluarsa',         icon: XCircle,      class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
} as const;

const PAY_STATUS_CONFIG = {
    pending:    { label: 'Menunggu', class: 'text-amber-600' },
    processing: { label: 'Diproses', class: 'text-blue-600' },
    success:    { label: 'Berhasil', class: 'text-emerald-600' },
    failed:     { label: 'Gagal',    class: 'text-red-600' },
    cancelled:  { label: 'Dibatalkan', class: 'text-muted-foreground' },
} as const;

const GATEWAY_LABEL: Record<string, string> = {
    xendit:   'Xendit',
    midtrans: 'Midtrans',
    manual:   'Manual',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsShow({ transaction: tx }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Transaksi', href: '/customer/transactions' },
        { title: tx.invoice_number, href: '#' },
    ];

    const txCfg = TX_STATUS_CONFIG[tx.status] ?? TX_STATUS_CONFIG.pending;
    const TxIcon = txCfg.icon;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaksi ${tx.invoice_number}`} />

            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/customer/transactions"
                        className="size-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Detail Transaksi</h1>
                        <p className="font-mono text-sm text-muted-foreground mt-0.5">{tx.invoice_number}</p>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`rounded-2xl p-4 flex items-center gap-3 ${txCfg.class}`}>
                    <TxIcon className="size-5 shrink-0" />
                    <div>
                        <p className="font-semibold">{txCfg.label}</p>
                        {tx.paid_at && (
                            <p className="text-xs mt-0.5 opacity-80">Dibayar pada {formatDate(tx.paid_at)}</p>
                        )}
                    </div>
                    {tx.status === 'pending' && tx.payment_url && (
                        <a
                            href={tx.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-600 transition-colors"
                        >
                            <ExternalLink className="size-3" /> Bayar Sekarang
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Invoice Detail */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                            <Receipt className="size-4" /> Invoice
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">No. Invoice</span>
                                <span className="font-mono text-xs font-medium">{tx.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal Dibuat</span>
                                <span>{formatDate(tx.created_at)}</span>
                            </div>
                            {tx.due_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jatuh Tempo</span>
                                    <span>{new Date(tx.due_date).toLocaleDateString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-border">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-lg">
                                    {formatCurrency(tx.invoice_amount, tx.invoice_currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Invitation & Package */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                            <BookHeart className="size-4" /> Pesanan
                        </h2>
                        <div className="space-y-3 text-sm">
                            {tx.invitation && (
                                <div>
                                    <span className="text-muted-foreground block mb-1">Undangan</span>
                                    <Link
                                        href={`/customer/invitations/${tx.invitation.slug}/detail`}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {tx.invitation.title}
                                    </Link>
                                </div>
                            )}
                            {tx.package && (
                                <div>
                                    <span className="text-muted-foreground block mb-1">Paket</span>
                                    <span className="font-medium">{tx.package.label}</span>
                                    {tx.package.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {tx.package.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {tx.status === 'pending' && tx.invitation && (
                            <Link
                                href={`/customer/invitations/${tx.invitation.slug}/payment`}
                                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <CreditCard className="size-4" /> Halaman Pembayaran
                            </Link>
                        )}
                    </div>
                </div>

                {/* Payment Attempts */}
                {tx.payments.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                            <CreditCard className="size-4" /> Riwayat Pembayaran
                        </h2>
                        <div className="space-y-3">
                            {tx.payments.map((p) => {
                                const pCfg = PAY_STATUS_CONFIG[p.status] ?? PAY_STATUS_CONFIG.pending;
                                return (
                                    <div key={p.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <BadgeCheck className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{GATEWAY_LABEL[p.payment_gateway] ?? p.payment_gateway}</span>
                                            </div>
                                            <span className={`font-semibold ${pCfg.class}`}>{pCfg.label}</span>
                                        </div>
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            <div className="flex justify-between">
                                                <span>Jumlah</span>
                                                <span className="text-foreground font-medium">{formatCurrency(p.amount, p.currency)}</span>
                                            </div>
                                            {p.fee && (
                                                <div className="flex justify-between">
                                                    <span>Biaya Layanan</span>
                                                    <span>{formatCurrency(p.fee, p.currency)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Tanggal</span>
                                                <span>{formatDate(p.created_at)}</span>
                                            </div>
                                            {p.webhook_received_at && (
                                                <div className="flex justify-between">
                                                    <span>Dikonfirmasi</span>
                                                    <span>{formatDate(p.webhook_received_at)}</span>
                                                </div>
                                            )}
                                            {p.error_message && (
                                                <div className="mt-1 text-red-600 dark:text-red-400">
                                                    Error: {p.error_message}
                                                </div>
                                            )}
                                        </div>
                                        {p.status === 'pending' && p.gateway_order_id && (
                                            <a
                                                href={p.gateway_order_id}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                            >
                                                <ExternalLink className="size-3" /> Buka Halaman Pembayaran
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
