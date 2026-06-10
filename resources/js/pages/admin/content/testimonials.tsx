import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Testimoni', href: '/admin/content/testimonials' },
];

export default function AdminTestimonials() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Testimoni" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Testimoni</h1>
                    <p className="text-muted-foreground text-sm mt-1">Moderasi testimoni pengguna — setujui atau tolak sebelum ditampilkan di halaman utama.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Moderasi Testimoni"
                        description="Daftar testimoni yang dikirim pengguna dengan status pending, approved, dan rejected. Admin dapat menyetujui testimoni berkualitas untuk ditampilkan di landing page platform sebagai social proof."
                        icon={Star}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
