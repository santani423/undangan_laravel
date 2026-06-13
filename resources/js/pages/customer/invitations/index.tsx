import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Mail, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
];

export default function InvitationsIndex() {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Undangan Saya" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Undangan Saya</h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola semua undangan digital Anda.</p>
                    </div>
                    <a
                        href="/customer/invitations/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" />
                        Buat Undangan
                    </a>
                </div>

                <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-muted p-4 rounded-2xl mb-4">
                        <Mail className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Belum Ada Undangan</h3>
                    <p className="text-sm text-muted-foreground mb-4">Mulai buat undangan digital pertama Anda.</p>
                    <a
                        href="/customer/invitations/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" />
                        Buat Undangan Pertama
                    </a>
                </div>
            </div>
        </CustomerLayout>
    );
}
