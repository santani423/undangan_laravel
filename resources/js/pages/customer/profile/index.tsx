import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Profil Saya', href: '/customer/profile' },
];

export default function ProfileIndex() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Saya" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola informasi akun Anda.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Form profil akan ditampilkan di sini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
