import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Layers } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Tema', href: '/admin/themes' },
];

export default function AdminThemes() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Tema & Template" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Tema & Template</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola semua tema undangan digital — tambah, edit, preview, dan atur mana yang gratis atau premium.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Tema"
                        description="Marketplace tema untuk semua jenis acara. Admin dapat menambah tema baru, upload aset (CSS, JS, gambar), assign ke kategori dan event type, toggle aktif/premium, serta preview tampilan tema."
                        icon={Layers}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
