import { SettingsTabNav, type SettingsTab } from '@/components/settings/settings-tab-nav';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Crown,
    Edit,
    FlaskConical,
    Image,
    Info,
    LayoutList,
    Lock,
    Package,
    Percent,
    Plus,
    Save,
    Sliders,
    Sparkles,
    Star,
    Tag,
    Timer,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Unlock,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvitationType = 'pernikahan' | 'ulang_tahun' | 'khitanan' | 'aqiqah' | 'gender_reveal' | 'syukuran';

export interface PackageFeatureData {
    feature_key: string;
    feature_type: 'boolean' | 'level';
    feature_value: string;
}

export interface PackageData {
    id: number;
    name: string;
    invitation_type: InvitationType | null;
    label: string;
    description: string;
    price: number;
    currency: string;
    billing_period: string;
    duration_days: number;
    trial_days: number;
    max_gallery_uploads: number;
    is_active: boolean;
    display_order: number;
    features: PackageFeatureData[];
}

// ─── Invitation Type Config ────────────────────────────────────────────────────

interface InvTypeConfig {
    key: InvitationType;
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}

const INVITATION_TYPES: InvTypeConfig[] = [
    { key: 'pernikahan',    label: 'Pernikahan',         icon: '💍', color: 'pink',   bgColor: 'bg-pink-50',   borderColor: 'border-pink-200',   textColor: 'text-pink-600'   },
    { key: 'ulang_tahun',   label: 'Ulang Tahun',        icon: '🎂', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-600' },
    { key: 'khitanan',      label: 'Khitanan',           icon: '✂️', color: 'blue',   bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',   textColor: 'text-blue-600'   },
    { key: 'aqiqah',        label: 'Aqiqah',             icon: '🌿', color: 'green',  bgColor: 'bg-green-50',  borderColor: 'border-green-200',  textColor: 'text-green-600'  },
    { key: 'gender_reveal', label: 'Gender Reveal',      icon: '⭐', color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-600' },
    { key: 'syukuran',      label: 'Syukuran/Selamatan', icon: '🎉', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-600' },
];

const PACKAGE_TIERS = ['basic', 'premium', 'exclusive'] as const;
type PackageTier = typeof PACKAGE_TIERS[number];

const TIER_META: Record<PackageTier, { label: string; icon: React.ElementType; badgeClass: string; borderClass: string; popular: boolean }> = {
    basic:     { label: 'Basic',     icon: Zap,   badgeClass: 'bg-sky-100 text-sky-700',      borderClass: 'border-sky-200',   popular: false },
    premium:   { label: 'Premium',   icon: Star,  badgeClass: 'bg-primary/10 text-primary',   borderClass: 'border-primary/40', popular: true  },
    exclusive: { label: 'Exclusive', icon: Crown, badgeClass: 'bg-amber-100 text-amber-700',  borderClass: 'border-amber-300', popular: false },
};

// ─── Feature Catalogue ────────────────────────────────────────────────────────
// Master list of all known features — mirrors PackageSeeder.php

const FEATURE_CATALOGUE: {
    key: string;
    label: string;
    cat: string;
    type: 'boolean' | 'level';
    levels?: string[];
}[] = [
    // Konten Dasar
    { key: 'themes',             label: 'Template / Tema',              cat: 'Desain & Tema',      type: 'level',   levels: ['basic','extended','full']         },
    { key: 'page_builder',       label: 'Page Builder',                 cat: 'Desain & Tema',      type: 'level',   levels: ['basic','intermediate','full']      },
    { key: 'custom_css',         label: 'Custom CSS',                   cat: 'Desain & Tema',      type: 'boolean'  },
    { key: 'custom_branding',    label: 'Custom Branding (No Watermark)',cat: 'Desain & Tema',     type: 'boolean'  },
    // Domain & Akses
    { key: 'custom_domain',      label: 'Custom Domain',                cat: 'Domain & Akses',     type: 'boolean'  },
    { key: 'page_password',      label: 'Password Halaman',             cat: 'Domain & Akses',     type: 'boolean'  },
    // Konten Interaktif
    { key: 'gender_poll',        label: 'Gender Poll / Prediksi',       cat: 'Konten Interaktif',  type: 'boolean'  },
    { key: 'interactive_games',  label: 'Mini Games Interaktif',        cat: 'Konten Interaktif',  type: 'boolean'  },
    { key: 'dress_code',         label: 'Dress Code Info',              cat: 'Konten Interaktif',  type: 'boolean'  },
    { key: 'live_stream',        label: 'Live Streaming',               cat: 'Konten Interaktif',  type: 'boolean'  },
    { key: 'instagram_filter',   label: 'Instagram Filter AR',          cat: 'Konten Interaktif',  type: 'boolean'  },
    // Komunikasi
    { key: 'wa_reminders',       label: 'WhatsApp Reminder Tamu',       cat: 'Komunikasi',         type: 'boolean'  },
    { key: 'email_marketing',    label: 'Email Marketing',              cat: 'Komunikasi',         type: 'boolean'  },
    // Gift & Pembayaran
    { key: 'amplop_digital',     label: 'Amplop Digital (Rekening/QRIS)',cat: 'Gift & Pembayaran', type: 'boolean'  },
    { key: 'gift_wishlist',      label: 'Gift Wishlist',                cat: 'Gift & Pembayaran',  type: 'boolean'  },
    // Analytics & Support
    { key: 'analytics',          label: 'Analytics / Statistik',        cat: 'Lainnya',            type: 'level',   levels: ['basic','intermediate','full']      },
    { key: 'api_access',         label: 'API Access',                   cat: 'Lainnya',            type: 'boolean'  },
    { key: 'priority_support',   label: 'Prioritas Support',            cat: 'Lainnya',            type: 'boolean'  },
    { key: 'account_manager',    label: 'Account Manager Dedicated',    cat: 'Lainnya',            type: 'boolean'  },
];

interface PageProps {
    packages: PackageData[];
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

type FormErrors = Partial<Record<string, string>>;

// ─── Form state shape ─────────────────────────────────────────────────────────

interface EditState {
    invitation_type: InvitationType | '';
    label: string;
    description: string;
    price: string;
    billing_period: string;
    duration_days: string;
    trial_days: string;
    max_gallery_uploads: string;
    is_active: boolean;
    display_order: string;
}

interface AddState extends EditState {
    name: string;
}

function pkgToEditState(pkg: PackageData): EditState {
    return {
        invitation_type:     pkg.invitation_type ?? '',
        label:               pkg.label,
        description:         pkg.description,
        price:               String(pkg.price),
        billing_period:      pkg.billing_period,
        duration_days:       String(pkg.duration_days),
        trial_days:          String(pkg.trial_days),
        max_gallery_uploads: String(pkg.max_gallery_uploads),
        is_active:           pkg.is_active,
        display_order:       String(pkg.display_order),
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'Paket & Harga', href: '/admin/settings/packages' },
];

const tabs: SettingsTab[] = [
    { id: 'packages', label: 'Daftar Paket',    icon: Package    },
    { id: 'features', label: 'Fitur Paket',      icon: LayoutList },
    { id: 'limits',   label: 'Batas Penggunaan', icon: Sliders    },
    { id: 'promo',    label: 'Harga & Promo',    icon: Percent    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pkgMeta(name: string) {
    if (name.includes('premium') || name === 'premium')
        return { icon: Star,  borderClass: 'border-primary/40', badgeClass: 'bg-primary/10 text-primary',  headerBg: 'bg-primary/5',   popular: true  };
    if (name.includes('exclusive') || name === 'exclusive')
        return { icon: Crown, borderClass: 'border-amber-300',  badgeClass: 'bg-amber-100 text-amber-700', headerBg: 'bg-amber-50/50', popular: false };
    return { icon: Zap,   borderClass: 'border-sky-200',    badgeClass: 'bg-sky-100 text-sky-700',     headerBg: 'bg-muted/20',    popular: false };
}

function getTier(name: string): PackageTier {
    if (name.includes('exclusive')) return 'exclusive';
    if (name.includes('premium'))   return 'premium';
    return 'basic';
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="size-3 shrink-0" />{msg}
        </p>
    );
}

function InputField({
    label, value, onChange, type = 'text', suffix, min, max, required, error, hint, placeholder,
}: {
    label: React.ReactNode; value: string; onChange: (v: string) => void;
    type?: string; suffix?: string; min?: number; max?: number;
    required?: boolean; error?: string; hint?: string; placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="flex items-center rounded-lg border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <input
                    type={type} value={value} placeholder={placeholder}
                    min={min} max={max}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                {suffix && <span className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-l border-border/60 shrink-0">{suffix}</span>}
            </div>
            {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
            <FieldError msg={error} />
        </div>
    );
}

function SelectField({
    label, value, onChange, options, required, error,
}: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; required?: boolean; error?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FieldError msg={error} />
        </div>
    );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                    value ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border/60 bg-background text-muted-foreground'
                }`}
            >
                <span className="text-sm font-medium">{value ? 'Aktif' : 'Nonaktif'}</span>
                {value ? <ToggleRight className="size-5 text-emerald-600" /> : <ToggleLeft className="size-5" />}
            </button>
        </div>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 pt-1 pb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className="flex-1 h-px bg-border/50" />
        </div>
    );
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

function FlashBanner() {
    const { flash } = usePage<PageProps>().props;
    const msg = flash?.success || flash?.error || null;
    const isSuccess = !!flash?.success;
    const [visible, setVisible] = useState(false);
    const lastMsg = useRef<string | null>(null);

    useEffect(() => {
        if (msg && msg !== lastMsg.current) {
            lastMsg.current = msg;
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [msg]);

    if (!visible || !msg) return null;
    return (
        <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
        }`}>
            <span className="flex items-center gap-2">
                {isSuccess ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                {msg}
            </span>
            <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="size-4" />
            </button>
        </div>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
    return <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />;
}

// ─── Edit Package Modal ───────────────────────────────────────────────────────

type EditTab = 'info' | 'features';

function buildFeaturesState(existing: PackageFeatureData[]): Record<string, string> {
    const map: Record<string, string> = {};
    // seed defaults from catalogue
    for (const f of FEATURE_CATALOGUE) {
        map[f.key] = f.type === 'level' ? (f.levels?.[0] ?? 'basic') : 'false';
    }
    // override with actual DB values
    for (const f of existing) {
        map[f.feature_key] = f.feature_value;
    }
    return map;
}

function EditPackageModal({ pkg, onClose }: { pkg: PackageData; onClose: () => void }) {
    const [activeTab,  setActiveTab]  = useState<EditTab>('info');
    const [form,       setForm]       = useState<EditState>(() => pkgToEditState(pkg));
    const [featValues, setFeatValues] = useState<Record<string, string>>(() => buildFeaturesState(pkg.features));
    const [errors,     setErrors]     = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    function set<K extends keyof EditState>(key: K, value: EditState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }

    function setFeat(key: string, value: string) {
        setFeatValues((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.patch(
            route('admin.settings.packages.update', { package: pkg.id }),
            {
                invitation_type:     form.invitation_type || null,
                label:               form.label,
                description:         form.description,
                price:               form.price,
                billing_period:      form.billing_period,
                duration_days:       form.duration_days,
                trial_days:          form.trial_days,
                max_gallery_uploads: form.max_gallery_uploads,
                is_active:           form.is_active,
                display_order:       form.display_order,
            },
            {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); onClose(); },
                onError: (errs) => { setProcessing(false); setErrors(errs); },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function handleSaveFeatures() {
        setProcessing(true);
        const features = FEATURE_CATALOGUE.map((f) => ({
            feature_key:   f.key,
            feature_type:  f.type,
            feature_value: featValues[f.key] ?? (f.type === 'boolean' ? 'false' : f.levels?.[0] ?? 'basic'),
        }));

        router.patch(
            route('admin.settings.packages.features', { package: pkg.id }),
            { features },
            {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); onClose(); },
                onError:   () => setProcessing(false),
                onFinish:  () => setProcessing(false),
            },
        );
    }

    const trialDays = parseInt(form.trial_days) || 0;
    const cats = [...new Set(FEATURE_CATALOGUE.map((f) => f.cat))];

    const LEVEL_LABELS: Record<string, string> = {
        basic: 'Basic', intermediate: 'Menengah', full: 'Penuh', extended: 'Lanjutan',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}
        >
            <div className="w-full max-w-xl rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Edit Paket</h2>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{pkg.name.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} disabled={processing}
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-border/40 bg-muted/10">
                    {([
                        { id: 'info',     label: 'Informasi & Harga', icon: Sliders   },
                        { id: 'features', label: 'Fitur Paket',        icon: LayoutList },
                    ] as { id: EditTab; label: string; icon: React.ElementType }[]).map((t) => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} type="button"
                                onClick={() => setActiveTab(t.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                                    activeTab === t.id
                                        ? 'border-primary text-primary bg-primary/5'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
                                }`}
                            >
                                <Icon className="size-3.5" />{t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab: Info */}
                {activeTab === 'info' && (
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                            <SectionLabel label="Informasi Dasar" />
                            <SelectField
                                label="Jenis Undangan"
                                value={form.invitation_type}
                                onChange={(v) => set('invitation_type', v as InvitationType | '')}
                                options={[
                                    { value: '', label: '— Umum (tidak terikat jenis) —' },
                                    ...INVITATION_TYPES.map((t) => ({ value: t.key, label: `${t.icon} ${t.label}` })),
                                ]}
                            />
                            <InputField
                                label="Nama Tampilan Paket" required
                                value={form.label} onChange={(v) => set('label', v)}
                                error={errors.label}
                            />
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Deskripsi</label>
                                <textarea
                                    value={form.description} rows={2}
                                    onChange={(e) => set('description', e.target.value)}
                                    placeholder="Deskripsi singkat paket…"
                                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                                />
                            </div>
                            <SectionLabel label="Harga & Penagihan" />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label="Harga" required type="number"
                                    value={form.price} onChange={(v) => set('price', v)}
                                    min={0} suffix="IDR" error={errors.price}
                                />
                                <SelectField
                                    label="Periode Tagihan" required
                                    value={form.billing_period} onChange={(v) => set('billing_period', v)}
                                    options={[
                                        { value: 'month', label: 'Per Bulan' },
                                        { value: 'year',  label: 'Per Tahun' },
                                        { value: 'once',  label: 'Sekali Bayar' },
                                    ]}
                                    error={errors.billing_period}
                                />
                            </div>
                            <SectionLabel label="Trial & Masa Aktif" />
                            <div className={`rounded-lg border px-3 py-2.5 text-xs flex items-start gap-2 ${
                                trialDays > 0
                                    ? 'border-primary/20 bg-primary/5 text-primary'
                                    : 'border-border/50 bg-muted/20 text-muted-foreground'
                            }`}>
                                <FlaskConical className="size-3.5 mt-0.5 shrink-0" />
                                <span>
                                    {trialDays > 0
                                        ? `Pengguna mendapat akses penuh selama ${trialDays} hari tanpa perlu bayar terlebih dahulu.`
                                        : 'Paket ini tidak menyediakan masa trial. Pembayaran diperlukan sebelum akses diberikan.'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label={<span className="flex items-center gap-1"><FlaskConical className="size-3 text-primary" />Trial Gratis</span>}
                                    required type="number"
                                    value={form.trial_days} onChange={(v) => set('trial_days', v)}
                                    min={0} max={365} suffix="hari"
                                    hint="0 = tidak ada trial"
                                    error={errors.trial_days}
                                />
                                <InputField
                                    label="Masa Aktif Setelah Bayar" required type="number"
                                    value={form.duration_days} onChange={(v) => set('duration_days', v)}
                                    min={1} max={3650} suffix="hari" error={errors.duration_days}
                                    hint="Sejak pembayaran dikonfirmasi"
                                />
                            </div>
                            <SectionLabel label="Batas & Tampilan" />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label={<span className="flex items-center gap-1"><Image className="size-3" />Maks. Galeri</span>}
                                    required type="number"
                                    value={form.max_gallery_uploads} onChange={(v) => set('max_gallery_uploads', v)}
                                    min={0} suffix="foto" hint="0 = tidak terbatas"
                                    error={errors.max_gallery_uploads}
                                />
                                <InputField
                                    label="Urutan Tampil" type="number"
                                    value={form.display_order} onChange={(v) => set('display_order', v)}
                                    min={0} error={errors.display_order}
                                />
                            </div>
                            <ToggleField label="Status Paket" value={form.is_active} onChange={(v) => set('is_active', v)} />
                            {errors.general && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{errors.general}</div>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-muted/10">
                            <button type="button" onClick={onClose} disabled={processing}
                                className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                                {processing ? <Spinner /> : <Save className="size-3.5" />}
                                {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab: Fitur */}
                {activeTab === 'features' && (
                    <div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {cats.map((cat) => {
                                const catFeatures = FEATURE_CATALOGUE.filter((f) => f.cat === cat);
                                return (
                                    <div key={cat}>
                                        <div className="flex items-center gap-2 bg-muted/10 border-b border-border/30 px-5 py-2">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat}</span>
                                        </div>
                                        {catFeatures.map((f) => {
                                            const val = featValues[f.key] ?? (f.type === 'boolean' ? 'false' : f.levels?.[0] ?? 'basic');
                                            const enabled = val !== 'false';
                                            return (
                                                <div key={f.key} className="flex items-center justify-between px-5 py-2.5 border-b border-border/20 hover:bg-muted/10 transition-colors">
                                                    <div>
                                                        <p className="text-sm text-foreground">{f.label}</p>
                                                        <p className="text-[11px] font-mono text-muted-foreground">{f.key}</p>
                                                    </div>
                                                    <div className="shrink-0 ml-4">
                                                        {f.type === 'boolean' ? (
                                                            <button type="button"
                                                                onClick={() => setFeat(f.key, val === 'true' ? 'false' : 'true')}
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                                                    enabled
                                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                                }`}
                                                            >
                                                                {enabled
                                                                    ? <><ToggleRight className="size-3.5" />Aktif</>
                                                                    : <><ToggleLeft  className="size-3.5" />Nonaktif</>}
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                {f.levels?.map((lv) => (
                                                                    <button key={lv} type="button"
                                                                        onClick={() => setFeat(f.key, lv)}
                                                                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all border ${
                                                                            val === lv
                                                                                ? 'bg-primary text-primary-foreground border-primary'
                                                                                : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                                                        }`}
                                                                    >
                                                                        {LEVEL_LABELS[lv] ?? lv}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border/40 bg-muted/10">
                            <p className="text-[11px] text-muted-foreground">
                                {Object.values(featValues).filter((v) => v !== 'false').length} dari {FEATURE_CATALOGUE.length} fitur aktif
                            </p>
                            <div className="flex gap-2">
                                <button type="button" onClick={onClose} disabled={processing}
                                    className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                                    Batal
                                </button>
                                <button type="button" onClick={handleSaveFeatures} disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                                    {processing ? <Spinner /> : <Save className="size-3.5" />}
                                    {processing ? 'Menyimpan…' : 'Simpan Fitur'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Add Package Modal ────────────────────────────────────────────────────────

const defaultAdd: AddState = {
    name: '', invitation_type: '', label: '', description: '',
    price: '0', billing_period: 'month',
    duration_days: '90', trial_days: '0',
    max_gallery_uploads: '0',
    is_active: true, display_order: '',
};

function AddPackageModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState<AddState>(defaultAdd);
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    function set<K extends keyof AddState>(key: K, value: AddState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            route('admin.settings.packages.store'),
            {
                name:                form.name,
                invitation_type:     form.invitation_type || null,
                label:               form.label,
                description:         form.description,
                price:               form.price,
                billing_period:      form.billing_period,
                duration_days:       form.duration_days,
                trial_days:          form.trial_days,
                max_gallery_uploads: form.max_gallery_uploads,
                is_active:           form.is_active,
                display_order:       form.display_order || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); onClose(); },
                onError: (errs) => { setProcessing(false); setErrors(errs); },
                onFinish: () => setProcessing(false),
            },
        );
    }

    const trialDays = parseInt(form.trial_days) || 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}
        >
            <div className="w-full max-w-lg rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Tambah Paket Baru</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Buat paket layanan baru untuk platform</p>
                    </div>
                    <button onClick={onClose} disabled={processing}
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

                        <SectionLabel label="Informasi Dasar" />

                        <SelectField
                            label="Jenis Undangan"
                            value={form.invitation_type}
                            onChange={(v) => set('invitation_type', v as InvitationType | '')}
                            options={[
                                { value: '', label: '— Umum (tidak terikat jenis) —' },
                                ...INVITATION_TYPES.map((t) => ({ value: t.key, label: `${t.icon} ${t.label}` })),
                            ]}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Kode Internal" required placeholder="mis: pro"
                                value={form.name}
                                onChange={(v) => set('name', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                hint="huruf kecil, angka, underscore" error={errors.name}
                            />
                            <InputField
                                label="Nama Tampilan" required
                                value={form.label} onChange={(v) => set('label', v)}
                                placeholder="Paket Pro" error={errors.label}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Deskripsi</label>
                            <textarea
                                value={form.description} rows={2}
                                onChange={(e) => set('description', e.target.value)}
                                placeholder="Deskripsi singkat paket…"
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Harga" required type="number"
                                value={form.price} onChange={(v) => set('price', v)}
                                min={0} suffix="IDR" error={errors.price}
                            />
                            <SelectField
                                label="Periode Tagihan" required
                                value={form.billing_period} onChange={(v) => set('billing_period', v)}
                                options={[
                                    { value: 'month', label: 'Per Bulan' },
                                    { value: 'year',  label: 'Per Tahun' },
                                    { value: 'once',  label: 'Sekali Bayar' },
                                ]}
                            />
                        </div>

                        <SectionLabel label="Pengaturan Trial & Aktivasi" />

                        <div className={`rounded-lg border px-3 py-2.5 text-xs flex items-start gap-2 ${
                            trialDays > 0
                                ? 'border-primary/20 bg-primary/5 text-primary'
                                : 'border-border/50 bg-muted/20 text-muted-foreground'
                        }`}>
                            <FlaskConical className="size-3.5 mt-0.5 shrink-0" />
                            <span>
                                {trialDays > 0
                                    ? `Pengguna mendapat akses penuh selama ${trialDays} hari tanpa perlu bayar terlebih dahulu.`
                                    : 'Tidak ada masa trial. Pembayaran diperlukan sebelum akses diberikan.'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Masa Aktif Setelah Bayar" required type="number"
                                value={form.duration_days} onChange={(v) => set('duration_days', v)}
                                min={1} max={3650} suffix="hari" error={errors.duration_days}
                                hint="Dihitung sejak pembayaran dikonfirmasi"
                            />
                            <InputField
                                label={<span className="flex items-center gap-1"><FlaskConical className="size-3 text-primary" />Masa Trial Gratis</span>}
                                required type="number"
                                value={form.trial_days} onChange={(v) => set('trial_days', v)}
                                min={0} max={365} suffix="hari"
                                hint="0 = langsung bayar, tanpa trial"
                                error={errors.trial_days}
                            />
                        </div>

                        <SectionLabel label="Batas Penggunaan" />

                        <InputField
                            label={<span className="flex items-center gap-1"><Image className="size-3" />Maks. Upload Galeri</span>}
                            required type="number"
                            value={form.max_gallery_uploads} onChange={(v) => set('max_gallery_uploads', v)}
                            min={0} suffix="foto"
                            hint="0 = tidak terbatas" error={errors.max_gallery_uploads}
                        />

                        {errors.general && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{errors.general}</div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-muted/10">
                        <button type="button" onClick={onClose} disabled={processing}
                            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            Batal
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                            {processing ? <Spinner /> : <Plus className="size-3.5" />}
                            {processing ? 'Menyimpan…' : 'Tambah Paket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Trial Flow Info ──────────────────────────────────────────────────────────

function TrialFlowInfo({ packages }: { packages: PackageData[] }) {
    const hasAnyTrial = packages.some((p) => p.trial_days > 0);
    if (!hasAnyTrial) return null;

    const steps = [
        {
            icon: Package,
            color: 'bg-sky-100 text-sky-600',
            title: 'Pilih Paket',
            desc: 'Pengguna memilih paket dan membuat undangan pertama',
        },
        {
            icon: Unlock,
            color: 'bg-primary/10 text-primary',
            title: 'Trial Aktif',
            desc: 'Akses penuh diberikan sesuai trial_days paket tanpa pembayaran',
        },
        {
            icon: CreditCard,
            color: 'bg-emerald-100 text-emerald-600',
            title: 'Bayar & Aktivasi',
            desc: 'Pembayaran dikonfirmasi → masa aktif (duration_days) berjalan',
        },
        {
            icon: Lock,
            color: 'bg-amber-100 text-amber-600',
            title: 'Akses Berakhir',
            desc: 'Jika belum bayar saat trial habis, akses dibatasi otomatis',
        },
    ];

    return (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-primary/10 bg-primary/5 px-5 py-3">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                    <Info className="size-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary">Alur Sistem Trial Undangan Digital</p>
            </div>
            <div className="px-5 py-4">
                <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex-1 flex items-start gap-3 min-w-0">
                                <div className="flex flex-col items-center pt-0.5 shrink-0">
                                    <div className={`flex size-7 items-center justify-center rounded-lg ${s.color}`}>
                                        <Icon className="size-3.5" />
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="hidden sm:flex mt-1">
                                            <ArrowRight className="size-3 text-muted-foreground/40" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-foreground">{s.title}</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <ArrowRight className="hidden sm:block size-3.5 text-muted-foreground/30 mt-1.5 shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    {packages.filter((p) => p.trial_days > 0).map((p) => (
                        <span key={p.id} className="flex items-center gap-1">
                            <FlaskConical className="size-3 text-primary" />
                            <strong className="text-foreground">{p.label}:</strong> {p.trial_days} hari trial
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ pkg, onClose }: { pkg: PackageData; onClose: () => void }) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('admin.settings.packages.destroy', { package: pkg.id }), {
            preserveScroll: true,
            onSuccess: () => { setProcessing(false); onClose(); },
            onError:   () => setProcessing(false),
            onFinish:  () => setProcessing(false),
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
             onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}>
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden">
                <div className="px-6 py-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-red-100">
                            <Trash2 className="size-4 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Hapus Paket</h2>
                            <p className="text-xs text-muted-foreground font-mono">{pkg.name.toUpperCase()}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Yakin ingin menghapus paket <strong className="text-foreground">"{pkg.label}"</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 pb-5">
                    <button type="button" onClick={onClose} disabled={processing}
                        className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        Batal
                    </button>
                    <button type="button" onClick={handleDelete} disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60">
                        {processing ? <Spinner /> : <Trash2 className="size-3.5" />}
                        {processing ? 'Menghapus…' : 'Hapus Paket'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Order Controls ───────────────────────────────────────────────────────────

function OrderControls({ pkg, packages }: { pkg: PackageData; packages: PackageData[] }) {
    const sorted  = [...packages].sort((a, b) => a.display_order - b.display_order);
    const idx     = sorted.findIndex((p) => p.id === pkg.id);
    const isFirst = idx === 0;
    const isLast  = idx === sorted.length - 1;

    function pkgPayload(p: PackageData, overrides: Partial<Omit<PackageData, 'features'>>) {
        return {
            invitation_type: p.invitation_type, label: p.label, description: p.description,
            price: p.price, billing_period: p.billing_period, duration_days: p.duration_days,
            trial_days: p.trial_days, max_gallery_uploads: p.max_gallery_uploads,
            is_active: p.is_active, display_order: p.display_order, ...overrides,
        };
    }

    function move(dir: 'up' | 'down') {
        const swap = dir === 'up' ? sorted[idx - 1] : sorted[idx + 1];
        if (!swap) return;
        router.patch(route('admin.settings.packages.update', { package: pkg.id }),
            pkgPayload(pkg, { display_order: swap.display_order }),
            { preserveScroll: true });
        router.patch(route('admin.settings.packages.update', { package: swap.id }),
            pkgPayload(swap, { display_order: pkg.display_order }),
            { preserveScroll: true });
    }

    return (
        <div className="flex flex-col gap-0.5">
            <button onClick={() => move('up')} disabled={isFirst}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25">
                <ChevronUp className="size-3.5" />
            </button>
            <button onClick={() => move('down')} disabled={isLast}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25">
                <ChevronDown className="size-3.5" />
            </button>
        </div>
    );
}

// ─── Package Tier Card ────────────────────────────────────────────────────────

function PackageTierCard({
    pkg,
    tier,
    invType,
    onEdit,
    onDelete,
    onToggle,
}: {
    pkg: PackageData | undefined;
    tier: PackageTier;
    invType: InvTypeConfig;
    onEdit: (p: PackageData) => void;
    onDelete: (p: PackageData) => void;
    onToggle: (p: PackageData) => void;
}) {
    const tierMeta = TIER_META[tier];
    const TierIcon = tierMeta.icon;

    if (!pkg) {
        return (
            <div className={`rounded-2xl border-2 border-dashed ${invType.borderColor} ${invType.bgColor} p-5 flex flex-col items-center justify-center gap-2 min-h-[200px] opacity-60`}>
                <TierIcon className={`size-6 ${invType.textColor}`} />
                <p className="text-xs font-semibold text-muted-foreground">{tierMeta.label}</p>
                <p className="text-[11px] text-muted-foreground text-center">Belum ada paket</p>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border-2 bg-card shadow-sm overflow-hidden transition-all hover:shadow-md ${pkg.is_active ? tierMeta.borderClass : 'border-border/40 opacity-60'}`}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between ${tierMeta.badgeClass.replace('text-', 'bg-').split(' ')[0]}/10`}>
                <div className="flex items-center gap-2">
                    <div className={`flex size-7 items-center justify-center rounded-lg ${tierMeta.badgeClass}`}>
                        <TierIcon className="size-3.5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">{pkg.label}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{pkg.name}</p>
                    </div>
                </div>
                {tierMeta.popular && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        <Sparkles className="size-2.5" />Populer
                    </span>
                )}
            </div>

            {/* Price */}
            <div className="px-4 pt-3 pb-2 border-b border-border/30">
                <p className="text-xl font-bold text-foreground">{formatRp(pkg.price)}</p>
                <p className="text-[11px] text-muted-foreground">
                    {pkg.billing_period === 'month' ? 'per bulan' : pkg.billing_period === 'year' ? 'per tahun' : 'sekali bayar'}
                </p>
            </div>

            {/* Details */}
            <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Timer className="size-3" />Masa aktif</span>
                    <span className="font-medium text-foreground">{pkg.duration_days} hari</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><FlaskConical className="size-3" />Trial gratis</span>
                    <span className={`font-medium ${pkg.trial_days > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {pkg.trial_days > 0 ? `${pkg.trial_days} hari` : '—'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Image className="size-3" />Galeri</span>
                    <span className={`font-medium ${pkg.max_gallery_uploads === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                        {pkg.max_gallery_uploads === 0 ? '∞' : pkg.max_gallery_uploads} foto
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fitur aktif</span>
                    <span className="font-medium text-foreground">{pkg.features.filter((f) => f.feature_value !== 'false').length} fitur</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-2">
                <button
                    onClick={() => onToggle(pkg)}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all inline-flex items-center justify-center gap-1 ${
                        pkg.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    {pkg.is_active ? <><ToggleRight className="size-3.5" />Aktif</> : <><ToggleLeft className="size-3.5" />Nonaktif</>}
                </button>
                <button
                    onClick={() => onEdit(pkg)}
                    className="rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1"
                >
                    <Edit className="size-3" />Edit
                </button>
                <button
                    onClick={() => onDelete(pkg)}
                    className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus paket"
                >
                    <Trash2 className="size-3" />
                </button>
            </div>
        </div>
    );
}

// ─── Tab: Daftar Paket ────────────────────────────────────────────────────────

function TabPackages({ packages }: { packages: PackageData[] }) {
    const [editTarget,   setEditTarget]   = useState<PackageData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PackageData | null>(null);
    const [showAdd,      setShowAdd]      = useState(false);
    const [activeType,   setActiveType]   = useState<InvitationType | 'all'>('pernikahan');

    const activeCount = packages.filter((p) => p.is_active).length;

    function toggleStatus(pkg: PackageData) {
        router.patch(
            route('admin.settings.packages.update', { package: pkg.id }),
            {
                invitation_type: pkg.invitation_type, label: pkg.label, description: pkg.description,
                price: pkg.price, billing_period: pkg.billing_period, duration_days: pkg.duration_days,
                trial_days: pkg.trial_days, max_gallery_uploads: pkg.max_gallery_uploads,
                is_active: !pkg.is_active, display_order: pkg.display_order,
            },
            { preserveScroll: true },
        );
    }

    // Packages that have no invitation_type go in "all" / "umum"
    const typePackages = (type: InvitationType) =>
        packages.filter((p) => p.invitation_type === type);

    const generalPackages = packages.filter((p) => !p.invitation_type);

    function findTierPkg(type: InvitationType, tier: PackageTier) {
        
        return typePackages(type).find((p) => getTier(p.name) === tier);
    }

    const selectedTypeConfig = INVITATION_TYPES.find((t) => t.key === activeType);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Paket',     value: String(packages.length),  sub: 'terdaftar',      icon: Package      },
                    { label: 'Paket Aktif',     value: String(activeCount),       sub: 'tersedia',       icon: Check        },
                    { label: 'Jenis Undangan',  value: String(INVITATION_TYPES.length), sub: 'jenis didukung', icon: LayoutList  },
                    { label: 'Paket per Jenis', value: '3',                       sub: 'Basic · Premium · Exclusive', icon: Star },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <Icon className="size-3.5 text-muted-foreground/50" />
                            </div>
                            <p className="text-xl font-bold text-foreground">{s.value}</p>
                            <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Invitation Type Tabs */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border/40 bg-muted/10 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Paket per Jenis Undangan</h2>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="size-3.5" />Tambah Paket
                    </button>
                </div>

                {/* Type selector */}
                <div className="flex flex-wrap gap-2 p-4 border-b border-border/30">
                    {INVITATION_TYPES.map((t) => {
                        const count = typePackages(t.key).length;
                        const isActive = activeType === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setActiveType(t.key)}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all border-2 ${
                                    isActive
                                        ? `${t.borderColor} ${t.bgColor} ${t.textColor}`
                                        : 'border-border/40 bg-background text-muted-foreground hover:border-border hover:text-foreground'
                                }`}
                            >
                                <span className="text-base leading-none">{t.icon}</span>
                                <span>{t.label}</span>
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    isActive ? `${t.bgColor} ${t.textColor}` : 'bg-muted text-muted-foreground'
                                }`}>{count}/3</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setActiveType('all')}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all border-2 ${
                            activeType === 'all'
                                ? 'border-border bg-muted text-foreground'
                                : 'border-border/40 bg-background text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                    >
                        <span className="text-base leading-none">📦</span>
                        <span>Umum</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{generalPackages.length}</span>
                    </button>
                </div>

                {/* Package cards for selected type */}
                <div className="p-5">
                    {activeType !== 'all' && selectedTypeConfig ? (
                        <>
                            <div className={`flex items-center gap-2 mb-4 rounded-xl px-4 py-2.5 ${selectedTypeConfig.bgColor} border ${selectedTypeConfig.borderColor}`}>
                                <span className="text-xl">{selectedTypeConfig.icon}</span>
                                <div>
                                    <p className={`text-sm font-bold ${selectedTypeConfig.textColor}`}>{selectedTypeConfig.label}</p>
                                    <p className="text-[11px] text-muted-foreground">3 tingkatan paket: Basic · Premium · Exclusive</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {PACKAGE_TIERS.map((tier) => (
                                    <PackageTierCard
                                        key={tier}
                                        tier={tier}
                                        pkg={findTierPkg(activeType, tier)}
                                        invType={selectedTypeConfig}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                        onToggle={toggleStatus}
                                    />
                                ))}
                            </div>
                            {typePackages(activeType).length === 0 && (
                                <p className="mt-3 text-xs text-muted-foreground text-center">
                                    Belum ada paket untuk jenis ini. Klik <strong>Tambah Paket</strong> dan pilih jenis <strong>{selectedTypeConfig.label}</strong>.
                                </p>
                            )}
                        </>
                    ) : (
                        /* General / all packages */
                        generalPackages.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
                                Belum ada paket umum. Klik <strong>Tambah Paket</strong> tanpa memilih jenis undangan.
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border/40 bg-muted/20">
                                                {['Paket','Harga','Masa Aktif','Trial','Galeri','Status','Aksi'].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {[...generalPackages].sort((a, b) => a.display_order - b.display_order).map((pkg) => {
                                                const meta = pkgMeta(pkg.name);
                                                const Icon = meta.icon;
                                                return (
                                                    <tr key={pkg.id} className="group hover:bg-muted/20 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex size-8 items-center justify-center rounded-xl shrink-0 ${meta.badgeClass}`}>
                                                                    <Icon className="size-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
                                                                    <p className="text-[11px] font-mono text-muted-foreground">{pkg.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <p className="text-sm font-bold text-foreground">{formatRp(pkg.price)}</p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {pkg.billing_period === 'month' ? 'per bulan' : pkg.billing_period === 'year' ? 'per tahun' : 'sekali bayar'}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
                                                                <Timer className="size-3 text-muted-foreground" />{pkg.duration_days} hari
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {pkg.trial_days > 0 ? (
                                                                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                                    <FlaskConical className="size-3" />{pkg.trial_days} hari
                                                                </span>
                                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${pkg.max_gallery_uploads === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-muted/50 text-foreground'}`}>
                                                                <Image className="size-3" />{pkg.max_gallery_uploads === 0 ? '∞' : pkg.max_gallery_uploads}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button onClick={() => toggleStatus(pkg)}
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80 ${pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                                                {pkg.is_active ? <><ToggleRight className="size-3.5" />Aktif</> : <><ToggleLeft className="size-3.5" />Nonaktif</>}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => setEditTarget(pkg)}
                                                                    className="rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1">
                                                                    <Edit className="size-3" />Edit
                                                                </button>
                                                                <button onClick={() => setDeleteTarget(pkg)}
                                                                    className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                                                                    <Trash2 className="size-3" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            <TrialFlowInfo packages={packages} />

            <p className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-amber-700">
                Perubahan harga berlaku untuk pembelian baru. Paket aktif pelanggan tidak terpengaruh.
            </p>

            {editTarget   && <EditPackageModal    pkg={editTarget}   onClose={() => setEditTarget(null)}   />}
            {deleteTarget && <DeleteConfirmModal  pkg={deleteTarget} onClose={() => setDeleteTarget(null)} />}
            {showAdd      && <AddPackageModal     onClose={() => setShowAdd(false)} />}
        </div>
    );
}

// ─── Tab: Fitur Paket ─────────────────────────────────────────────────────────

// Sesuai dengan database/seeders/PackageSeeder.php dan PLATFORM_FULL_DESIGN.md
const featureMatrix = [
    // Konten Dasar
    { key: 'unlimited_guests',    label: 'Tamu Tidak Terbatas',          cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    { key: 'guestbook',           label: 'Buku Tamu Digital',            cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    { key: 'rsvp_advanced',       label: 'RSVP Lengkap + Konfirmasi',    cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    { key: 'countdown',           label: 'Countdown Timer',              cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    { key: 'maps',                label: 'Google Maps Embed',            cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    { key: 'qr_code',             label: 'QR Code Undangan',             cat: 'Konten Dasar',  basic: true,  premium: true,  exclusive: true  },
    // Konten Lanjutan
    { key: 'music',               label: 'Musik Latar',                  cat: 'Konten Lanjutan', basic: false, premium: true, exclusive: true  },
    { key: 'dress_code',          label: 'Dress Code Info',              cat: 'Konten Lanjutan', basic: false, premium: true, exclusive: true  },
    { key: 'gender_poll',         label: 'Gender Poll / Prediksi',       cat: 'Konten Lanjutan', basic: false, premium: true, exclusive: true  },
    { key: 'interactive_games',   label: 'Mini Games Interaktif',        cat: 'Konten Lanjutan', basic: false, premium: true, exclusive: true  },
    { key: 'live_stream',         label: 'Live Streaming',               cat: 'Konten Lanjutan', basic: false, premium: false, exclusive: true  },
    // Desain & Tema
    { key: 'all_templates',       label: 'Semua Template',               cat: 'Desain & Tema', basic: false, premium: true,  exclusive: true  },
    { key: 'exclusive_templates', label: 'Template Eksklusif',           cat: 'Desain & Tema', basic: false, premium: false, exclusive: true  },
    { key: 'custom_css',          label: 'Custom CSS',                   cat: 'Desain & Tema', basic: false, premium: false, exclusive: true  },
    { key: 'page_builder',        label: 'Page Builder (Drag & Drop)',   cat: 'Desain & Tema', basic: false, premium: false, exclusive: true  },
    // Domain & Akses
    { key: 'custom_domain',       label: 'Custom Domain',                cat: 'Domain & Akses', basic: false, premium: true, exclusive: true  },
    { key: 'page_password',       label: 'Password Halaman Undangan',    cat: 'Domain & Akses', basic: false, premium: true, exclusive: true  },
    { key: 'custom_branding',     label: 'Custom Branding (No Watermark)', cat: 'Domain & Akses', basic: false, premium: false, exclusive: true },
    // Komunikasi
    { key: 'wa_reminders',        label: 'WhatsApp Reminder Tamu',       cat: 'Komunikasi',   basic: false, premium: true,  exclusive: true  },
    { key: 'wa_blast',            label: 'WhatsApp Blast Massal',        cat: 'Komunikasi',   basic: false, premium: true,  exclusive: true  },
    { key: 'email_marketing',     label: 'Email Marketing',              cat: 'Komunikasi',   basic: false, premium: false, exclusive: true  },
    // Gift & Monetisasi
    { key: 'amplop_digital',      label: 'Amplop Digital (Rekening)',    cat: 'Gift & Monetisasi', basic: false, premium: true, exclusive: true },
    { key: 'gift_wishlist',       label: 'Gift Wishlist',                cat: 'Gift & Monetisasi', basic: false, premium: true, exclusive: true },
    { key: 'qris_envelope',       label: 'Amplop Digital (QRIS)',        cat: 'Gift & Monetisasi', basic: false, premium: false, exclusive: true },
    // Premium Eksklusif
    { key: 'instagram_filter',    label: 'Instagram Filter AR',          cat: 'Fitur Eksklusif', basic: false, premium: false, exclusive: true },
    { key: 'api_access',          label: 'API Access',                   cat: 'Fitur Eksklusif', basic: false, premium: false, exclusive: true },
    { key: 'priority_support',    label: 'Prioritas Support',            cat: 'Fitur Eksklusif', basic: false, premium: false, exclusive: true },
    { key: 'account_manager',     label: 'Account Manager Dedicated',   cat: 'Fitur Eksklusif', basic: false, premium: false, exclusive: true },
];

function TabFeatures() {
    const cats = [...new Set(featureMatrix.map((f) => f.cat))];
    return (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Matriks Fitur per Paket</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Kelola fitur yang tersedia di setiap paket layanan.</p>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    <Plus className="size-3.5" />Tambah Fitur
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/40 bg-muted/10">
                            <th className="w-[50%] px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fitur</th>
                            <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold text-sky-600">Basic</th>
                            <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold text-primary">Premium</th>
                            <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold text-amber-600">Exclusive</th>
                            <th className="w-[5%] px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cats.map((cat) => (
                            <>
                                <tr key={`hd-${cat}`} className="border-y border-border/30 bg-muted/5">
                                    <td colSpan={5} className="px-4 py-1.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat}</span>
                                    </td>
                                </tr>
                                {featureMatrix.filter((f) => f.cat === cat).map((f) => (
                                    <tr key={f.key} className="group border-b border-border/20 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <p className="text-sm text-foreground">{f.label}</p>
                                            <p className="font-mono text-[11px] text-muted-foreground">{f.key}</p>
                                        </td>
                                        {([f.basic, f.premium, f.exclusive] as boolean[]).map((val, i) => (
                                            <td key={i} className="px-4 py-2.5">
                                                <div className="flex justify-center">
                                                    <span className={`flex size-5 items-center justify-center rounded-full ${val ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground/30'}`}>
                                                        <Check className="size-3" />
                                                    </span>
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-4 py-2.5 text-center">
                                            <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                                                <Edit className="size-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Tab: Batas Penggunaan ────────────────────────────────────────────────────

function TabLimits({ packages }: { packages: PackageData[] }) {
    const basic     = packages.find((p) => p.name === 'basic');
    const premium   = packages.find((p) => p.name === 'premium');
    const exclusive = packages.find((p) => p.name === 'exclusive');

    const rows: { label: string; key: string; basic: string; premium: string; exclusive: string; unit: string; highlight?: boolean; note?: string }[] = [
        {
            label: 'Jumlah Tamu', key: 'max_guests',
            basic: '∞', premium: '∞', exclusive: '∞', unit: 'tamu',
            note: 'Tidak terbatas di semua paket',
        },
        {
            label: 'Upload Galeri', key: 'max_gallery_uploads',
            basic:     basic?.max_gallery_uploads     === 0 ? '∞' : String(basic?.max_gallery_uploads     ?? 10),
            premium:   premium?.max_gallery_uploads   === 0 ? '∞' : String(premium?.max_gallery_uploads   ?? 50),
            exclusive: exclusive?.max_gallery_uploads === 0 ? '∞' : String(exclusive?.max_gallery_uploads ?? 0),
            unit: 'foto', highlight: true,
        },
        {
            label: 'Jumlah Video', key: 'max_videos',
            basic: '0', premium: '5', exclusive: '∞', unit: 'video',
        },
        {
            label: 'Kapasitas Storage', key: 'storage_mb',
            basic: '50', premium: '500', exclusive: '2048', unit: 'MB',
        },
        {
            label: 'RSVP Konfirmasi', key: 'rsvp_confirm',
            basic: '∞', premium: '∞', exclusive: '∞', unit: 'konfirmasi',
            note: 'Tidak terbatas di semua paket',
        },
        {
            label: 'WA Blast / hari', key: 'wa_blast_day',
            basic: '0', premium: '200', exclusive: '1000', unit: 'pesan',
        },
        {
            label: 'Custom Domain', key: 'custom_domains',
            basic: '0', premium: '1', exclusive: '3', unit: 'domain',
        },
        {
            label: 'Masa Aktif (setelah bayar)', key: 'duration_days',
            basic:     String(basic?.duration_days     ?? 90),
            premium:   String(premium?.duration_days   ?? 180),
            exclusive: String(exclusive?.duration_days ?? 365),
            unit: 'hari',
        },
        {
            label: 'Trial Gratis (sebelum bayar)', key: 'trial_days',
            basic:     String(basic?.trial_days     ?? 0),
            premium:   String(premium?.trial_days   ?? 0),
            exclusive: String(exclusive?.trial_days ?? 0),
            unit: 'hari', highlight: true,
            note: 'Akses penuh diberikan tanpa pembayaran selama periode ini',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
                    <h2 className="text-sm font-semibold text-foreground">Batas Penggunaan per Paket</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">∞ = tidak terbatas. Nilai 0 = fitur tidak tersedia atau tidak ada.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Resource</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-sky-600">Basic</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-primary">Premium</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-amber-600">Exclusive</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Satuan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {rows.map((r) => (
                                <tr key={r.key} className={`hover:bg-muted/20 transition-colors ${r.highlight ? 'bg-primary/[0.03]' : ''}`}>
                                    <td className="px-4 py-3">
                                        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                            {r.key === 'trial_days'          && <FlaskConical className="size-3.5 text-primary" />}
                                            {r.key === 'max_gallery_uploads' && <Image        className="size-3.5 text-primary" />}
                                            {r.key === 'duration_days'       && <Timer        className="size-3.5 text-muted-foreground" />}
                                            {r.label}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground">{r.key}</p>
                                        {r.note && <p className="text-[11px] text-primary/70 mt-0.5">{r.note}</p>}
                                    </td>
                                    {([r.basic, r.premium, r.exclusive] as string[]).map((val, i) => (
                                        <td key={i} className="px-4 py-3 text-center">
                                            <span className={`inline-block rounded-lg px-2.5 py-1 font-mono text-sm font-semibold ${
                                                val === '∞'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : val === '0'
                                                    ? 'bg-muted text-muted-foreground'
                                                    : r.highlight
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted/50 text-foreground'
                                            }`}>
                                                {val}
                                            </span>
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-border/40 bg-amber-50/50 px-5 py-3">
                    <p className="flex items-center gap-1.5 text-xs text-amber-700">
                        <Sliders className="size-3.5 shrink-0" />
                        Nilai masa aktif dan trial dapat diubah per-paket melalui tombol Edit di tab Daftar Paket.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Harga & Promo ───────────────────────────────────────────────────────

function TabPromo({ packages }: { packages: PackageData[] }) {
    const promos = [
        { code: 'UNDESIA20',  type: 'Persentase', value: '20%',       minOrder: 'Rp 100.000', used: 45,  limit: 100, exp: '31 Jul 2026', status: 'active'   },
        { code: 'NEWUSER50K', type: 'Nominal',    value: 'Rp 50.000', minOrder: 'Rp 150.000', used: 128, limit: 500, exp: '30 Jun 2026', status: 'active'   },
        { code: 'LEBARAN30',  type: 'Persentase', value: '30%',       minOrder: 'Rp 200.000', used: 200, limit: 200, exp: '20 Apr 2026', status: 'expired'  },
        { code: 'BASIC2FREE', type: 'Gratis',     value: '1 bulan',   minOrder: 'Rp 99.000',  used: 10,  limit: 50,  exp: '31 Agt 2026', status: 'inactive' },
    ];
    const statusCls: Record<string, string>   = { active: 'bg-emerald-100 text-emerald-700', expired: 'bg-muted text-muted-foreground', inactive: 'bg-amber-100 text-amber-700' };
    const statusLabel: Record<string, string> = { active: 'Aktif', expired: 'Kedaluwarsa', inactive: 'Nonaktif' };

    return (
        <div className="space-y-6">
            {/* Ringkasan harga */}
            <div className="grid grid-cols-3 gap-4">
                {packages.map((p) => {
                    const meta = pkgMeta(p.name);
                    const Icon = meta.icon;
                    return (
                        <div key={p.id} className={`rounded-2xl border-2 bg-card p-5 shadow-sm ${meta.popular ? meta.borderClass : 'border-border/60'}`}>
                            <div className="mb-3 flex items-center gap-2">
                                <div className={`flex size-7 items-center justify-center rounded-lg ${meta.badgeClass}`}><Icon className="size-3.5" /></div>
                                <h3 className="text-sm font-bold text-foreground">{p.label}</h3>
                                {meta.popular && <span className="text-[10px] font-medium text-primary">★ Populer</span>}
                            </div>
                            <p className="text-2xl font-bold text-foreground">{formatRp(p.price)}</p>
                            <p className="mt-0.5 mb-3 text-xs text-muted-foreground">per acara</p>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1"><Timer className="size-3" />Masa aktif</span>
                                    <span className="font-medium text-foreground">{p.duration_days} hari</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1"><FlaskConical className="size-3" />Trial gratis</span>
                                    <span className={`font-medium ${p.trial_days > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {p.trial_days > 0 ? `${p.trial_days} hari` : '–'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1"><Image className="size-3" />Maks. Galeri</span>
                                    <span className={`font-medium ${p.max_gallery_uploads === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                                        {p.max_gallery_uploads === 0 ? '∞' : p.max_gallery_uploads}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Kode Promo */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Tag className="size-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Kode Promo</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">Kelola kode diskon dan promosi platform.</p>
                        </div>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                        <Plus className="size-3.5" />Buat Kode Promo
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                {['Kode','Tipe','Nilai Diskon','Min. Order','Penggunaan','Kadaluarsa','Status',''].map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {promos.map((p) => (
                                <tr key={p.code} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5"><span className="font-mono text-sm font-bold text-foreground">{p.code}</span></td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.type}</td>
                                    <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{p.value}</td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.minOrder}</td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((p.used / p.limit) * 100, 100)}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{p.used}/{p.limit}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.exp}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls[p.status]}`}>{statusLabel[p.status]}</span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <button className="text-muted-foreground hover:text-foreground transition-colors"><Edit className="size-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPackages() {
    const { packages } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<string>('packages');

    const panels: Record<string, React.ReactNode> = {
        packages: <TabPackages packages={packages} />,
        features: <TabFeatures />,
        limits:   <TabLimits packages={packages} />,
        promo:    <TabPromo packages={packages} />,
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Paket" />
            <SettingsLayout>
                <SettingsTabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                <div className="mx-auto max-w-6xl p-6">
                    <FlashBanner />
                    {panels[activeTab]}
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}
