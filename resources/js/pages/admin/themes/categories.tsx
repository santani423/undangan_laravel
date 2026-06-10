import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FolderOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Tema', href: '/admin/themes' },
    { title: 'Kategori Tema', href: '/admin/themes/categories' },
];

export default function AdminThemeCategories() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Tema" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Kategori Tema</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola kategori tema untuk membantu pengguna menemukan tema yang sesuai (Elegan, Modern, Islami, Minimalis, dll.).</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Kategori Tema"
                        description="Kelola kategori untuk mengklasifikasikan tema berdasarkan gaya desain (Elegan, Modern, Islami, Minimalis, Floral, dll.). Kategori membantu pengguna memfilter tema di marketplace."
                        icon={FolderOpen}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
