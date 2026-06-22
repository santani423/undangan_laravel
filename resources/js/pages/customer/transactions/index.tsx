import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookHeart, CheckCircle2, Clock, CreditCard, XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Transaksi', href: '/customer/transactions' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionItem {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
    due_date: string | null;
    paid_at: string | null;
    created_at: string;
    invitation: { slug: string; title: string } | null;
    package: { label: string } | null;
    payment_url: string | null;
}

interface Props {
    transactions: TransactionItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
        Number(amount),
    );
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; class: string }> = {
    pending:   { label: 'Menunggu',    icon: Clock,         class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    paid:      { label: 'Lunas',       icon: CheckCircle2,  class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    failed:    { label: 'Gagal',       icon: XCircle,       class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Dibatalkan',  icon: XCircle,       class: 'bg-muted text-muted-foreground' },
    expired:   { label: 'Kadaluarsa', icon: XCircle,       class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: TransactionItem }) {
    const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Icon */}
            <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <CreditCard className="size-5 text-muted-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm line-clamp-1">
                        {tx.invitation?.title ?? 'Undangan'}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${cfg.class}`}>
                        <Icon className="size-3" />
                        {cfg.label}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.package?.label ?? '—'} · {tx.invoice_number}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.paid_at
                        ? `Dibayar: ${formatDate(tx.paid_at)}`
                        : tx.due_date
                        ? `Jatuh tempo: ${formatDate(tx.due_date)}`
                        : `Dibuat: ${formatDate(tx.created_at)}`}
                </p>
            </div>

            {/* Amount + Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-bold text-foreground">
                    {formatCurrency(tx.invoice_amount, tx.invoice_currency)}
                </span>
                <div className="flex items-center gap-2">
                    {tx.status === 'pending' && tx.payment_url && (
                        <a
                            href={tx.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-600 transition-colors"
                        >
                            Bayar
                        </a>
                    )}
                    {tx.status === 'pending' && !tx.payment_url && tx.invitation && (
                        <Link
                            href={`/customer/invitations/${tx.invitation.slug}/payment`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Bayar
                        </Link>
                    )}
                    <Link
                        href={`/customer/transactions/${tx.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Detail <ArrowRight className="size-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsIndex({ transactions }: Props) {
    const pending = transactions.filter((t) => t.status === 'pending').length;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Transaksi" />
            <div className="flex flex-col gap-6 p-6">

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {transactions.length > 0
                                ? `${transactions.length} transaksi${pending > 0 ? ` · ${pending} menunggu pembayaran` : ''}`
                                : 'Semua riwayat pembayaran Anda.'}
                        </p>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="bg-muted p-4 rounded-2xl mb-4">
                            <CreditCard className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">Belum Ada Transaksi</h3>
                        <p className="text-sm text-muted-foreground mb-4">Riwayat transaksi Anda akan muncul di sini.</p>
                        <Link
                            href="/customer/invitations"
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <BookHeart className="size-4" />
                            Undangan Saya
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {transactions.map((tx) => (
                            <TransactionRow key={tx.id} tx={tx} />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
