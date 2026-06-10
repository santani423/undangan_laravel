import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengguna', href: '/admin/users' },
    { title: 'Admin & Operator', href: '/admin/users/admins' },
];

export default function AdminAdmins() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin & Operator" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Admin & Operator</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola akun administrator dan operator yang dapat mengakses panel admin.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Admin & Operator"
                        description="Halaman ini untuk menambah, mengedit, dan menonaktifkan akun admin atau operator. Super Admin dapat mengontrol siapa yang memiliki akses ke panel admin."
                        icon={ShieldCheck}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
