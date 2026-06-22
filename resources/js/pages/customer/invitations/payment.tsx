import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Calendar,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Package2,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageFeature {
    feature_key: string;
    feature_type: string;
    feature_value: string;
}

interface PackageData {
    id: number;
    name: string;
    label: string;
    description: string;
    price: string;
    currency: string;
    billing_period: string;
    duration_days: number;
    features: PackageFeature[];
}

interface InvitationData {
    id: number;
    slug: string;
    title: string;
}

interface TransactionData {
    id: number;
    invoice_number: string;
    invoice_amount: string;
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
    due_date: string | null;
    paid_at: string | null;
    payment_url: string | null;
}

interface Props {
    invitation: InvitationData;
    package: PackageData;
    transaction: TransactionData | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: string | number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
        Number(amount),
    );
}

const FEATURE_LABELS: Record<string, string> = {
    rsvp:               'RSVP Tamu',
    gift_wishlist:      'Wishlist Hadiah',
    gender_poll:        'Gender Poll',
    live_stream:        'Live Streaming',
    interactive_games:  'Game Interaktif',
    dress_code:         'Dress Code',
    amplop_digital:     'Amplop Digital',
    instagram_filter:   'Instagram Filter',
    analytics:          'Analitik Pengunjung',
    page_builder:       'Page Builder',
    custom_domain:      'Custom Domain',
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Menunggu Pembayaran', color: 'text-amber-600' },
    paid:      { label: 'Lunas', color: 'text-emerald-600' },
    failed:    { label: 'Gagal', color: 'text-red-600' },
    cancelled: { label: 'Dibatalkan', color: 'text-muted-foreground' },
    expired:   { label: 'Kadaluarsa', color: 'text-red-600' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationPayment({ invitation, package: pkg, transaction }: Props) {
    const [loading, setLoading] = useState(false);
    const flash = (usePage().props as any).flash as Record<string, string> | undefined;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan Saya', href: '/customer/invitations' },
        { title: invitation.title, href: '#' },
        { title: 'Pembayaran', href: '#' },
    ];

    function handlePay() {
        setLoading(true);
        router.post(
            `/customer/invitations/${invitation.slug}/payment`,
            {},
            { onFinish: () => setLoading(false) },
        );
    }

    const enabledFeatures = pkg.features.filter(
        (f) => f.feature_type === 'boolean' && f.feature_value === '1',
    );

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pembayaran — ${invitation.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/customer/invitations"
                        className="size-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Pembayaran Undangan</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Selesaikan pembayaran untuk mengaktifkan undangan Anda.
                        </p>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.error && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                        {flash.error}
                    </div>
                )}
                {flash?.info && (
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-700 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                        <BadgeCheck className="size-4 mt-0.5 shrink-0" />
                        {flash.info}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

                    {/* Order Summary */}
                    <div className="md:col-span-3 flex flex-col gap-4">

                        {/* Invitation Info */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Detail Pesanan
                            </h2>
                            <div className="flex items-start gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="size-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground line-clamp-1">{invitation.title}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Paket <span className="text-foreground font-medium">{pkg.label}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paket</span>
                                    <span className="font-medium">{pkg.label}</span>
                                </div>
                                {pkg.duration_days > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3.5" /> Masa aktif
                                        </span>
                                        <span className="font-medium">{pkg.duration_days} hari</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                    <span className="font-semibold text-foreground">Total</span>
                                    <span className="font-bold text-lg text-primary">
                                        {formatCurrency(pkg.price, pkg.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Package Features */}
                        {enabledFeatures.length > 0 && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <Package2 className="size-4" /> Fitur Paket
                                </h2>
                                <ul className="space-y-2">
                                    {enabledFeatures.map((f) => (
                                        <li key={f.feature_key} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span>{FEATURE_LABELS[f.feature_key] ?? f.feature_key}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Payment Methods Info */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Metode Pembayaran
                            </h2>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                {[
                                    'Virtual Account (BCA, Mandiri, BRI, BNI)',
                                    'E-Wallet (GoPay, OVO, ShopeePay, DANA)',
                                    'QRIS',
                                    'Alfamart / Indomaret',
                                    'Kartu Kredit / Debit',
                                ].map((m) => (
                                    <div key={m} className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Action Panel */}
                    <div className="md:col-span-2 flex flex-col gap-4">

                        {/* Existing transaction status */}
                        {transaction && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Status Transaksi
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">No. Invoice</span>
                                        <span className="font-mono text-xs font-medium">{transaction.invoice_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className={`font-semibold ${STATUS_INFO[transaction.status]?.color ?? ''}`}>
                                            {STATUS_INFO[transaction.status]?.label ?? transaction.status}
                                        </span>
                                    </div>
                                    {transaction.due_date && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Jatuh Tempo</span>
                                            <span>{new Date(transaction.due_date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>

                                {transaction.payment_url && transaction.status === 'pending' && (
                                    <a
                                        href={transaction.payment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-amber-600 transition-colors"
                                    >
                                        <ExternalLink className="size-4" />
                                        Lanjutkan Pembayaran
                                    </a>
                                )}

                                <Link
                                    href={`/customer/transactions/${transaction.id}`}
                                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                    Lihat Detail Transaksi
                                </Link>
                            </div>
                        )}

                        {/* Pay Now */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                                <span className="text-xl font-bold text-foreground">
                                    {formatCurrency(pkg.price, pkg.currency)}
                                </span>
                            </div>

                            {(!transaction || ['failed', 'expired', 'cancelled'].includes(transaction.status)) && (
                                <button
                                    type="button"
                                    onClick={handlePay}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Memproses...' : 'Bayar Sekarang'}
                                </button>
                            )}

                            {/* Pending transaction but Xendit invoice failed — allow retry */}
                        {transaction?.status === 'pending' && !transaction.payment_url && (
                                <button
                                    type="button"
                                    onClick={handlePay}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Memproses...' : 'Coba Lagi'}
                                </button>
                            )}

                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                                <span>Pembayaran aman & terenkripsi melalui Xendit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
