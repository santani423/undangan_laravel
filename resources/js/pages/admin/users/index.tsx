import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle2,
    Mail,
    Phone,
    Search,
    ShieldBan,
    ShieldCheck,
    UserRoundX,
    Users,
    XCircle,
    Eye,
} from 'lucide-react';
import { type ElementType, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengguna', href: '/admin/users' },
];

interface AdminUser {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    deleted_at: string | null;
    created_at: string;
    roles: string[];
    invitations_count: number;
    transactions_count: number;
}

interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    unverified: number;
}

interface Props {
    users: AdminUser[];
    summary: UserSummary;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'suspended';

const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
    { value: 'suspended', label: 'Suspended' },
];

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    customer: 'Customer',
};

function roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
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

function userStatus(user: AdminUser): Exclude<StatusFilter, 'all'> {
    if (user.deleted_at) return 'suspended';

    return user.is_active ? 'active' : 'inactive';
}

const STATUS_CONFIG: Record<Exclude<StatusFilter, 'all'>, { label: string; icon: ElementType; className: string }> = {
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

function StatusBadge({ status }: { status: Exclude<StatusFilter, 'all'> }) {
    const meta = STATUS_CONFIG[status];
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

function UserRow({ user }: { user: AdminUser }) {
    const status = userStatus(user);

    return (
        <tr className="transition-colors hover:bg-muted/20">
            <td className="px-4 py-4 align-top">
                <div className="min-w-48">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3" />
                        {user.email}
                        {user.email_verified_at && <BadgeCheck className="size-3 text-emerald-500" />}
                    </p>
                    {user.phone_number && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="size-3" />
                            {user.phone_number}
                        </p>
                    )}
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                            <span
                                key={role}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                            >
                                <ShieldCheck className="size-3" />
                                {roleLabel(role)}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <StatusBadge status={status} />
            </td>
            <td className="px-4 py-4 align-top">
                <p className="text-sm font-medium text-foreground">{user.invitations_count}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">undangan</p>
            </td>
            <td className="px-4 py-4 align-top">
                <p className="text-sm font-medium text-foreground">{user.transactions_count}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">transaksi</p>
            </td>
            <td className="px-4 py-4 align-top">
                <p className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(user.created_at)}</p>
            </td>
            <td className="px-4 py-4 align-top">
                <Link
                    href={route('admin.users.show', user.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                    <Eye className="size-3.5" />
                    Detail
                </Link>
            </td>
        </tr>
    );
}

export default function AdminUsers({ users, summary }: Props) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return users.filter((user) => {
            const matchesStatus = status === 'all' || userStatus(user) === status;

            if (!matchesStatus) return false;
            if (!normalizedQuery) return true;

            const haystack = [user.name, user.email, user.phone_number, ...user.roles]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [query, status, users]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Semua Pengguna</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Kelola semua akun pengguna yang terdaftar di platform.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Pengguna"
                        value={summary.total}
                        note="Seluruh akun terdaftar"
                        icon={Users}
                        iconClassName="bg-primary/10 text-primary"
                    />
                    <SummaryCard
                        title="Aktif"
                        value={summary.active}
                        note="Bisa login & bertransaksi"
                        icon={CheckCircle2}
                        iconClassName="bg-emerald-100 text-emerald-700"
                    />
                    <SummaryCard
                        title="Nonaktif"
                        value={summary.inactive}
                        note="Dinonaktifkan sementara"
                        icon={XCircle}
                        iconClassName="bg-amber-100 text-amber-700"
                    />
                    <SummaryCard
                        title="Suspended"
                        value={summary.suspended}
                        note="Akun terhapus/di-suspend"
                        icon={UserRoundX}
                        iconClassName="bg-red-100 text-red-600"
                    />
                    <SummaryCard
                        title="Belum Verifikasi"
                        value={summary.unverified}
                        note="Email belum dikonfirmasi"
                        icon={ShieldBan}
                        iconClassName="bg-sky-100 text-sky-700"
                    />
                </div>

                <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Users className="size-4 text-primary" />
                                Daftar Pengguna
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {filteredUsers.length} dari {users.length} pengguna
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="relative min-w-0 sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari nama, email, telepon, role..."
                                    className="w-full rounded-lg border border-border/60 bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                                />
                            </label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value as StatusFilter)}
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

                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Users className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Belum Ada Pengguna</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Pengguna yang mendaftar akan muncul di halaman ini.</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Search className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Data Tidak Ditemukan</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau status pengguna.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Pengguna', 'Role', 'Status', 'Undangan', 'Transaksi', 'Terdaftar', 'Aksi'].map((heading) => (
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
                                    {filteredUsers.map((user) => (
                                        <UserRow key={user.id} user={user} />
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
