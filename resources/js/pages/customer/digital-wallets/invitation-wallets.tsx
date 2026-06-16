import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    GripVertical,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationInfo {
    id: number;
    slug: string;
    title: string;
}

interface WalletRow {
    id: number;
    provider: string;
    provider_label: string;
    account_number: string;
    account_name: string;
    logo_url: string | null;
    is_linked: boolean;
    is_displayed: boolean;
    display_order: number;
}

interface Props {
    invitation: InvitationInfo;
    wallets: WalletRow[];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationWallets({ invitation, wallets: initial }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan', href: '/customer/invitations' },
        { title: invitation.title, href: `/customer/invitations/${invitation.slug}/edit` },
        { title: 'Dompet Digital', href: '#' },
    ];

    const [wallets, setWallets] = useState<WalletRow[]>(initial);
    const [saving, setSaving] = useState(false);

    const toggleLinked = (id: number) => {
        setWallets((prev) =>
            prev.map((w) => w.id === id ? { ...w, is_linked: !w.is_linked, is_displayed: !w.is_linked } : w),
        );
    };

    const toggleDisplayed = (id: number) => {
        setWallets((prev) =>
            prev.map((w) => w.id === id ? { ...w, is_displayed: !w.is_displayed } : w),
        );
    };

    const handleSave = () => {
        const linked = wallets
            .filter((w) => w.is_linked)
            .map((w, i) => ({ id: w.id, is_displayed: w.is_displayed, display_order: i }));

        setSaving(true);
        router.post(
            `/customer/invitations/${invitation.slug}/digital-wallets/sync`,
            { wallets: linked },
            { onFinish: () => setSaving(false) },
        );
    };

    const linkedWallets = wallets.filter((w) => w.is_linked);
    const unlinkedWallets = wallets.filter((w) => !w.is_linked);

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dompet Digital — ${invitation.title}`} />
            <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <a
                        href={`/customer/invitations/${invitation.slug}/edit`}
                        className="size-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="size-4 text-muted-foreground" />
                    </a>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Dompet Digital Undangan</h1>
                        <p className="text-sm text-muted-foreground">{invitation.title}</p>
                    </div>
                </div>

                {wallets.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-10 text-center">
                        <Wallet className="size-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Belum ada dompet digital. Tambahkan di{' '}
                            <a href="/customer/digital-wallets" className="text-primary hover:underline">Manajemen Dompet Digital</a>.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Linked wallets */}
                        {linkedWallets.length > 0 && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-border bg-muted/40">
                                    <p className="text-sm font-semibold text-foreground">Ditampilkan di Undangan</p>
                                </div>
                                <div className="divide-y divide-border">
                                    {linkedWallets.map((w) => (
                                        <div key={w.id} className="flex items-center gap-3 px-5 py-3.5">
                                            <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
                                            {w.logo_url ? (
                                                <img src={w.logo_url} alt={w.provider_label} className="h-8 w-8 rounded-lg object-contain bg-muted p-0.5" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                                    <Wallet className="size-4 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">{w.provider_label}</p>
                                                <p className="text-xs text-muted-foreground">{w.account_number} · {w.account_name}</p>
                                            </div>
                                            <button
                                                title={w.is_displayed ? 'Sembunyikan dari undangan' : 'Tampilkan di undangan'}
                                                onClick={() => toggleDisplayed(w.id)}
                                                className={`p-1.5 rounded-lg transition-colors ${w.is_displayed ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                                            >
                                                {w.is_displayed ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                            </button>
                                            <button
                                                title="Lepas dari undangan"
                                                onClick={() => toggleLinked(w.id)}
                                                className="p-1.5 rounded-lg text-destructive hover:bg-destructive/5 transition-colors"
                                            >
                                                <CheckCircle2 className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unlinked wallets */}
                        {unlinkedWallets.length > 0 && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-border bg-muted/40">
                                    <p className="text-sm font-semibold text-foreground">Dompet Tersedia</p>
                                </div>
                                <div className="divide-y divide-border">
                                    {unlinkedWallets.map((w) => (
                                        <div key={w.id} className="flex items-center gap-3 px-5 py-3.5 opacity-60">
                                            {w.logo_url ? (
                                                <img src={w.logo_url} alt={w.provider_label} className="h-8 w-8 rounded-lg object-contain bg-muted p-0.5" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                                    <Wallet className="size-4 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">{w.provider_label}</p>
                                                <p className="text-xs text-muted-foreground">{w.account_number} · {w.account_name}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleLinked(w.id)}
                                                className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                            >
                                                Tambahkan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
                        </button>
                    </>
                )}
            </div>
        </CustomerLayout>
    );
}
