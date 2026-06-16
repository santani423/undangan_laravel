import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Pencil,
    Plus,
    Trash2,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Dompet Digital', href: '/customer/digital-wallets' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DigitalWallet {
    id: number;
    provider: string;
    provider_label: string;
    account_number: string;
    account_name: string;
    logo_url: string | null;
    is_active: boolean;
}

interface Props {
    wallets: DigitalWallet[];
    providers: Record<string, string>;
}

// ─── Form (reused for create & edit) ─────────────────────────────────────────

function WalletForm({
    providers,
    initial,
    onSubmit,
    onCancel,
    submitting,
}: {
    providers: Record<string, string>;
    initial?: Partial<DigitalWallet>;
    onSubmit: (data: ReturnType<typeof useForm>['data'], reset: () => void) => void;
    onCancel: () => void;
    submitting: boolean;
}) {
    const { data, setData, errors, reset } = useForm({
        provider: initial?.provider ?? '',
        provider_label: initial?.provider_label ?? '',
        account_number: initial?.account_number ?? '',
        account_name: initial?.account_name ?? '',
        logo: '',
        is_active: initial?.is_active ?? true,
    });

    const handleProviderChange = (val: string) => {
        setData({
            ...data,
            provider: val,
            provider_label: val === 'other' ? data.provider_label : (providers[val] ?? ''),
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setData('logo', reader.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSubmit(data, reset); }}
            className="grid gap-4"
        >
            {/* Provider */}
            <div>
                <label className="text-sm font-medium text-foreground">Penyedia Dompet</label>
                <select
                    value={data.provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                >
                    <option value="">Pilih penyedia…</option>
                    {Object.entries(providers).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                {errors.provider && <p className="mt-1 text-xs text-destructive">{errors.provider}</p>}
            </div>

            {/* Custom label if "other" */}
            {data.provider === 'other' && (
                <div>
                    <label className="text-sm font-medium text-foreground">Nama Penyedia</label>
                    <input
                        type="text"
                        value={data.provider_label}
                        onChange={(e) => setData('provider_label', e.target.value)}
                        placeholder="e.g. SakuKu"
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>
            )}

            {/* Account number */}
            <div>
                <label className="text-sm font-medium text-foreground">Nomor Akun / HP</label>
                <input
                    type="text"
                    value={data.account_number}
                    onChange={(e) => setData('account_number', e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                {errors.account_number && <p className="mt-1 text-xs text-destructive">{errors.account_number}</p>}
            </div>

            {/* Account name */}
            <div>
                <label className="text-sm font-medium text-foreground">Nama Pemilik Akun</label>
                <input
                    type="text"
                    value={data.account_name}
                    onChange={(e) => setData('account_name', e.target.value)}
                    placeholder="Nama sesuai akun dompet"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                {errors.account_name && <p className="mt-1 text-xs text-destructive">{errors.account_name}</p>}
            </div>

            {/* Logo */}
            <div>
                <label className="text-sm font-medium text-foreground">Logo (opsional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-1 w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
                {data.logo && (
                    <img src={data.logo} alt="preview" className="mt-2 h-10 w-auto rounded-lg" />
                )}
            </div>

            {/* Active */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm text-foreground">Aktif</span>
            </label>

            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {submitting ? 'Menyimpan…' : 'Simpan'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}

// ─── Wallet Card ──────────────────────────────────────────────────────────────

function WalletCard({
    wallet,
    providers,
    onDelete,
}: {
    wallet: DigitalWallet;
    providers: Record<string, string>;
    onDelete: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleUpdate = (data: Record<string, unknown>) => {
        setSubmitting(true);
        router.patch(`/customer/digital-wallets/${wallet.id}`, data, {
            onSuccess: () => setEditing(false),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
            {!editing ? (
                <>
                    <div className="flex items-start gap-3">
                        {wallet.logo_url ? (
                            <img src={wallet.logo_url} alt={wallet.provider_label} className="h-10 w-10 rounded-xl object-contain bg-muted p-1" />
                        ) : (
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                <Wallet className="size-5 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{wallet.provider_label}</p>
                            <p className="text-sm text-muted-foreground">{wallet.account_number}</p>
                            <p className="text-xs text-muted-foreground">{wallet.account_name}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${wallet.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                            {wallet.is_active
                                ? <><CheckCircle2 className="size-3" /> Aktif</>
                                : <><XCircle className="size-3" /> Nonaktif</>
                            }
                        </span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-border">
                        <button
                            onClick={() => setEditing(true)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <Pencil className="size-3.5" /> Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                        >
                            <Trash2 className="size-3.5" /> Hapus
                        </button>
                    </div>
                </>
            ) : (
                <WalletForm
                    providers={providers}
                    initial={wallet}
                    onSubmit={(data) => handleUpdate(data as Record<string, unknown>)}
                    onCancel={() => setEditing(false)}
                    submitting={submitting}
                />
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DigitalWalletsIndex({ wallets, providers }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = (data: Record<string, unknown>, reset: () => void) => {
        setSubmitting(true);
        router.post('/customer/digital-wallets', data, {
            onSuccess: () => { setShowCreate(false); reset(); },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (wallet: DigitalWallet) => {
        if (!confirm(`Hapus dompet "${wallet.provider_label} — ${wallet.account_number}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(`/customer/digital-wallets/${wallet.id}`);
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dompet Digital" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dompet Digital</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola e-wallet untuk menerima hadiah digital dari tamu undangan.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" /> Tambah Dompet
                    </button>
                </div>

                {/* Create form */}
                {showCreate && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <h2 className="font-semibold text-foreground mb-4">Tambah Dompet Digital</h2>
                        <WalletForm
                            providers={providers}
                            onSubmit={(data, reset) => handleCreate(data as Record<string, unknown>, reset)}
                            onCancel={() => setShowCreate(false)}
                            submitting={submitting}
                        />
                    </div>
                )}

                {/* List */}
                {wallets.length === 0 && !showCreate ? (
                    <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="bg-muted p-4 rounded-2xl mb-4">
                            <Wallet className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">Belum Ada Dompet Digital</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Tambahkan e-wallet seperti DANA, OVO, GoPay, atau ShopeePay.
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="size-4" /> Tambah Dompet
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {wallets.map((wallet) => (
                            <WalletCard
                                key={wallet.id}
                                wallet={wallet}
                                providers={providers}
                                onDelete={() => handleDelete(wallet)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
