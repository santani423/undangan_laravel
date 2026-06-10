import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengguna', href: '/admin/users' },
    { title: 'Role', href: '/admin/users/roles' },
];

export default function AdminRoles() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Role" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Manajemen Role</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola role yang tersedia: super_admin, admin, customer. Didukung oleh Spatie Laravel Permission.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Role"
                        description="Halaman ini menampilkan semua role yang ada di sistem (super_admin, admin, customer). Super Admin dapat membuat role baru dan mengatur permission yang dimiliki setiap role."
                        icon={Shield}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
