import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'WhatsApp Gateway', href: '/admin/settings/whatsapp' },
];

export default function AdminSettingsWhatsapp() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Gateway" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">WhatsApp Gateway</h1>
                    <p className="text-muted-foreground text-sm mt-1">Konfigurasi provider WA Gateway (Fonnte, Wablas) untuk pengiriman undangan massal.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Pengaturan WhatsApp Gateway"
                        description="Pilih dan konfigurasi provider WA Gateway: Fonnte, Wablas, atau Zenziva. Menggunakan Strategy Pattern — provider bisa diganti tanpa mengubah logika bisnis. Konfigurasi token global (fallback) dan tes koneksi provider."
                        icon={MessageSquare}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
