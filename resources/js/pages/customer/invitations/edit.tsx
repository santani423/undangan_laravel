import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
    { title: 'Edit Undangan', href: '#' },
];

export default function InvitationsEdit() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Undangan" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Edit Undangan</h1>
                    <p className="text-muted-foreground text-sm mt-1">Ubah detail undangan Anda.</p>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Form edit undangan akan ditampilkan di sini.</p>
                </div>
            </div>
        </CustomerLayout>
    );
}
