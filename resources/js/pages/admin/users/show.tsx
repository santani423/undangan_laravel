import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    BadgeCheck,
    Banknote,
    CalendarClock,
    CheckCircle2,
    Clock,
    ExternalLink,
    Globe,
    Info,
    Lock,
    Mail,
    MessageSquare,
    Phone,
    ReceiptText,
    ShieldBan,
    ShieldCheck,
    Ticket,
    UserRound,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { type ElementType, useState } from 'react';

interface UserDetail {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    roles: string[];
    profile: {
        language: string | null;
        timezone: string | null;
        bio: string | null;
        profile_photo_url: string | null;
    } | null;
}

interface InvitationItem {
    id: number;
    slug: string;
    invitation_code: string;
    title: string;
    description: string | null;
    status: string;
    is_public: boolean;
    requires_password: boolean;
    custom_domain: string | null;
    allow_guest_comments: boolean;
    allow_guest_plus_one: boolean;
    max_guests_plus_one: number;
    activated_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    event_type: string | null;
    package: { name: string; label: string } | null;
    theme: string | null;
    guests_count: number;
    rsvps_count: number;
    comments_count: number;
}

interface TransactionItem {
    id: number;
    invoice_number: string;
    invoice_amount: number;
    invoice_currency: string;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    created_at: string;
    payments_count: number;
    invitation: { slug: string; title: string } | null;
    package: { name: string; label: string } | null;
}

interface ActivityLogItem {
    id: number;
    action: string;
    model_type: string | null;
    model_id: number | null;
    ip_address: string | null;
    created_at: string | null;
}

interface Summary {
    invitations_total: number;
    invitations_active: number;
    transactions_total: number;
    transactions_paid_amount: number;
    activity_logs_total: number;
}

interface Props {
    user: UserDetail;
    invitations: InvitationItem[];
    transactions: TransactionItem[];
    activityLogs: ActivityLogItem[];
    summary: Summary;
}

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    customer: 'Customer',
};

function roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
}

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

function userStatus(user: UserDetail): 'active' | 'inactive' | 'suspended' {
    if (user.deleted_at) return 'suspended';

    return user.is_active ? 'active' : 'inactive';
}

const USER_STATUS_CONFIG: Record<'active' | 'inactive' | 'suspended', { label: string; icon: ElementType; className: string }> = {
    active: {
        label: 'Aktif',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    inactive: {
        label: 'Nonaktif',
        icon: XCircle,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    suspended: {
        label: 'Suspended',
        icon: ShieldBan,
        className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
};

const INVITATION_STATUS_CLASS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    draft: 'bg-muted text-muted-foreground',
    expired: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const TRANSACTION_STATUS_CLASS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-muted text-muted-foreground',
    expired: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

function Pill({ label, className, icon: Icon }: { label: string; className?: string; icon?: ElementType }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${className ?? 'bg-muted text-muted-foreground'}`}>
            {Icon && <Icon className="size-3" />}
            {label}
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

function SectionCard({
    icon: Icon,
    title,
    note,
    children,
}: {
    icon: ElementType;
    title: string;
    note: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/40 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-primary" />
                    {title}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
            </div>
            {children}
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }: { icon: ElementType; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Icon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export default function AdminUserShow({ user, invitations, transactions, activityLogs, summary }: Props) {
    const status = userStatus(user);
    const statusMeta = USER_STATUS_CONFIG[status];
    const [selectedInvitation, setSelectedInvitation] = useState<InvitationItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard Admin', href: '/admin' },
        { title: 'Pengguna', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengguna - ${user.name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('admin.users.index')}
                            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" />
                            Kembali ke Daftar Pengguna
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Detail lengkap akun, undangan, transaksi, dan log aktivitas pengguna.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <UserRound className="size-7" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
                                    <Pill label={statusMeta.label} className={statusMeta.className} icon={statusMeta.icon} />
                                </div>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Mail className="size-3.5" />
                                    {user.email}
                                    {user.email_verified_at && <BadgeCheck className="size-3.5 text-emerald-500" />}
                                </p>
                                {user.phone_number && (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Phone className="size-3.5" />
                                        {user.phone_number}
                                    </p>
                                )}
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarClock className="size-3.5" />
                                    Terdaftar {formatDateTime(user.created_at)}
                                </p>
                                {user.profile?.timezone && (
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Globe className="size-3.5" />
                                        {user.profile.timezone} &middot; {user.profile.language ?? '-'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                    <span
                                        key={role}
                                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary"
                                    >
                                        <ShieldCheck className="size-3.5" />
                                        {roleLabel(role)}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground">Tanpa role</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Undangan"
                        value={summary.invitations_total}
                        note={`${summary.invitations_active} aktif`}
                        icon={Ticket}
                        iconClassName="bg-primary/10 text-primary"
                    />
                    <SummaryCard
                        title="Undangan Aktif"
                        value={summary.invitations_active}
                        note="Status: active"
                        icon={CheckCircle2}
                        iconClassName="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        title="Total Transaksi"
                        value={summary.transactions_total}
                        note="Seluruh invoice"
                        icon={ReceiptText}
                        iconClassName="bg-sky-100 text-sky-700"
                    />
                    <SummaryCard
                        title="Total Dibayar"
                        value={formatCurrency(summary.transactions_paid_amount)}
                        note="Akumulasi transaksi lunas"
                        icon={Banknote}
                        iconClassName="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        title="Log Aktivitas"
                        value={summary.activity_logs_total}
                        note="200 aktivitas terakhir"
                        icon={Activity}
                        iconClassName="bg-violet-100 text-violet-700"
                    />
                </div>

                <SectionCard
                    icon={Ticket}
                    title="Undangan"
                    note={`${invitations.length} undangan dibuat oleh pengguna ini`}
                >
                    {invitations.length === 0 ? (
                        <EmptyState icon={Ticket} title="Belum Ada Undangan" description="Pengguna ini belum membuat undangan apa pun." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Undangan', 'Tipe Acara', 'Paket', 'Status', 'Tamu/RSVP/Komentar', 'Dibuat', 'Aksi'].map((heading) => (
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
                                    {invitations.map((invitation) => (
                                        <tr key={invitation.id} className="transition-colors hover:bg-muted/20">
                                            <td className="px-4 py-4 align-top">
                                                <div className="min-w-48">
                                                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{invitation.title}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">{invitation.slug}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-sm text-foreground">{invitation.event_type ?? '-'}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{invitation.theme ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-sm text-foreground">{invitation.package?.label ?? '-'}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{invitation.package?.name ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <Pill
                                                    label={invitation.status}
                                                    className={INVITATION_STATUS_CLASS[invitation.status] ?? 'bg-muted text-muted-foreground'}
                                                />
                                                {invitation.deleted_at && (
                                                    <div className="mt-1">
                                                        <Pill label="Dihapus" className="bg-red-100 text-red-600" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <UsersRound className="size-3" />
                                                    {invitation.guests_count} tamu &middot; {invitation.rsvps_count} RSVP &middot;{' '}
                                                    {invitation.comments_count} komentar
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {formatDateTime(invitation.created_at)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex flex-col gap-1.5 sm:flex-row">
                                                    <a
                                                        href={`/${invitation.invitation_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                                                    >
                                                        <ExternalLink className="size-3.5" />
                                                        Preview
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedInvitation(invitation)}
                                                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                                                    >
                                                        <Info className="size-3.5" />
                                                        Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    icon={ReceiptText}
                    title="Transaksi"
                    note={`${transactions.length} transaksi yang dibuat oleh pengguna ini`}
                >
                    {transactions.length === 0 ? (
                        <EmptyState icon={ReceiptText} title="Belum Ada Transaksi" description="Pengguna ini belum memiliki transaksi." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Invoice', 'Undangan', 'Paket', 'Status', 'Total', 'Dibuat'].map((heading) => (
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
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="transition-colors hover:bg-muted/20">
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
                                                <p className="line-clamp-1 text-sm text-foreground">{transaction.invitation?.title ?? '-'}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{transaction.invitation?.slug ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-sm text-foreground">{transaction.package?.label ?? '-'}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{transaction.package?.name ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <Pill
                                                    label={transaction.status}
                                                    className={TRANSACTION_STATUS_CLASS[transaction.status] ?? 'bg-muted text-muted-foreground'}
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="whitespace-nowrap text-sm font-bold text-foreground">
                                                    {formatCurrency(transaction.invoice_amount, transaction.invoice_currency)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{transaction.payments_count} pembayaran</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {formatDateTime(transaction.created_at)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    icon={Activity}
                    title="Log Aktivitas"
                    note={`${activityLogs.length} aktivitas terakhir tercatat untuk pengguna ini`}
                >
                    {activityLogs.length === 0 ? (
                        <EmptyState icon={Activity} title="Belum Ada Log Aktivitas" description="Belum ada aktivitas yang tercatat untuk pengguna ini." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Aksi', 'Objek', 'IP Address', 'Waktu'].map((heading) => (
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
                                    {activityLogs.map((log) => (
                                        <tr key={log.id} className="transition-colors hover:bg-muted/20">
                                            <td className="px-4 py-4 align-top">
                                                <p className="flex items-center gap-1.5 text-sm text-foreground">
                                                    <MessageSquare className="size-3.5 text-muted-foreground" />
                                                    {log.action}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-xs text-muted-foreground">
                                                    {log.model_type ? `${log.model_type} #${log.model_id}` : '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-xs text-muted-foreground">{log.ip_address ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {formatDateTime(log.created_at)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            </div>

            <Dialog open={selectedInvitation !== null} onOpenChange={(open) => !open && setSelectedInvitation(null)}>
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    {selectedInvitation && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Ticket className="size-4 text-primary" />
                                    {selectedInvitation.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-wrap gap-1.5">
                                <Pill
                                    label={selectedInvitation.status}
                                    className={INVITATION_STATUS_CLASS[selectedInvitation.status] ?? 'bg-muted text-muted-foreground'}
                                />
                                <Pill
                                    label={selectedInvitation.is_public ? 'Publik' : 'Privat'}
                                    className={
                                        selectedInvitation.is_public
                                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                            : 'bg-muted text-muted-foreground'
                                    }
                                />
                                {selectedInvitation.requires_password && (
                                    <Pill label="Berkata Sandi" icon={Lock} className="bg-amber-100 text-amber-700" />
                                )}
                                {selectedInvitation.deleted_at && <Pill label="Dihapus" className="bg-red-100 text-red-600" />}
                            </div>

                            {selectedInvitation.description && (
                                <p className="text-sm text-muted-foreground">{selectedInvitation.description}</p>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Slug</p>
                                    <p className="text-sm text-foreground">{selectedInvitation.slug}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Kode Undangan</p>
                                    <p className="font-mono text-sm text-foreground">{selectedInvitation.invitation_code}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Tipe Acara</p>
                                    <p className="text-sm text-foreground">{selectedInvitation.event_type ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Tema</p>
                                    <p className="text-sm text-foreground">{selectedInvitation.theme ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Paket</p>
                                    <p className="text-sm text-foreground">
                                        {selectedInvitation.package?.label ?? '-'}{' '}
                                        <span className="text-xs text-muted-foreground">({selectedInvitation.package?.name ?? '-'})</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Domain Kustom</p>
                                    <p className="text-sm text-foreground">{selectedInvitation.custom_domain ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Komentar Tamu</p>
                                    <p className="text-sm text-foreground">{selectedInvitation.allow_guest_comments ? 'Diizinkan' : 'Dimatikan'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Tamu Pendamping</p>
                                    <p className="text-sm text-foreground">
                                        {selectedInvitation.allow_guest_plus_one
                                            ? `Diizinkan (maks ${selectedInvitation.max_guests_plus_one})`
                                            : 'Dimatikan'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Diaktifkan</p>
                                    <p className="text-sm text-foreground">{formatDateTime(selectedInvitation.activated_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Kadaluarsa</p>
                                    <p className="text-sm text-foreground">{formatDateTime(selectedInvitation.expires_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Dibuat</p>
                                    <p className="text-sm text-foreground">{formatDateTime(selectedInvitation.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Diperbarui</p>
                                    <p className="text-sm text-foreground">{formatDateTime(selectedInvitation.updated_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                                <div className="flex items-center gap-1.5 text-sm text-foreground">
                                    <UsersRound className="size-4 text-muted-foreground" />
                                    {selectedInvitation.guests_count} tamu
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-foreground">
                                    <CheckCircle2 className="size-4 text-muted-foreground" />
                                    {selectedInvitation.rsvps_count} RSVP
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-foreground">
                                    <MessageSquare className="size-4 text-muted-foreground" />
                                    {selectedInvitation.comments_count} komentar
                                </div>
                            </div>

                            <a
                                href={`/${selectedInvitation.invitation_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <ExternalLink className="size-3.5" />
                                Buka Preview Undangan
                            </a>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
