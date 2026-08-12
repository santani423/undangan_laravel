import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    LoaderCircle,
    Search,
    Wallet,
    XCircle,
} from 'lucide-react';
import { type ElementType, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
    { title: 'Pembayaran Masuk', href: '/admin/transactions/payments' },
];

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

interface AdminPayment {
    id: number;
    payment_gateway: string;
    gateway_reference_id: string;
    amount: number;
    fee: number;
    currency: string;
    status: PaymentStatus;
    error_message: string | null;
    webhook_received_at: string | null;
    webhook_verified_at: string | null;
    created_at: string;
    transaction: {
        id: number;
        invoice_number: string;
        status: string;
    } | null;
    customer: {
        id: number;
        name: string;
        email: string;
        phone_number: string | null;
    } | null;
    invitation: {
        id: number;
        slug: string;
        title: string;
        status: string;
    } | null;
    package: {
        name: string;
        label: string;
    } | null;
}

interface PaymentSummary {
    total: number;
    pending: number;
    success: number;
    failed: number;
    gross_success: number;
}

interface Props {
    payments: AdminPayment[];
    summary: PaymentSummary;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: ElementType; className: string }> = {
    pending: {
        label: 'Menunggu',
        icon: Clock,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    processing: {
        label: 'Diproses',
        icon: LoaderCircle,
        className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    },
    success: {
        label: 'Berhasil',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    failed: {
        label: 'Gagal',
        icon: XCircle,
        className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    cancelled: {
        label: 'Dibatalkan',
        icon: XCircle,
        className: 'bg-muted text-muted-foreground',
    },
};

const statusOptions: { value: 'all' | PaymentStatus; label: string }[] = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'processing', label: 'Diproses' },
    { value: 'success', label: 'Berhasil' },
    { value: 'failed', label: 'Gagal' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

function formatCurrency(amount: number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDateTime(value: string | null): string {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusMeta(status: PaymentStatus) {
    return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

function StatusBadge({ status }: { status: PaymentStatus }) {
    const meta = statusMeta(status);
    const Icon = meta.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${meta.className}`}>
            <Icon className="size-3" />
            {meta.label}
        </span>
    );
}

function SummaryCard({
    title,
    value,
    note,
    icon: Icon,
    iconClassName,
}: {
    title: string;
    value: string | number;
    note: string;
    icon: ElementType;
    iconClassName: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 truncate text-2xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function PaymentRow({
    payment,
    confirming,
    onConfirm,
}: {
    payment: AdminPayment;
    confirming: boolean;
    onConfirm: (payment: AdminPayment) => void;
}) {
    const canConfirm = payment.status === 'pending' || payment.status === 'processing';

    return (
        <tr className="transition-colors hover:bg-muted/20">
            <td className="px-4 py-4 align-top">
                <div className="min-w-48">
                    <p className="text-sm font-semibold text-foreground">{payment.customer?.name ?? 'Customer'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{payment.customer?.email ?? '-'}</p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="min-w-40">
                    <p className="font-mono text-xs font-semibold text-foreground">{payment.transaction?.invoice_number ?? '-'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{payment.invitation?.title ?? '-'}</p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="min-w-32">
                    <p className="text-sm font-medium text-foreground capitalize">{payment.payment_gateway}</p>
                    <p className="mt-0.5 max-w-40 truncate font-mono text-xs text-muted-foreground" title={payment.gateway_reference_id}>
                        {payment.gateway_reference_id}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <StatusBadge status={payment.status} />
                {payment.error_message && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-red-600">
                        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                        <span className="line-clamp-2">{payment.error_message}</span>
                    </p>
                )}
            </td>
            <td className="px-4 py-4 align-top">
                <p className="whitespace-nowrap text-sm font-bold text-foreground">{formatCurrency(payment.amount, payment.currency)}</p>
                {payment.fee > 0 && <p className="mt-0.5 text-xs text-muted-foreground">Fee {formatCurrency(payment.fee, payment.currency)}</p>}
            </td>
            <td className="px-4 py-4 align-top">
                <p className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(payment.created_at)}</p>
                {payment.webhook_verified_at && (
                    <p className="mt-0.5 whitespace-nowrap text-xs text-emerald-600">Terverifikasi {formatDateTime(payment.webhook_verified_at)}</p>
                )}
            </td>
            <td className="px-4 py-4 align-top">
                {canConfirm ? (
                    <button
                        type="button"
                        onClick={() => onConfirm(payment)}
                        disabled={confirming}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {confirming ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        {confirming ? 'Memproses' : 'Konfirmasi'}
                    </button>
                ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                )}
            </td>
        </tr>
    );
}

export default function AdminPayments({ payments, summary }: Props) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | PaymentStatus>('all');
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const filteredPayments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return payments.filter((payment) => {
            const matchesStatus = status === 'all' || payment.status === status;

            if (!matchesStatus) return false;
            if (!normalizedQuery) return true;

            const haystack = [
                payment.gateway_reference_id,
                payment.payment_gateway,
                payment.transaction?.invoice_number,
                payment.customer?.name,
                payment.customer?.email,
                payment.invitation?.title,
                payment.invitation?.slug,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [query, status, payments]);

    function handleConfirm(payment: AdminPayment) {
        const confirmed = confirm(`Konfirmasi pembayaran ${payment.gateway_reference_id} sebesar ${formatCurrency(payment.amount, payment.currency)}?`);

        if (!confirmed) return;

        setConfirmingId(payment.id);

        router.patch(
            route('admin.transactions.payments.confirm', { payment: payment.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setConfirmingId(null),
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Masuk" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pembayaran Masuk</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Riwayat pembayaran dari payment gateway (Xendit) dan konfirmasi manual. Pembayaran yang masih menunggu bisa dikonfirmasi
                        manual jika webhook gateway belum masuk.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Pembayaran"
                        value={summary.total}
                        note="Semua percobaan pembayaran"
                        icon={CreditCard}
                        iconClassName="bg-primary/10 text-primary"
                    />
                    <SummaryCard
                        title="Menunggu"
                        value={summary.pending}
                        note="Perlu dipantau / dikonfirmasi"
                        icon={Clock}
                        iconClassName="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        title="Berhasil"
                        value={summary.success}
                        note={formatCurrency(summary.gross_success)}
                        icon={CheckCircle2}
                        iconClassName="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        title="Gagal/Dibatalkan"
                        value={summary.failed}
                        note="Perlu ditinjau"
                        icon={XCircle}
                        iconClassName="bg-red-100 text-red-600"
                    />
                </div>

                <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Wallet className="size-4 text-primary" />
                                Daftar Pembayaran
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {filteredPayments.length} dari {payments.length} pembayaran
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="relative min-w-0 sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari referensi, invoice, customer..."
                                    className="w-full rounded-lg border border-border/60 bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                                />
                            </label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value as 'all' | PaymentStatus)}
                                className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/30"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Banknote className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Belum Ada Pembayaran</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Pembayaran dari customer akan muncul di halaman ini.</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Search className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Data Tidak Ditemukan</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau status pembayaran.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Customer', 'Invoice / Undangan', 'Gateway', 'Status', 'Jumlah', 'Waktu', 'Aksi'].map((heading) => (
                                            <th
                                                key={heading}
                                                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredPayments.map((payment) => (
                                        <PaymentRow
                                            key={payment.id}
                                            payment={payment}
                                            confirming={confirmingId === payment.id}
                                            onConfirm={handleConfirm}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
