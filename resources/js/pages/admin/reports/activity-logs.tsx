import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Laporan', href: '/admin/reports/platform' },
    { title: 'Log Aktivitas', href: '/admin/reports/activity-logs' },
];

export default function AdminActivityLogs() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Aktivitas" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Log Aktivitas</h1>
                    <p className="text-muted-foreground text-sm mt-1">Audit trail seluruh aktivitas admin dan pengguna — didukung Spatie Laravel Activity Log.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Log Aktivitas (Audit Trail)"
                        description="Rekam jejak semua aksi penting: login admin, perubahan pengaturan, konfirmasi pembayaran, perubahan data pengguna, dll. Menggunakan Spatie Activity Log dengan filter berdasarkan causer, subject, dan rentang waktu."
                        icon={Activity}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
