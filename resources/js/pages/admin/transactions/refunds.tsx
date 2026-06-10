import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
    { title: 'Refund', href: '/admin/transactions/refunds' },
];

export default function AdminRefunds() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Refund" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Manajemen Refund</h1>
                    <p className="text-muted-foreground text-sm mt-1">Proses dan catat permintaan refund dari pengguna secara manual.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Refund"
                        description="Permintaan refund dicatat secara manual oleh admin. Halaman ini menampilkan daftar refund dengan status (pending, diproses, selesai), nominal, dan alasan refund. Admin dapat mengupdate status dan catatan refund."
                        icon={RefreshCw}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
