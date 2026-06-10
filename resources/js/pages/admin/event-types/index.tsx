import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Tag } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Jenis Acara', href: '/admin/event-types' },
];

export default function AdminEventTypes() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Jenis Acara" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Jenis Acara (Event Types)</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola jenis acara yang tersedia: Wedding, Birthday, Khitanan, Aqiqah, Gender Reveal, Syukuran, dan lainnya.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Jenis Acara"
                        description="Halaman ini memungkinkan Super Admin menambah jenis acara baru tanpa mengubah kode inti. Setiap jenis acara memiliki field kustom (EAV) yang dapat dikonfigurasi melalui antarmuka ini."
                        icon={Tag}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
