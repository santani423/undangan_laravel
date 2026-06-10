import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Key } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengguna', href: '/admin/users' },
    { title: 'Permission', href: '/admin/users/permissions' },
];

export default function AdminPermissions() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Permission" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Manajemen Permission</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola semua permission granular yang digunakan oleh sistem Role-Based Access Control (Spatie).</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Permission"
                        description="Halaman ini menampilkan seluruh permission yang terdaftar (misal: view-users, edit-invitations, manage-packages). Setiap permission dapat di-assign ke role tertentu."
                        icon={Key}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
