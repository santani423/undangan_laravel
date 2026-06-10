import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengguna', href: '/admin/users' },
];

export default function AdminUsers() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Semua Pengguna</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola semua akun pengguna yang terdaftar di platform.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Pengguna"
                        description="Fitur ini akan menampilkan daftar seluruh pengguna terdaftar, lengkap dengan filter status, pencarian, dan kemampuan untuk mengelola akun (suspend, aktifkan, reset password)."
                        icon={Users}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
