import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'Notifikasi', href: '/admin/settings/notification' },
];

export default function AdminSettingsNotification() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Notifikasi" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Pengaturan Notifikasi</h1>
                    <p className="text-muted-foreground text-sm mt-1">Konfigurasi template email notifikasi dan preferensi notifikasi sistem untuk admin.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Pengaturan Notifikasi Sistem"
                        description="Kelola template email untuk: konfirmasi pendaftaran, pembayaran berhasil, pengiriman invoice, notifikasi RSVP ke pemilik undangan. Konfigurasi email mana yang dikirim otomatis dan notifikasi yang masuk ke inbox admin."
                        icon={Bell}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
