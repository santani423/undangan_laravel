import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Mail, Send, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

function StatCard({ title, value, subtitle, icon, color, bg }: StatCardProps) {
    return (
        <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <div className={`${bg} ${color} p-3 rounded-xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

const recentInvitations = [
    { name: 'Pernikahan Budi & Ani', type: 'Pernikahan', tamu: 120, status: 'Aktif', date: '15 Jun 2026' },
    { name: 'Ulang Tahun Sari ke-30', type: 'Ulang Tahun', tamu: 45, status: 'Draft', date: '20 Jun 2026' },
    { name: 'Akad Nikah Dian & Reza', type: 'Akad Nikah', tamu: 80, status: 'Aktif', date: '28 Jun 2026' },
    { name: 'Sunatan Putra Pak Joko', type: 'Khitanan', tamu: 60, status: 'Selesai', date: '5 Jun 2026' },
];

const statusColor: Record<string, string> = {
    Aktif: 'bg-emerald-100 text-emerald-700',
    Draft: 'bg-amber-100 text-amber-700',
    Selesai: 'bg-slate-100 text-slate-600',
};

export default function Dashboard() {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground">
                        Selamat datang, {firstName} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola semua undangan digital Anda dari satu tempat.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Undangan"
                        value="24"
                        subtitle="+3 bulan ini"
                        icon={<Mail className="size-5" />}
                        color="text-rose-600"
                        bg="bg-rose-100"
                    />
                    <StatCard
                        title="Total Tamu"
                        value="1.248"
                        subtitle="dari semua undangan"
                        icon={<Users className="size-5" />}
                        color="text-amber-600"
                        bg="bg-amber-100"
                    />
                    <StatCard
                        title="Konfirmasi Hadir"
                        value="867"
                        subtitle="69% dari total tamu"
                        icon={<CheckCircle className="size-5" />}
                        color="text-emerald-600"
                        bg="bg-emerald-100"
                    />
                    <StatCard
                        title="Undangan Terkirim"
                        value="1.105"
                        subtitle="88% terkirim"
                        icon={<Send className="size-5" />}
                        color="text-blue-600"
                        bg="bg-blue-100"
                    />
                </div>

                {/* Content Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Invitations */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h2 className="font-semibold text-foreground">Undangan Terbaru</h2>
                            <a href="/undangan" className="text-xs text-primary hover:underline font-medium">
                                Lihat semua →
                            </a>
                        </div>
                        <div className="divide-y divide-border/40">
                            {recentInvitations.map((inv) => (
                                <div key={inv.name} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <Mail className="size-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{inv.name}</p>
                                        <p className="text-xs text-muted-foreground">{inv.type} · {inv.tamu} tamu</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[inv.status]}`}>
                                            {inv.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{inv.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions & Upcoming */}
                    <div className="flex flex-col gap-4">
                        {/* Quick Actions */}
                        <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                            <div className="px-6 py-4 border-b border-border/50">
                                <h2 className="font-semibold text-foreground">Aksi Cepat</h2>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <a
                                    href="/undangan/create"
                                    className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Mail className="size-4" />
                                    Buat Undangan Baru
                                </a>
                                <a
                                    href="/tamu/import"
                                    className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                >
                                    <Users className="size-4" />
                                    Import Daftar Tamu
                                </a>
                                <a
                                    href="/template"
                                    className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                >
                                    <CalendarDays className="size-4" />
                                    Pilih Template
                                </a>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                            <div className="px-6 py-4 border-b border-border/50">
                                <h2 className="font-semibold text-foreground">Acara Mendatang</h2>
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                {[
                                    { name: 'Pernikahan Budi & Ani', date: '15 Jun', days: 5 },
                                    { name: 'Ulang Tahun Sari', date: '20 Jun', days: 10 },
                                    { name: 'Akad Nikah Dian', date: '28 Jun', days: 18 },
                                ].map((ev) => (
                                    <div key={ev.name} className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center size-11 rounded-xl bg-accent text-accent-foreground shrink-0">
                                            <span className="text-xs font-bold leading-none">{ev.date.split(' ')[0]}</span>
                                            <span className="text-xs opacity-70 leading-none">{ev.date.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{ev.name}</p>
                                            <p className="text-xs text-muted-foreground">{ev.days} hari lagi</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
