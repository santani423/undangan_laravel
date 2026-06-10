import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Undangan', href: '/admin/invitations' },
];

export default function AdminInvitations() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Undangan" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Semua Undangan</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pantau dan kelola seluruh undangan digital yang dibuat di platform — Wedding, Birthday, Khitanan, Aqiqah, Gender Reveal, Syukuran.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Semua Undangan"
                        description="Tampil daftar semua undangan di seluruh platform dengan filter status (draft, pending, aktif, kadaluarsa), jenis acara, dan tanggal. Admin dapat melihat detail, menonaktifkan, atau menghapus undangan."
                        icon={Mail}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
