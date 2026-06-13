import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Transaksi', href: '/customer/transactions' },
];

export default function TransactionsIndex() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
                    <p className="text-muted-foreground text-sm mt-1">Semua riwayat pembayaran Anda.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-muted p-4 rounded-2xl mb-4">
                        <CreditCard className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Belum Ada Transaksi</h3>
                    <p className="text-sm text-muted-foreground">Riwayat transaksi Anda akan muncul di sini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
