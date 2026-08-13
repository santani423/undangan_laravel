import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Package2,
    Receipt,
    User,
    Wallet,
    AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
    { title: 'Pembayaran Masuk', href: '/admin/transactions/payments' },
];

type TransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: TransactionStatus;
    due_date: string | null;
    paid_at: string | null;
    created_at: string;
    payment_count: number;
    payment_url: string | null;
    user: { id: number; name: string; email: string } | null;
    invitation: { id: number; slug: string; title: string; status: string } | null;
    package: { id: number; label: string; description: string | null; duration_days: number } | null;
}

interface SummaryData {
    total: number;
    pending: number;
    pending_amount: number;
    paid: number;
    rejected: number;
    revenue: number;
}

interface PageProps {
    pendingTransactions: TransactionData[];
    summary: SummaryData;
    [key: string]: unknown;
}

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(amount));
}

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function SummaryCard({
    label,
    value,
    helper,
    icon: Icon,
    className,
}: {
    label: string;
    value: string;
    helper: string;
    icon: React.ElementType;
    className: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                </div>
                <div className={`rounded-xl p-3 ${className}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function PendingPaymentCard({ tx }: { tx: TransactionData }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            {tx.invitation?.title ?? 'Pesanan Undangan'}
                        </h3>
                        <Badge variant="outline" className="border-transparent bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Perlu Dibayar
                        </Badge>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{tx.invoice_number}</p>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <p className="inline-flex items-center gap-1.5">
                            <User className="size-3.5" />
                            {tx.user?.name ?? 'Pengguna'}
                        </p>
                        <p className="inline-flex items-center gap-1.5">
                            <Package2 className="size-3.5" />
                            {tx.package?.label ?? 'Paket tidak ditemukan'}
                        </p>
                        <p className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {tx.due_date ? `Jatuh tempo ${formatDate(tx.due_date)}` : `Dibuat ${formatDateTime(tx.created_at)}`}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-foreground">{formatCurrency(tx.invoice_amount, tx.invoice_currency)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {tx.payment_count.toLocaleString('id-ID')} riwayat pembayaran
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Detail <ArrowRight className="size-3.5" />
                </Link>
                {tx.payment_url ? (
                    <a
                        href={tx.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <ExternalLink className="size-4" />
                        Buka Invoice
                    </a>
                ) : (
                    <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">
                        <AlertCircle className="size-4" />
                        Invoice belum tersedia
                    </span>
                )}
            </div>
        </div>
    );
}

export default function AdminPayments() {
    const { pendingTransactions, summary } = usePage<PageProps>().props;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Masuk" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Pembayaran Masuk</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Daftar transaksi yang masih menunggu pembayaran. Dari sini admin bisa membuka invoice dan melihat detail pesanan.
                        </p>
                    </div>
                    <Link
                        href="/admin/transactions"
                        className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                    >
                        <Receipt className="size-4" />
                        Lihat Semua Transaksi
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Menunggu Bayar"
                        value={summary.pending.toLocaleString('id-ID')}
                        helper="Transaksi yang belum selesai dibayar"
                        icon={Clock}
                        className="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        label="Total Tagihan Pending"
                        value={formatCurrency(summary.pending_amount)}
                        helper="Akumulasi transaksi pending"
                        icon={Wallet}
                        className="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        label="Transaksi Lunas"
                        value={summary.paid.toLocaleString('id-ID')}
                        helper="Sudah terkonfirmasi berhasil"
                        icon={CheckCircle2}
                        className="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        label="Semua Transaksi"
                        value={summary.total.toLocaleString('id-ID')}
                        helper="Seluruh pesanan yang tercatat"
                        icon={Banknote}
                        className="bg-sky-100 text-sky-700"
                    />
                </div>

                {pendingTransactions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-card px-6 py-16 text-center shadow-sm">
                        <CreditCard className="mx-auto size-10 text-muted-foreground/40" />
                        <h3 className="mt-4 text-sm font-semibold text-foreground">Tidak ada transaksi pending</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Saat ini semua transaksi sudah dibayar, dikonfirmasi, atau dibatalkan.
                        </p>
                        <Link
                            href="/admin/transactions"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Receipt className="size-4" />
                            Kembali ke Semua Transaksi
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {pendingTransactions.map((transaction) => (
                            <PendingPaymentCard key={transaction.id} tx={transaction} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
