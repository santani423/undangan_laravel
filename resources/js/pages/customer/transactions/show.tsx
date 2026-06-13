import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Transaksi', href: '/customer/transactions' },
    { title: 'Detail Transaksi', href: '#' },
];

export default function TransactionsShow() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Transaksi" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Detail Transaksi</h1>
                    <p className="text-muted-foreground text-sm mt-1">Informasi lengkap transaksi Anda.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Detail transaksi akan ditampilkan di sini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
