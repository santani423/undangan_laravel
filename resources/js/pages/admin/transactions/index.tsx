import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Wallet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
];

export default function AdminTransactions() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Transaksi" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Semua Transaksi</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pantau seluruh transaksi platform — pending, lunas, gagal, dan refund.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Manajemen Transaksi"
                        description="Daftar semua transaksi dari seluruh pengguna dengan filter status (pending, paid, failed, refunded, expired), payment gateway (Midtrans, Xendit, TripAy, manual), dan rentang tanggal. Admin dapat konfirmasi pembayaran manual."
                        icon={Wallet}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
