import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CreditCard, Mail, Package, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/customer' }];

const stats = [
    { title: 'Undangan Aktif', value: '0', subtitle: 'undangan dibuat', icon: <Mail className="size-5" />, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Total Tamu', value: '0', subtitle: 'dari semua undangan', icon: <Users className="size-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Paket Aktif', value: '-', subtitle: 'belum berlangganan', icon: <Package className="size-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Transaksi', value: '0', subtitle: 'total pembayaran', icon: <CreditCard className="size-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function CustomerDashboard() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Selamat Datang!</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola undangan digital Anda dari satu tempat.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
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

                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-3">Mulai Buat Undangan</h2>
                    <p className="text-sm text-muted-foreground mb-4">Anda belum memiliki undangan. Buat undangan pertama Anda sekarang.</p>
                    <a
                        href="/customer/invitations/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Mail className="size-4" />
                        Buat Undangan Baru
                    </a>
                </div>
            </div>
        </CustomerLayout>
    );
}
