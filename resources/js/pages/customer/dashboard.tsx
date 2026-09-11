import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, Mail, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/customer' }];

interface RecentInvitation {
    id: number;
    slug: string;
    title: string;
    status: string;
    event_type_label: string | null;
    first_event_date: string | null;
}

interface Props {
    stats: {
        invitations_total: number;
        invitations_active: number;
        guests_total: number;
        transactions_total: number;
    };
    recentInvitations: RecentInvitation[];
}

const statusLabel: Record<string, string> = {
    draft: 'Draft',
    active: 'Aktif',
    expired: 'Kedaluwarsa',
    archived: 'Diarsipkan',
};

const statusColor: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-slate-100 text-slate-600',
    archived: 'bg-slate-100 text-slate-600',
};

export default function CustomerDashboard({ stats, recentInvitations }: Props) {
    const statCards = [
        { title: 'Total Undangan', value: stats.invitations_total, subtitle: 'undangan dibuat', icon: <Mail className="size-5" />, color: 'text-rose-600', bg: 'bg-rose-100' },
        { title: 'Undangan Aktif', value: stats.invitations_active, subtitle: 'sedang aktif', icon: <Mail className="size-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Total Tamu', value: stats.guests_total, subtitle: 'dari semua undangan', icon: <Users className="size-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Transaksi', value: stats.transactions_total, subtitle: 'total pembayaran', icon: <CreditCard className="size-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Selamat Datang!</h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola undangan digital Anda dari satu tempat.</p>
                    </div>
                    <Link
                        href={route('customer.invitations.create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Mail className="size-4" />
                        Buat Undangan Baru
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((s) => (
                        <div key={s.title} className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                                    <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{s.subtitle}</p>
                                </div>
                                <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>{s.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                        <h2 className="font-semibold text-foreground">Undangan Terbaru</h2>
                        <Link href={route('customer.invitations.index')} className="text-xs text-primary hover:underline font-medium">
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="divide-y divide-border/40">
                        {recentInvitations.map((inv) => (
                            <Link
                                key={inv.id}
                                href={route('customer.invitations.show', inv.id)}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <Mail className="size-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{inv.title}</p>
                                    <p className="text-xs text-muted-foreground">{inv.event_type_label ?? '—'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[inv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {statusLabel[inv.status] ?? inv.status}
                                    </span>
                                    {inv.first_event_date && <span className="text-xs text-muted-foreground">{inv.first_event_date}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
