import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Paket Saya', href: '/customer/subscription' },
];

export default function SubscriptionIndex() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Paket Saya" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Paket Saya</h1>
                        <p className="text-muted-foreground text-sm mt-1">Informasi paket langganan aktif Anda.</p>
                    </div>
                    <a
                        href="/customer/subscription/upgrade"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Package className="size-4" />
                        Upgrade Paket
                    </a>
                </div>

                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Paket Aktif</p>
                    <p className="text-lg font-bold text-foreground">Gratis</p>
                    <p className="text-xs text-muted-foreground mt-1">Upgrade untuk fitur lebih lengkap.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
