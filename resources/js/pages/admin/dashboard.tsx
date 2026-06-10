import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, BarChart3, Mail, TrendingUp, Users, Wallet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Admin', href: '/admin' }];

interface StatCard {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    trend?: string;
}

const stats: StatCard[] = [
    { title: 'Total Pengguna', value: '1.842', subtitle: '+128 bulan ini', icon: <Users className="size-5" />, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+7.4%' },
    { title: 'Undangan Aktif', value: '3.241', subtitle: 'dari semua pengguna', icon: <Mail className="size-5" />, color: 'text-rose-600', bg: 'bg-rose-100', trend: '+12.1%' },
    { title: 'Pendapatan Bulan Ini', value: 'Rp 42,5 jt', subtitle: 'target: Rp 50 jt', icon: <Wallet className="size-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+8.3%' },
    { title: 'Transaksi Pending', value: '47', subtitle: 'perlu konfirmasi', icon: <TrendingUp className="size-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
];

const recentActivity = [
    { type: 'Pembayaran', desc: 'Transaksi #INV-2026-0847 dikonfirmasi', time: '5 menit lalu', dot: 'bg-emerald-500' },
    { type: 'Pengguna Baru', desc: 'santani@email.com mendaftar', time: '12 menit lalu', dot: 'bg-blue-500' },
    { type: 'Undangan Baru', desc: 'Pernikahan Rizky & Dewi dibuat', time: '28 menit lalu', dot: 'bg-rose-500' },
    { type: 'Tema Baru', desc: 'Tema "Sakura Wedding" ditambahkan', time: '1 jam lalu', dot: 'bg-purple-500' },
    { type: 'Refund', desc: 'Permintaan refund #TXN-2026-0831', time: '2 jam lalu', dot: 'bg-amber-500' },
];

export default function AdminDashboard() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard Super Admin</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pantau dan kelola seluruh platform Undesia dari satu tempat.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.title} className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                                    <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{s.subtitle}</p>
                                    {s.trend && (
                                        <span className="mt-1 inline-block text-xs font-medium text-emerald-600">{s.trend} dari bulan lalu</span>
                                    )}
                                </div>
                                <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>{s.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <Activity className="size-4 text-primary" />
                                Aktivitas Terbaru
                            </h2>
                        </div>
                        <div className="divide-y divide-border/40">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="flex items-start gap-4 px-6 py-4">
                                    <div className="mt-1.5 flex-shrink-0">
                                        <div className={`size-2.5 rounded-full ${act.dot}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{act.desc}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{act.type} · {act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                        <div className="px-6 py-4 border-b border-border/50">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <BarChart3 className="size-4 text-primary" />
                                Akses Cepat
                            </h2>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            {[
                                { label: 'Konfirmasi Pembayaran', url: '/admin/transactions/payments', badge: '47', badgeColor: 'bg-amber-100 text-amber-700' },
                                { label: 'Pengguna Baru', url: '/admin/users', badge: '128', badgeColor: 'bg-blue-100 text-blue-700' },
                                { label: 'Testimoni Pending', url: '/admin/content/testimonials', badge: '12', badgeColor: 'bg-rose-100 text-rose-700' },
                                { label: 'Laporan Pendapatan', url: '/admin/reports/revenue', badge: null, badgeColor: '' },
                                { label: 'Pengaturan Sistem', url: '/admin/settings/general', badge: null, badgeColor: '' },
                            ].map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                >
                                    <span>{link.label}</span>
                                    {link.badge && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${link.badgeColor}`}>
                                            {link.badge}
                                        </span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
