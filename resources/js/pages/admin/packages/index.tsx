import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Paket & Harga', href: '/admin/packages' },
];

export default function AdminPackages() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Paket & Harga" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Paket & Harga</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola paket layanan (Basic, Premium, Exclusive) beserta fitur dan harga masing-masing paket.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Paket"
                        description="Kelola paket Basic, Premium, dan Exclusive. Setiap paket memiliki feature_keys yang mengontrol akses fitur (amplop digital, WA blast, custom domain, live streaming, dll.). Prinsip: semua data unlimited, perbedaan hanya di akses fitur."
                        icon={Package}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
