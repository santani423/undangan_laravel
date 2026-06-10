import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Laporan', href: '/admin/reports/platform' },
    { title: 'Laporan Pendapatan', href: '/admin/reports/revenue' },
];

export default function AdminReportRevenue() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Pendapatan" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Laporan Pendapatan</h1>
                    <p className="text-muted-foreground text-sm mt-1">Analisis pendapatan platform berdasarkan periode, paket, dan payment gateway.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Laporan Pendapatan"
                        description="Laporan pendapatan per periode (harian, mingguan, bulanan, tahunan) dengan breakdown per paket (Basic, Premium, Exclusive), per payment gateway, dan per jenis acara. Mendukung export ke CSV/Excel."
                        icon={TrendingUp}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
