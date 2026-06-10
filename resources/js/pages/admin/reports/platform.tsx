import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Laporan', href: '/admin/reports/platform' },
    { title: 'Statistik Platform', href: '/admin/reports/platform' },
];

export default function AdminReportPlatform() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistik Platform" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Statistik Platform</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gambaran menyeluruh performa platform: pertumbuhan pengguna, undangan aktif, kunjungan, dan konversi RSVP.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Statistik Platform"
                        description="Dashboard analitik platform dengan grafik pertumbuhan pengguna harian/bulanan, distribusi jenis acara, jumlah undangan per status, total kunjungan halaman publik, dan tingkat konversi RSVP. Didukung Recharts."
                        icon={BarChart3}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
