import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, CreditCard, Receipt } from 'lucide-react';

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    invoice_currency: string;
    status: string;
    invitation: { slug: string; title: string } | null;
    package: { label: string } | null;
}

interface Props {
    transaction: TransactionData | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Transaksi', href: '/customer/transactions' },
    { title: 'Pembayaran Berhasil', href: '#' },
];

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
        Number(amount),
    );
}

export default function PaymentSuccess({ transaction }: Props) {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Berhasil" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="w-full max-w-md">

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Pembayaran Berhasil!</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Transaksi Anda telah dikonfirmasi. Undangan Anda kini aktif.
                        </p>
                    </div>

                    {/* Transaction Detail */}
                    {transaction && (
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 mb-5">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Receipt className="size-4" /> Detail Transaksi
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">No. Invoice</span>
                                    <span className="font-mono text-xs font-medium">{transaction.invoice_number}</span>
                                </div>
                                {transaction.invitation && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Undangan</span>
                                        <span className="font-medium line-clamp-1 text-right max-w-[160px]">
                                            {transaction.invitation.title}
                                        </span>
                                    </div>
                                )}
                                {transaction.package && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paket</span>
                                        <span className="font-medium">{transaction.package.label}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-semibold">Total Dibayar</span>
                                    <span className="font-bold text-emerald-600">
                                        {formatCurrency(transaction.invoice_amount, transaction.invoice_currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {transaction?.invitation && (
                            <Link
                                href={`/customer/invitations/${transaction.invitation.slug}/detail`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Kelola Undangan
                                <ArrowRight className="size-4" />
                            </Link>
                        )}
                        {transaction && (
                            <Link
                                href={`/customer/transactions/${transaction.id}`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                <Receipt className="size-4" />
                                Lihat Detail Transaksi
                            </Link>
                        )}
                        <Link
                            href="/customer/invitations"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <CreditCard className="size-4" />
                            Undangan Saya
                        </Link>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
