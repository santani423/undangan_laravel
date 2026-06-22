import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CreditCard, RefreshCw } from 'lucide-react';

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: string;
    invitation: { slug: string; title: string } | null;
}

interface Props {
    transaction: TransactionData | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Transaksi', href: '/customer/transactions' },
    { title: 'Pembayaran Gagal', href: '#' },
];

export default function PaymentFailed({ transaction }: Props) {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Gagal" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="w-full max-w-md">

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="size-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle className="size-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Pembayaran Gagal</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Transaksi Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
                        </p>
                    </div>

                    {/* Transaction Detail */}
                    {transaction && (
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 mb-5 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">No. Invoice</span>
                                    <span className="font-mono text-xs font-medium">{transaction.invoice_number}</span>
                                </div>
                                {transaction.invitation && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Undangan</span>
                                        <span className="font-medium line-clamp-1 text-right max-w-[180px]">
                                            {transaction.invitation.title}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-semibold text-red-600">
                                        {transaction.status === 'expired' ? 'Kadaluarsa' : 'Gagal'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {transaction?.invitation && (
                            <Link
                                href={`/customer/invitations/${transaction.invitation.slug}/payment`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <RefreshCw className="size-4" />
                                Coba Bayar Lagi
                            </Link>
                        )}
                        <Link
                            href="/customer/invitations"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali ke Undangan
                        </Link>
                        <Link
                            href="/customer/transactions"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <CreditCard className="size-4" />
                            Riwayat Transaksi
                        </Link>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
