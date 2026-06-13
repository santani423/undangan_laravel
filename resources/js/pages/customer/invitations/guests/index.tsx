import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
    { title: 'Manajemen Tamu', href: '#' },
];

export default function GuestsIndex() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Tamu" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manajemen Tamu</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola daftar tamu untuk undangan ini.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-muted p-4 rounded-2xl mb-4">
                        <Users className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Belum Ada Tamu</h3>
                    <p className="text-sm text-muted-foreground">Tambahkan tamu untuk undangan ini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
