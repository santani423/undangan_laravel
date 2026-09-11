import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MessageCircle, Sparkles } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/customer' }];

interface Props {
    whatsappHelpLink: string;
}

/**
 * Shown instead of customer/dashboard for a logged-in customer with zero
 * invitations — a focused, single-purpose screen rather than the full
 * account-management dashboard (which assumes there's something to manage).
 */
export default function CustomerOnboarding({ whatsappHelpLink }: Props) {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Undangan" />
            <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Sparkles className="size-10" />
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Yuk, Buat Undangan Digitalmu</h1>
                    <p className="text-muted-foreground mx-auto max-w-md text-sm sm:text-base">
                        Buat undangan cantik dalam beberapa langkah mudah — pilih jenis acara, tema, dan paket sesuai kebutuhanmu.
                    </p>
                </div>

                <Link
                    href={route('customer.invitations.create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                    Buat Undangan Sekarang
                </Link>

                <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-muted-foreground text-sm">Butuh bantuan?</p>
                    <a
                        href={whatsappHelpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <MessageCircle className="size-4" />
                        Chat WhatsApp Admin
                    </a>
                </div>
            </div>
        </CustomerLayout>
    );
}
