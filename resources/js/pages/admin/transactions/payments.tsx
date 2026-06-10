import { AdminPlaceholder } from '@/components/admin-placeholder';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Transaksi', href: '/admin/transactions' },
    { title: 'Pembayaran Masuk', href: '/admin/transactions/payments' },
];

export default function AdminPayments() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Masuk" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Pembayaran Masuk</h1>
                    <p className="text-muted-foreground text-sm mt-1">Konfirmasi pembayaran manual dan pantau status pembayaran dari payment gateway.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <AdminPlaceholder
                        title="Pembayaran Masuk"
                        description="Daftar pembayaran yang perlu dikonfirmasi secara manual oleh admin (transfer bank). Untuk gateway otomatis (Midtrans, Xendit), status diupdate via webhook. Admin dapat melihat bukti transfer dan mengkonfirmasi."
                        icon={CreditCard}
                        badge="Segera Hadir"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
