import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Paket Saya', href: '/customer/subscription' },
    { title: 'Upgrade Paket', href: '/customer/subscription/upgrade' },
];

export default function SubscriptionUpgrade() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Upgrade Paket" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pilih Paket</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pilih paket yang sesuai dengan kebutuhan Anda.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Daftar paket tersedia akan ditampilkan di sini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
