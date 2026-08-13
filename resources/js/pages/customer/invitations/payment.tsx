import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    Eye,
    ExternalLink,
    FileText,
    Landmark,
    Package2,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface ManualTransferInfo {
    available: boolean;
    bankDetails: { bank_name: string; account_no: string; account_name: string } | null;
    existingProof: {
        status: 'pending' | 'processing';
        proof_url: string | null;
        proof_is_pdf: boolean;
        uploaded_at: string | null;
    } | null;
}

interface Props {
    invitation: InvitationData;
    package: PackageData;
    transaction: TransactionData | null;
    paymentMethods: string[];
    gatewayActive: boolean;
    manualTransfer: ManualTransferInfo;
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

// ─── Bukti Transfer Preview ─────────────────────────────────────────────────

function FilePreviewModal({ src, isPdf, title, onClose }: { src: string; isPdf: boolean; title: string; onClose: () => void }) {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Tutup"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="overflow-auto bg-muted/20 p-4">
                    {isPdf ? (
                        <iframe src={src} title={title} className="h-[70vh] w-full rounded-lg border border-border bg-white" />
                    ) : (
                        <img src={src} alt={title} className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
                    )}
                </div>
            </div>
        </div>
    );
}

function ProofFileField({
    proofFile,
    onSelect,
    onPreview,
    error,
}: {
    proofFile: File | null;
    onSelect: (file: File | null) => void;
    onPreview: () => void;
    error?: string;
}) {
    return (
        <div>
            <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {proofFile && (
                <button
                    type="button"
                    onClick={onPreview}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                    {proofFile.type === 'application/pdf' ? (
                        <FileText className="size-5 shrink-0 text-primary" />
                    ) : (
                        <Eye className="size-5 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">{proofFile.name}</span>
                    <span className="shrink-0 text-[11px] font-medium text-primary">Preview</span>
                </button>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationPayment({ invitation, package: pkg, transaction, paymentMethods, gatewayActive, manualTransfer }: Props) {
    const [loading, setLoading] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewModal, setPreviewModal] = useState<{ src: string; isPdf: boolean; title: string } | null>(null);
    const pageProps = usePage().props as unknown as { flash?: Record<string, string>; errors?: Record<string, string> };
    const flash = pageProps.flash;
    const errors = pageProps.errors;

    // Revoke the previous object URL whenever a new file is picked or the component unmounts.
    useEffect(() => {
        return () => {
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
    }, [localPreviewUrl]);

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

    function handleSelectProofFile(file: File | null) {
        setProofFile(file);
        setLocalPreviewUrl(file ? URL.createObjectURL(file) : null);
    }

    function handlePreviewSelectedFile() {
        if (!proofFile || !localPreviewUrl) return;
        setPreviewModal({ src: localPreviewUrl, isPdf: proofFile.type === 'application/pdf', title: proofFile.name });
    }

    function handleUploadProof(e: React.FormEvent) {
        e.preventDefault();
        if (!proofFile) return;
        setUploading(true);
        router.post(
            `/customer/invitations/${invitation.slug}/payment/manual-proof`,
            { proof_file: proofFile },
            {
                forceFormData: true,
                onSuccess: () => {
                    setProofFile(null);
                    setLocalPreviewUrl(null);
                },
                onFinish: () => setUploading(false),
            },
        );
    }

    function copyAccountNumber(value: string) {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    const enabledFeatures = pkg.features.filter(
        (f) => f.feature_type === 'boolean' && f.feature_value === '1',
    );

    const infoMethods = manualTransfer.available
        ? [...paymentMethods, 'Transfer Bank Manual']
        : paymentMethods;

    const nothingAvailable = !gatewayActive && !manualTransfer.available;

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
                            {infoMethods.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    {infoMethods.map((m) => (
                                        <div key={m} className="flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                            <span>{m}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="size-4 mt-0.5 shrink-0 text-amber-500" />
                                    <span>Belum ada metode pembayaran yang aktif saat ini.</span>
                                </div>
                            )}
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

                        {/* Total */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                                <span className="text-xl font-bold text-foreground">
                                    {formatCurrency(pkg.price, pkg.currency)}
                                </span>
                            </div>
                        </div>

                        {/* Xendit — Bayar Online */}
                        {gatewayActive && !transaction?.payment_url && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Bayar Online
                                </h2>
                                <button
                                    type="button"
                                    onClick={handlePay}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Memproses...' : 'Bayar Sekarang'}
                                </button>
                                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                                    <span>Pembayaran aman & terenkripsi melalui Xendit</span>
                                </div>
                            </div>
                        )}

                        {/* Manual Transfer */}
                        {manualTransfer.available && manualTransfer.bankDetails && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <Landmark className="size-4" /> Transfer Bank Manual
                                </h2>

                                <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bank</span>
                                        <span className="font-medium">{manualTransfer.bankDetails.bank_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">No. Rekening</span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="font-mono font-semibold">{manualTransfer.bankDetails.account_no}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyAccountNumber(manualTransfer.bankDetails!.account_no)}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Copy className="size-3.5" />
                                            </button>
                                        </span>
                                    </div>
                                    {manualTransfer.bankDetails.account_name && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Atas Nama</span>
                                            <span className="font-medium">{manualTransfer.bankDetails.account_name}</span>
                                        </div>
                                    )}
                                </div>
                                {copied && <p className="mt-1.5 text-xs text-emerald-600">Nomor rekening disalin.</p>}

                                {manualTransfer.existingProof ? (
                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:bg-amber-900/20 dark:border-amber-800">
                                        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                                            <Clock className="size-3.5" /> Menunggu verifikasi admin
                                        </p>
                                        {manualTransfer.existingProof.proof_url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewModal({
                                                        src: manualTransfer.existingProof!.proof_url!,
                                                        isPdf: manualTransfer.existingProof!.proof_is_pdf,
                                                        title: 'Bukti Transfer',
                                                    })
                                                }
                                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                                            >
                                                <Eye className="size-3" />
                                                Lihat bukti yang sudah diunggah
                                            </button>
                                        )}
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Salah unggah? Pilih file baru untuk menggantinya.
                                        </p>
                                        <form onSubmit={handleUploadProof} className="mt-2 space-y-2">
                                            <ProofFileField
                                                proofFile={proofFile}
                                                onSelect={handleSelectProofFile}
                                                onPreview={handlePreviewSelectedFile}
                                                error={errors?.proof_file}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!proofFile || uploading}
                                                className="w-full rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {uploading ? 'Mengunggah...' : 'Unggah Ulang Bukti'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUploadProof} className="mt-4 space-y-2">
                                        <label className="block text-xs font-medium text-foreground">Unggah Bukti Transfer</label>
                                        <ProofFileField
                                            proofFile={proofFile}
                                            onSelect={handleSelectProofFile}
                                            onPreview={handlePreviewSelectedFile}
                                            error={errors?.proof_file}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!proofFile || uploading}
                                            className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? 'Mengunggah...' : 'Upload Bukti Transfer'}
                                        </button>
                                        <p className="text-[11px] text-muted-foreground">Format JPG, PNG, atau PDF. Maksimal 5 MB.</p>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Nothing available */}
                        {nothingAvailable && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                                <p className="flex items-center gap-2 text-sm font-medium text-amber-600">
                                    <AlertCircle className="size-4 shrink-0" /> Pembayaran Tidak Tersedia
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Belum ada metode pembayaran yang aktif saat ini. Silakan coba lagi nanti atau hubungi admin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {previewModal && (
                <FilePreviewModal
                    src={previewModal.src}
                    isPdf={previewModal.isPdf}
                    title={previewModal.title}
                    onClose={() => setPreviewModal(null)}
                />
            )}
        </CustomerLayout>
    );
}
