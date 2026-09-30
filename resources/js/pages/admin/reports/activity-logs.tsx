import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, ChevronLeft, ChevronRight, Clock, UserRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Laporan', href: '/admin/reports/platform' },
    { title: 'Log Aktivitas', href: '/admin/reports/activity-logs' },
];

interface ActivityLogItem {
    id: number;
    action: string;
    description: string;
    module: string | null;
    model_type: string | null;
    model_id: number | null;
    changes: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string | null;
    user: { id: number; name: string; email: string } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    logs: Paginated<ActivityLogItem>;
    filters: { search: string; action: string };
    actions: string[];
}

const fieldClass =
    'w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10';

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

export default function AdminActivityLogs({ logs, filters, actions }: Props) {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const nextFilters: Record<string, string> = {};

        formData.forEach((value, key) => {
            if (typeof value === 'string' && value.trim() !== '') {
                nextFilters[key] = value.trim();
            }
        });

        router.get('/admin/reports/activity-logs', nextFilters, { preserveScroll: true, replace: true });
    }

    function handleReset() {
        router.get('/admin/reports/activity-logs', {}, { preserveScroll: true, replace: true });
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Aktivitas" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-foreground text-2xl font-bold">Log Aktivitas</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Audit trail aktivitas admin dan pengguna: login, perubahan data pengguna, undangan, transaksi, dan pengaturan.
                    </p>
                </div>

                <form
                    className="border-border/60 bg-card grid gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-[1fr_220px_auto]"
                    onSubmit={handleSubmit}
                >
                    <label className="space-y-2">
                        <span className="text-muted-foreground text-xs font-medium">Cari</span>
                        <input
                            type="search"
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Nama/email pelaku, objek, atau IP"
                            className={fieldClass}
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-muted-foreground text-xs font-medium">Aksi</span>
                        <select name="action" defaultValue={filters.action} className={fieldClass}>
                            <option value="">Semua aksi</option>
                            {actions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex items-end gap-2">
                        <Button type="button" variant="outline" onClick={handleReset} className="rounded-xl">
                            Reset
                        </Button>
                        <Button type="submit" className="rounded-xl">
                            Terapkan
                        </Button>
                    </div>
                </form>

                <div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="border-border/40 border-b px-5 py-4">
                        <p className="text-muted-foreground text-sm">
                            {logs.total === 0 ? 'Tidak ada aktivitas' : `Menampilkan ${logs.from}–${logs.to} dari ${logs.total} aktivitas`}
                        </p>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="bg-muted flex size-14 items-center justify-center rounded-2xl">
                                <Activity className="text-muted-foreground size-6" />
                            </div>
                            <p className="text-foreground mt-4 font-semibold">Belum Ada Log Aktivitas</p>
                            <p className="text-muted-foreground mt-1 text-sm">Aktivitas baru akan muncul di sini setelah tercatat.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-border/40 bg-muted/20 border-b">
                                        {['Pelaku', 'Aktivitas', 'Modul', 'IP Address', 'Waktu'].map((heading) => (
                                            <th
                                                key={heading}
                                                className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-border/30 divide-y">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-4 align-top">
                                                {log.user ? (
                                                    <Link href={route('admin.users.show', log.user.id)} className="group block">
                                                        <p className="text-foreground group-hover:text-primary flex items-center gap-1.5 text-sm font-medium">
                                                            <UserRound className="text-muted-foreground size-3.5" />
                                                            {log.user.name}
                                                        </p>
                                                        <p className="text-muted-foreground mt-0.5 text-xs">{log.user.email}</p>
                                                    </Link>
                                                ) : (
                                                    <p className="text-muted-foreground text-sm">Sistem</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-foreground text-sm">{log.description}</p>
                                                <p className="text-muted-foreground mt-0.5 font-mono text-xs">{log.action}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-muted-foreground text-xs">{log.module ? `${log.module} #${log.model_id}` : '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-muted-foreground text-xs">{log.ip_address ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
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

                    {logs.last_page > 1 && (
                        <div className="border-border/40 flex items-center justify-between border-t px-5 py-3">
                            <p className="text-muted-foreground text-xs">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    disabled={!logs.prev_page_url}
                                    asChild={!!logs.prev_page_url}
                                >
                                    {logs.prev_page_url ? (
                                        <Link href={logs.prev_page_url} preserveScroll>
                                            <ChevronLeft className="size-4" /> Sebelumnya
                                        </Link>
                                    ) : (
                                        <span>
                                            <ChevronLeft className="size-4" /> Sebelumnya
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    disabled={!logs.next_page_url}
                                    asChild={!!logs.next_page_url}
                                >
                                    {logs.next_page_url ? (
                                        <Link href={logs.next_page_url} preserveScroll>
                                            Berikutnya <ChevronRight className="size-4" />
                                        </Link>
                                    ) : (
                                        <span>
                                            Berikutnya <ChevronRight className="size-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
