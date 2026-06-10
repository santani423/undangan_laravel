import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Undangan', href: '/admin/invitations' },
    { title: 'Custom Domain', href: '/admin/invitations/custom-domains' },
];

export default function AdminCustomDomains() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Custom Domain" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Custom Domain</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pantau semua domain kustom yang didaftarkan pengguna — status verifikasi DNS dan SSL.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Custom Domain"
                        description="Halaman ini menampilkan semua custom domain yang terdaftar di platform. Admin dapat melihat status DNS verification, SSL provisioning, dan mengambil tindakan jika ada domain bermasalah."
                        icon={Globe}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
