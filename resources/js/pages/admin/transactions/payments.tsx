import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Eye,
    Package2,
    Receipt,
    User,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
    { title: 'Pembayaran Masuk', href: '/admin/transactions/payments' },
];

type TransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';

interface LatestPayment {
    payment_gateway: string;
    gateway_reference_id: string;
    proof_file_url: string | null;
    proof_is_pdf: boolean;
}

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
    latest_payment: LatestPayment | null;
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
        <div className="border-border/60 bg-card rounded-2xl border p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-muted-foreground text-xs font-medium">{label}</p>
                    <p className="text-foreground mt-1 text-2xl font-bold">{value}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{helper}</p>
                </div>
                <div className={`rounded-xl p-3 ${className}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function FilePreviewModal({ src, isPdf, title, onClose }: { src: string; isPdf: boolean; title: string; onClose: () => void }) {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="bg-card flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-border flex items-center justify-between border-b px-5 py-3">
                    <h3 className="text-foreground text-sm font-semibold">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                        aria-label="Tutup"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="bg-muted/20 overflow-auto p-4">
                    {isPdf ? (
                        <iframe src={src} title={title} className="border-border h-[70vh] w-full rounded-lg border bg-white" />
                    ) : (
                        <img src={src} alt={title} className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
                    )}
                </div>
            </div>
        </div>
    );
}

function PendingPaymentCard({ tx, onPreview }: { tx: TransactionData; onPreview: (payment: LatestPayment) => void }) {
    return (
        <div className="border-border/60 bg-card rounded-2xl border p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-foreground truncate text-sm font-semibold">{tx.invitation?.title ?? 'Pesanan Undangan'}</h3>
                        <Badge variant="outline" className="border-transparent bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Perlu Dibayar
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 truncate font-mono text-xs">{tx.invoice_number}</p>
                    <div className="text-muted-foreground mt-3 grid gap-2 text-xs">
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
                    <p className="text-foreground text-base font-bold">{formatCurrency(tx.invoice_amount, tx.invoice_currency)}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{tx.payment_count.toLocaleString('id-ID')} riwayat pembayaran</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                >
                    Detail <ArrowRight className="size-3.5" />
                </Link>
                {tx.payment_url ? (
                    <a
                        href={tx.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                        <ExternalLink className="size-4" />
                        Buka Invoice
                    </a>
                ) : tx.latest_payment?.proof_file_url ? (
                    <button
                        type="button"
                        onClick={() => onPreview(tx.latest_payment!)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                        <Eye className="size-4" />
                        Lihat Bukti Transfer
                    </button>
                ) : (
                    <span className="bg-muted text-muted-foreground inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
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
    const [previewPayment, setPreviewPayment] = useState<LatestPayment | null>(null);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Masuk" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold">Pembayaran Masuk</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Daftar transaksi yang masih menunggu pembayaran. Dari sini admin bisa membuka invoice dan melihat detail pesanan.
                        </p>
                    </div>
                    <Link
                        href="/admin/transactions"
                        className="border-border/60 bg-card text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors"
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
                    <div className="border-border/60 bg-card rounded-2xl border border-dashed px-6 py-16 text-center shadow-sm">
                        <CreditCard className="text-muted-foreground/40 mx-auto size-10" />
                        <h3 className="text-foreground mt-4 text-sm font-semibold">Tidak ada transaksi pending</h3>
                        <p className="text-muted-foreground mt-1 text-sm">Saat ini semua transaksi sudah dibayar, dikonfirmasi, atau dibatalkan.</p>
                        <Link
                            href="/admin/transactions"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                        >
                            <Receipt className="size-4" />
                            Kembali ke Semua Transaksi
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {pendingTransactions.map((transaction) => (
                            <PendingPaymentCard key={transaction.id} tx={transaction} onPreview={setPreviewPayment} />
                        ))}
                    </div>
                )}
            </div>

            {previewPayment?.proof_file_url && (
                <FilePreviewModal
                    src={previewPayment.proof_file_url}
                    isPdf={previewPayment.proof_is_pdf}
                    title={`Bukti Transfer — ${previewPayment.gateway_reference_id}`}
                    onClose={() => setPreviewPayment(null)}
                />
            )}
        </AdminLayout>
    );
}
