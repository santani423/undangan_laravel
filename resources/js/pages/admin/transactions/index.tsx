import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Banknote,
    BarChart3,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    FileText,
    Loader2,
    Package2,
    Receipt,
    ShieldCheck,
    User,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
];

type TransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

interface PaymentRecord {
    id: number;
    payment_gateway: string;
    gateway_reference_id: string;
    gateway_order_id: string | null;
    amount: string;
    fee: string | null;
    currency: string;
    status: PaymentStatus;
    error_code: string | null;
    error_message: string | null;
    webhook_received_at: string | null;
    webhook_verified_at: string | null;
    created_at: string;
}

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: TransactionStatus;
    due_date: string | null;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    payment_count: number;
    latest_payment: PaymentRecord | null;
    payment_url: string | null;
    user: { id: number; name: string; email: string } | null;
    invitation: { id: number; slug: string; title: string; status: string } | null;
    package: { id: number; label: string; description: string | null; duration_days: number } | null;
    payments: PaymentRecord[];
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
    transactions: TransactionData[];
    pendingTransactions: TransactionData[];
    summary: SummaryData;
    selectedTransactionId: number | null;
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

const STATUS_META: Record<TransactionStatus, { label: string; icon: React.ElementType; className: string }> = {
    pending: { label: 'Menunggu Pembayaran', icon: Clock, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    paid: { label: 'Lunas', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    failed: { label: 'Gagal', icon: XCircle, className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    cancelled: { label: 'Dibatalkan', icon: XCircle, className: 'bg-muted text-muted-foreground' },
    expired: { label: 'Kadaluarsa', icon: XCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Menunggu', className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
    processing: { label: 'Diproses', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    success: { label: 'Berhasil', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    failed: { label: 'Gagal', className: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' },
    cancelled: { label: 'Dibatalkan', className: 'bg-muted text-muted-foreground' },
};

const GATEWAY_LABEL: Record<string, string> = {
    xendit: 'Xendit',
    midtrans: 'Midtrans',
    tripay: 'Tripay',
    manual: 'Manual',
};

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(amount));
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

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function FlashBanner() {
    const { flash } = usePage<PageProps>().props;
    const message = flash?.success || flash?.error || null;
    const isSuccess = !!flash?.success;
    const [visible, setVisible] = useState(false);
    const lastMessage = useRef<string | null>(null);

    useEffect(() => {
        if (message && message !== lastMessage.current) {
            lastMessage.current = message;
            setVisible(true);

            const timer = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div
            className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
        >
            <span className="flex items-center gap-2">
                {isSuccess ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                {message}
            </span>
            <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 transition-opacity hover:opacity-100">
                x
            </button>
        </div>
    );
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

function StatusBadge({ status }: { status: TransactionStatus }) {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={`inline-flex items-center gap-1.5 border-transparent px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}>
            <Icon className="size-3" />
            {meta.label}
        </Badge>
    );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
    const meta = PAYMENT_META[status] ?? PAYMENT_META.pending;

    return <Badge variant="outline" className={`border-transparent px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}>{meta.label}</Badge>;
}

function GatewayLabel({ value }: { value: string }) {
    return <span className="font-medium text-foreground">{GATEWAY_LABEL[value] ?? value}</span>;
}

function DetailRow({
    label,
    value,
    compact = false,
}: {
    label: string;
    value: string | React.ReactNode;
    compact?: boolean;
}) {
    return (
        <div className={`flex items-start justify-between gap-4 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-foreground">{value}</span>
        </div>
    );
}

function TransactionRow({ tx, selected }: { tx: TransactionData; selected: boolean }) {
    const latestPayment = tx.latest_payment;

    return (
        <Link
            href={`/admin/transactions/${tx.id}`}
            preserveScroll
            className={`group block rounded-2xl border p-4 transition-all ${
                selected
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : 'border-border/60 bg-card hover:border-primary/20 hover:bg-muted/30'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            {tx.invitation?.title ?? 'Pesanan Undangan'}
                        </h3>
                        <StatusBadge status={tx.status} />
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{tx.invoice_number}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <User className="size-3.5" />
                            {tx.user?.name ?? 'Pengguna'}
                        </span>
                        <span className="text-muted-foreground/50">-</span>
                        <span className="inline-flex items-center gap-1">
                            <Package2 className="size-3.5" />
                            {tx.package?.label ?? 'Paket tidak ditemukan'}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {latestPayment ? (
                            <>
                                <span className="inline-flex items-center gap-1">
                                    <Banknote className="size-3.5" />
                                    {GATEWAY_LABEL[latestPayment.payment_gateway] ?? latestPayment.payment_gateway}
                                </span>
                                <span className="text-muted-foreground/50">-</span>
                                <PaymentBadge status={latestPayment.status} />
                            </>
                        ) : (
                            <span className="inline-flex items-center gap-1">
                                <CreditCard className="size-3.5" />
                                Belum ada riwayat pembayaran
                            </span>
                        )}
                        {tx.payment_count > 0 && (
                            <>
                                <span className="text-muted-foreground/50">-</span>
                                <span className="inline-flex items-center gap-1">
                                    <FileText className="size-3.5" />
                                    {tx.payment_count} riwayat
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-foreground">{formatCurrency(tx.invoice_amount, tx.invoice_currency)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {tx.paid_at
                            ? `Dibayar ${formatDateTime(tx.paid_at)}`
                            : tx.due_date
                                ? `Jatuh tempo ${formatDate(tx.due_date)}`
                                : `Dibuat ${formatDateTime(tx.created_at)}`}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5">
                        Lihat detail <ArrowRight className="size-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

function PendingPaymentCard({ tx }: { tx: TransactionData }) {
    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-amber-950 dark:text-amber-50">
                            {tx.invitation?.title ?? 'Pesanan Undangan'}
                        </h3>
                        <Badge variant="outline" className="border-transparent bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Perlu Dibayar
                        </Badge>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-amber-900/70 dark:text-amber-200/70">
                        {tx.invoice_number}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-amber-900/70 dark:text-amber-200/70">
                        <p>{tx.user?.name ?? 'Pengguna'} - {tx.package?.label ?? 'Paket tidak ditemukan'}</p>
                        <p>{tx.due_date ? `Jatuh tempo ${formatDate(tx.due_date)}` : `Dibuat ${formatDateTime(tx.created_at)}`}</p>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-amber-950 dark:text-amber-50">
                        {formatCurrency(tx.invoice_amount, tx.invoice_currency)}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-900/70 dark:text-amber-200/70">Menunggu konfirmasi pembayaran</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-900/40 dark:bg-background dark:text-amber-200 dark:hover:bg-amber-950/40"
                >
                    Detail <ArrowRight className="size-3.5" />
                </Link>
                {tx.payment_url ? (
                    <a
                        href={tx.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                    >
                        <ExternalLink className="size-3.5" />
                        Buka Invoice
                    </a>
                ) : (
                    <span className="inline-flex items-center justify-center rounded-xl bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Menunggu URL invoice
                    </span>
                )}
            </div>
        </div>
    );
}

export default function AdminTransactionsIndex() {
    const { transactions, pendingTransactions, summary, selectedTransactionId } = usePage<PageProps>().props;
    const [actioning, setActioning] = useState<'approve' | 'reject' | null>(null);

    const activeTransactionId = selectedTransactionId ?? transactions[0]?.id ?? null;
    const activeTransaction = transactions.find((transaction) => transaction.id === activeTransactionId) ?? null;

    function handleApprove() {
        if (!activeTransaction) return;

        setActioning('approve');
        router.patch(
            `/admin/transactions/${activeTransaction.id}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setActioning(null),
            },
        );
    }

    function handleReject() {
        if (!activeTransaction) return;

        setActioning('reject');
        router.patch(
            `/admin/transactions/${activeTransaction.id}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setActioning(null),
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Transaksi" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Semua Transaksi</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pantau seluruh pesanan undangan, lihat detail transaksi, dan konfirmasi atau tolak manual dari satu panel.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        Aksi manual hanya aktif untuk transaksi pending
                    </div>
                </div>

                <FlashBanner />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        label="Total Transaksi"
                        value={summary.total.toLocaleString('id-ID')}
                        helper="Semua transaksi yang tercatat"
                        icon={BarChart3}
                        className="bg-sky-100 text-sky-700"
                    />
                    <SummaryCard
                        label="Pending Review"
                        value={summary.pending.toLocaleString('id-ID')}
                        helper="Menunggu pembayaran"
                        icon={Clock}
                        className="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        label="Transaksi Lunas"
                        value={summary.paid.toLocaleString('id-ID')}
                        helper="Sudah dikonfirmasi berhasil"
                        icon={CheckCircle2}
                        className="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        label="Ditolak / Gagal"
                        value={summary.rejected.toLocaleString('id-ID')}
                        helper="Gagal, expired, atau ditolak"
                        icon={XCircle}
                        className="bg-rose-100 text-rose-700"
                    />
                    <SummaryCard
                        label="Total Pendapatan"
                        value={formatCurrency(summary.revenue)}
                        helper="Akumulasi transaksi paid"
                        icon={Wallet}
                        className="bg-emerald-100 text-emerald-700"
                    />
                </div>

                {pendingTransactions.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-background p-5 shadow-sm dark:border-amber-900/30 dark:from-amber-950/20 dark:to-background">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Transaksi Perlu Dibayar</h2>
                                <p className="text-sm text-muted-foreground">
                                    {pendingTransactions.length.toLocaleString('id-ID')} transaksi menunggu pembayaran dengan total tagihan {formatCurrency(summary.pending_amount)}.
                                </p>
                            </div>
                            <Badge variant="outline" className="border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/30 dark:text-amber-300">
                                {summary.pending.toLocaleString('id-ID')} pending
                            </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                            {pendingTransactions.map((transaction) => (
                                <PendingPaymentCard key={transaction.id} tx={transaction} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Daftar Transaksi</h2>
                                <p className="text-sm text-muted-foreground">
                                    Klik salah satu transaksi untuk membuka detail di panel kanan.
                                </p>
                            </div>
                            <Badge variant="outline" className="border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                {transactions.length.toLocaleString('id-ID')} data
                            </Badge>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/60 bg-card px-6 py-14 text-center shadow-sm">
                                <CreditCard className="mx-auto size-10 text-muted-foreground/40" />
                                <h3 className="mt-4 text-sm font-semibold text-foreground">Belum ada transaksi</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Semua transaksi pesanan undangan akan muncul di sini setelah ada pembayaran.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {transactions.map((transaction) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        tx={transaction}
                                        selected={transaction.id === activeTransactionId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                        {!activeTransaction ? (
                            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-muted p-3">
                                        <Receipt className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Detail Transaksi</h2>
                                        <p className="text-sm text-muted-foreground">Pilih salah satu transaksi untuk melihat detail lengkapnya.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Detail Transaksi</p>
                                            <h2 className="mt-2 text-xl font-bold text-foreground">{activeTransaction.invoice_number}</h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {activeTransaction.invitation?.title ?? 'Pesanan undangan'}
                                            </p>
                                        </div>
                                        <StatusBadge status={activeTransaction.status} />
                                    </div>

                                    <div
                                        className={`mt-4 rounded-2xl p-4 ${
                                            activeTransaction.status === 'pending'
                                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                                : activeTransaction.status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                    : activeTransaction.status === 'failed'
                                                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
                                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-background/70 p-2">
                                                {activeTransaction.status === 'paid' ? (
                                                    <CheckCircle2 className="size-5" />
                                                ) : activeTransaction.status === 'failed' ? (
                                                    <XCircle className="size-5" />
                                                ) : (
                                                    <Clock className="size-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold">{STATUS_META[activeTransaction.status].label}</p>
                                                <p className="mt-0.5 text-xs opacity-80">
                                                    {activeTransaction.status === 'pending'
                                                        ? 'Siap diverifikasi manual oleh admin.'
                                                        : activeTransaction.status === 'paid'
                                                            ? 'Transaksi sudah berhasil dikonfirmasi.'
                                                            : 'Transaksi sudah diproses dan tidak bisa diubah lagi.'}
                                                </p>
                                            </div>
                                        </div>

                                        {activeTransaction.status === 'pending' && (
                                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                <Button
                                                    type="button"
                                                    onClick={handleApprove}
                                                    disabled={actioning !== null}
                                                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    {actioning === 'approve' ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin" />
                                                            Memproses...
                                                        </>
                                                    ) : (
                                                        'Konfirmasi Berhasil'
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleReject}
                                                    disabled={actioning !== null}
                                                    className="flex-1"
                                                >
                                                    {actioning === 'reject' ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin" />
                                                            Memproses...
                                                        </>
                                                    ) : (
                                                        'Tolak'
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            <Receipt className="size-4" />
                                            Invoice
                                        </h3>
                                        <div className="space-y-3">
                                            <DetailRow label="No. Invoice" value={<span className="font-mono text-xs">{activeTransaction.invoice_number}</span>} />
                                            <DetailRow label="Total" value={formatCurrency(activeTransaction.invoice_amount, activeTransaction.invoice_currency)} />
                                            <DetailRow label="Dibuat" value={formatDateTime(activeTransaction.created_at)} />
                                            <DetailRow label="Jatuh Tempo" value={activeTransaction.due_date ? formatDate(activeTransaction.due_date) : '-'} />
                                            <DetailRow label="Dibayar" value={activeTransaction.paid_at ? formatDateTime(activeTransaction.paid_at) : 'Belum dibayar'} />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            <User className="size-4" />
                                            Customer & Pesanan
                                        </h3>
                                        <div className="space-y-3">
                                            <DetailRow label="Nama Customer" value={activeTransaction.user?.name ?? '-'} />
                                            <DetailRow label="Email" value={activeTransaction.user?.email ?? '-'} />
                                            <DetailRow label="Undangan" value={activeTransaction.invitation?.title ?? '-'} />
                                            <DetailRow label="Status Undangan" value={activeTransaction.invitation?.status ?? '-'} />
                                            <DetailRow label="Paket" value={activeTransaction.package?.label ?? '-'} />
                                            <DetailRow
                                                label="Durasi Paket"
                                                value={activeTransaction.package?.duration_days ? `${activeTransaction.package.duration_days} hari` : '-'}
                                            />
                                        </div>

                                        {activeTransaction.package?.description && (
                                            <div className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deskripsi Paket</p>
                                                <p className="mt-1 leading-6 text-foreground/80">{activeTransaction.package.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            <FileText className="size-4" />
                                            Riwayat Pembayaran
                                        </h3>
                                        <Badge variant="outline" className="border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                            {activeTransaction.payment_count.toLocaleString('id-ID')} pembayaran
                                        </Badge>
                                    </div>

                                    {activeTransaction.status === 'pending' && activeTransaction.latest_payment?.gateway_order_id && (
                                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                                            <div className="flex items-start gap-2">
                                                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                                <p>
                                                    Invoice pembayaran masih aktif. Admin bisa membuka halaman pembayaran untuk verifikasi manual.
                                                </p>
                                            </div>
                                            <a
                                                href={activeTransaction.latest_payment.gateway_order_id}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold underline-offset-4 hover:underline"
                                            >
                                                <ExternalLink className="size-3.5" />
                                                Buka invoice
                                            </a>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-3">
                                        {activeTransaction.payments.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                                                Belum ada riwayat pembayaran untuk transaksi ini.
                                            </div>
                                        ) : (
                                            activeTransaction.payments.map((payment) => (
                                                <div key={payment.id} className="rounded-xl border border-border/60 bg-background p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                                                                <GatewayLabel value={payment.payment_gateway} />
                                                                <PaymentBadge status={payment.status} />
                                                            </div>
                                                            <p className="mt-1 font-mono text-xs text-muted-foreground">{payment.gateway_reference_id}</p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {formatCurrency(payment.amount, payment.currency)}
                                                            </p>
                                                            {payment.fee !== null && Number(payment.fee) > 0 && (
                                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                                    Fee {formatCurrency(payment.fee, payment.currency)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                                        <DetailRow label="Dibuat" value={formatDateTime(payment.created_at)} compact />
                                                        <DetailRow
                                                            label="Webhook diterima"
                                                            value={formatDateTime(payment.webhook_received_at)}
                                                            compact
                                                        />
                                                        <DetailRow
                                                            label="Webhook diverifikasi"
                                                            value={formatDateTime(payment.webhook_verified_at)}
                                                            compact
                                                        />
                                                        <DetailRow
                                                            label="Gateway Order URL"
                                                            value={payment.gateway_order_id ? 'Ada' : 'Tidak ada'}
                                                            compact
                                                        />
                                                    </div>

                                                    {payment.error_message && (
                                                        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                                                            <span className="font-semibold">Error:</span> {payment.error_message}
                                                        </div>
                                                    )}

                                                    {payment.gateway_order_id && payment.status === 'pending' && (
                                                        <a
                                                            href={payment.gateway_order_id}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                            Buka halaman pembayaran
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {activeTransaction.notes && (
                                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            <FileText className="size-4" />
                                            Catatan
                                        </h3>
                                        <p className="rounded-xl bg-muted/60 p-3 text-sm leading-6 text-foreground/80">
                                            {activeTransaction.notes}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
