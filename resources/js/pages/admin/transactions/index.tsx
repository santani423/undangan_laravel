import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    LoaderCircle,
    ReceiptText,
    Search,
    Users,
    Wallet,
    XCircle,
} from 'lucide-react';
import { type ElementType, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
];

type TransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';

interface AdminTransaction {
    id: number;
    invoice_number: string;
    invoice_amount: number;
    invoice_currency: string;
    status: TransactionStatus;
    due_date: string | null;
    paid_at: string | null;
    created_at: string;
    payments_count: number;
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
        id: number;
        name: string;
        label: string;
    } | null;
}

interface TransactionSummary {
    total: number;
    pending: number;
    paid: number;
    failed: number;
    customers: number;
    paid_revenue: number;
}

interface Props {
    transactions: AdminTransaction[];
    summary: TransactionSummary;
}

const STATUS_CONFIG: Record<TransactionStatus, { label: string; icon: ElementType; className: string }> = {
    pending: {
        label: 'Menunggu',
        icon: Clock,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    paid: {
        label: 'Lunas',
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
    expired: {
        label: 'Kadaluarsa',
        icon: XCircle,
        className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    refunded: {
        label: 'Refund',
        icon: Wallet,
        className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    },
};

const statusOptions: { value: 'all' | TransactionStatus; label: string }[] = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'paid', label: 'Lunas' },
    { value: 'failed', label: 'Gagal' },
    { value: 'cancelled', label: 'Dibatalkan' },
    { value: 'expired', label: 'Kadaluarsa' },
    { value: 'refunded', label: 'Refund' },
];

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(Number(amount));
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

function statusMeta(status: TransactionStatus) {
    return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

function StatusBadge({ status }: { status: TransactionStatus }) {
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

function TransactionRow({
    transaction,
    approving,
    onApprove,
}: {
    transaction: AdminTransaction;
    approving: boolean;
    onApprove: (transaction: AdminTransaction) => void;
}) {
    const isComplete = transaction.status === 'paid' && transaction.invitation?.status === 'active';

    return (
        <tr className="transition-colors hover:bg-muted/20">
            <td className="px-4 py-4 align-top">
                <div className="min-w-48">
                    <p className="text-sm font-semibold text-foreground">{transaction.customer?.name ?? 'Customer'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{transaction.customer?.email ?? '-'}</p>
                    {transaction.customer?.phone_number && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{transaction.customer.phone_number}</p>
                    )}
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="min-w-40">
                    <p className="font-mono text-xs font-semibold text-foreground">{transaction.invoice_number}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {transaction.paid_at
                            ? `Dibayar ${formatDateTime(transaction.paid_at)}`
                            : `Jatuh tempo ${formatDateTime(transaction.due_date)}`}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="min-w-48">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {transaction.invitation?.title ?? '-'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {transaction.invitation ? `${transaction.invitation.slug} - ${transaction.invitation.status}` : '-'}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="min-w-32">
                    <p className="text-sm font-medium text-foreground">{transaction.package?.label ?? '-'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{transaction.package?.name ?? '-'}</p>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <StatusBadge status={transaction.status} />
            </td>
            <td className="px-4 py-4 align-top">
                <p className="whitespace-nowrap text-sm font-bold text-foreground">
                    {formatCurrency(transaction.invoice_amount, transaction.invoice_currency)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{transaction.payments_count} pembayaran</p>
            </td>
            <td className="px-4 py-4 align-top">
                <p className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
            </td>
            <td className="px-4 py-4 align-top">
                {isComplete ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Aktif
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={() => onApprove(transaction)}
                        disabled={!transaction.invitation || approving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {approving ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        {transaction.invitation ? (approving ? 'Memproses' : 'Approve') : 'Tanpa Undangan'}
                    </button>
                )}
            </td>
        </tr>
    );
}

export default function AdminTransactions({ transactions, summary }: Props) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | TransactionStatus>('all');
    const [approvingId, setApprovingId] = useState<number | null>(null);

    const filteredTransactions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return transactions.filter((transaction) => {
            const matchesStatus = status === 'all' || transaction.status === status;

            if (!matchesStatus) return false;
            if (!normalizedQuery) return true;

            const haystack = [
                transaction.invoice_number,
                transaction.status,
                transaction.customer?.name,
                transaction.customer?.email,
                transaction.customer?.phone_number,
                transaction.invitation?.title,
                transaction.invitation?.slug,
                transaction.package?.label,
                transaction.package?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [query, status, transactions]);

    function handleApprove(transaction: AdminTransaction) {
        if (!transaction.invitation) return;

        const confirmed = confirm(
            `Approve transaksi ${transaction.invoice_number} dan aktifkan undangan "${transaction.invitation.title}"?`,
        );

        if (!confirmed) return;

        setApprovingId(transaction.id);

        router.patch(
            route('admin.transactions.approve', { transaction: transaction.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setApprovingId(null),
            },
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Transaksi" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Semua Transaksi</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Menampilkan seluruh transaksi yang dibuat oleh customer.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Transaksi"
                        value={summary.total}
                        note="Semua invoice customer"
                        icon={ReceiptText}
                        iconClassName="bg-primary/10 text-primary"
                    />
                    <SummaryCard
                        title="Menunggu"
                        value={summary.pending}
                        note="Belum dibayar"
                        icon={Clock}
                        iconClassName="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        title="Lunas"
                        value={summary.paid}
                        note={formatCurrency(summary.paid_revenue)}
                        icon={CheckCircle2}
                        iconClassName="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        title="Gagal/Expired"
                        value={summary.failed}
                        note="Perlu ditinjau"
                        icon={XCircle}
                        iconClassName="bg-red-100 text-red-600"
                    />
                    <SummaryCard
                        title="Customer"
                        value={summary.customers}
                        note="Akun dengan transaksi"
                        icon={Users}
                        iconClassName="bg-sky-100 text-sky-700"
                    />
                </div>

                <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <CreditCard className="size-4 text-primary" />
                                Daftar Transaksi Customer
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {filteredTransactions.length} dari {transactions.length} transaksi
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="relative min-w-0 sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari invoice, customer, undangan..."
                                    className="w-full rounded-lg border border-border/60 bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                                />
                            </label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value as 'all' | TransactionStatus)}
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

                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Banknote className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Belum Ada Transaksi</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Transaksi customer akan muncul di halaman ini.</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Search className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Data Tidak Ditemukan</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau status transaksi.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Customer', 'Invoice', 'Undangan', 'Paket', 'Status', 'Total', 'Dibuat', 'Aksi'].map((heading) => (
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
                                    {filteredTransactions.map((transaction) => (
                                        <TransactionRow
                                            key={transaction.id}
                                            transaction={transaction}
                                            approving={approvingId === transaction.id}
                                            onApprove={handleApprove}
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
