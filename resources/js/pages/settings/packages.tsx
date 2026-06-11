import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Crown,
    Edit2,
    FlaskConical,
    Image,
    MoreVertical,
    Package,
    Plus,
    Save,
    Star,
    Timer,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageData {
    id: number;
    name: string;
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
}

interface PageProps {
    packages: PackageData[];
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

type FormErrors = Partial<Record<string, string>>;

interface FormState {
    name: string;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan', href: '/settings/profile' },
    { title: 'Manajemen Paket', href: '/settings/packages' },
];

const BILLING_LABELS: Record<string, string> = {
    month: 'Per Bulan',
    year:  'Per Tahun',
    once:  'Sekali Bayar',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function pkgIcon(name: string) {
    if (name === 'premium')  return { Icon: Star,  color: 'text-primary',   bg: 'bg-primary/10'  };
    if (name === 'exclusive') return { Icon: Crown, color: 'text-amber-600', bg: 'bg-amber-100'   };
    return { Icon: Zap, color: 'text-sky-600', bg: 'bg-sky-100' };
}

function pkgToForm(pkg: PackageData): FormState {
    return {
        name:                pkg.name,
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

const emptyForm: FormState = {
    name: '', label: '', description: '',
    price: '0', billing_period: 'month',
    duration_days: '90', trial_days: '0',
    max_gallery_uploads: '0',
    is_active: true, display_order: '',
};

// ─── Micro-components ─────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="size-3 shrink-0" />{msg}
        </p>
    );
}

function Field({
    label, value, onChange, type = 'text', suffix, min, max, required, error, hint, placeholder, disabled,
}: {
    label: React.ReactNode; value: string; onChange: (v: string) => void;
    type?: string; suffix?: string; min?: number; max?: number;
    required?: boolean; error?: string; hint?: string; placeholder?: string; disabled?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className={`flex items-center rounded-lg border bg-background overflow-hidden transition-all ${
                disabled ? 'border-border/30 opacity-60' : 'border-border/60 focus-within:ring-2 focus-within:ring-primary/30'
            }`}>
                <input
                    type={type} value={value} placeholder={placeholder}
                    min={min} max={max} disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
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
                value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FieldError msg={error} />
        </div>
    );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
            <button type="button" onClick={() => onChange(!value)}
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

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">{label}</span>
            <div className="flex-1 h-px bg-border/50" />
        </div>
    );
}

function Spinner() {
    return <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />;
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
            <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="size-4" />
            </button>
        </div>
    );
}

// ─── Package Form Modal ───────────────────────────────────────────────────────

function PackageModal({
    mode, pkg, onClose,
}: {
    mode: 'add' | 'edit';
    pkg?: PackageData;
    onClose: () => void;
}) {
    const [form, setForm]           = useState<FormState>(() => pkg ? pkgToForm(pkg) : emptyForm);
    const [errors, setErrors]       = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    function set<K extends keyof FormState>(key: K, val: FormState[K]) {
        setForm((p) => ({ ...p, [key]: val }));
        setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            label: form.label, description: form.description,
            price: form.price, billing_period: form.billing_period,
            duration_days: form.duration_days, trial_days: form.trial_days,
            max_gallery_uploads: form.max_gallery_uploads,
            is_active: form.is_active, display_order: form.display_order,
        };

        if (mode === 'edit' && pkg) {
            router.patch(
                route('settings.packages.update', { package: pkg.id }),
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => { setProcessing(false); onClose(); },
                    onError: (errs) => { setProcessing(false); setErrors(errs); },
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(
                route('settings.packages.store'),
                { name: form.name, ...payload, display_order: form.display_order || undefined },
                {
                    preserveScroll: true,
                    onSuccess: () => { setProcessing(false); onClose(); },
                    onError: (errs) => { setProcessing(false); setErrors(errs); },
                    onFinish: () => setProcessing(false),
                },
            );
        }
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
                        <h2 className="text-sm font-semibold text-foreground">
                            {mode === 'add' ? 'Tambah Paket Baru' : `Edit Paket`}
                        </h2>
                        {pkg && <p className="text-xs font-mono text-muted-foreground mt-0.5">{pkg.name.toUpperCase()}</p>}
                    </div>
                    <button onClick={onClose} disabled={processing}
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">

                        <Divider label="Identitas Paket" />

                        {mode === 'add' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    label="Kode Internal" required placeholder="mis: pro"
                                    value={form.name}
                                    onChange={(v) => set('name', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    hint="huruf kecil, angka, underscore"
                                    error={errors.name}
                                />
                                <Field
                                    label="Nama Tampilan" required placeholder="Paket Pro"
                                    value={form.label} onChange={(v) => set('label', v)}
                                    error={errors.label}
                                />
                            </div>
                        ) : (
                            <Field
                                label="Nama Tampilan" required
                                value={form.label} onChange={(v) => set('label', v)}
                                error={errors.label}
                            />
                        )}

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Deskripsi</label>
                            <textarea
                                value={form.description} rows={2}
                                onChange={(e) => set('description', e.target.value)}
                                placeholder="Deskripsi singkat paket…"
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                            />
                        </div>

                        <Divider label="Harga & Penagihan" />

                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label="Harga" required type="number"
                                value={form.price} onChange={(v) => set('price', v)}
                                min={0} suffix="IDR" error={errors.price}
                            />
                            <SelectField
                                label="Periode Tagihan" required
                                value={form.billing_period} onChange={(v) => set('billing_period', v)}
                                options={[
                                    { value: 'month', label: 'Per Bulan'     },
                                    { value: 'year',  label: 'Per Tahun'     },
                                    { value: 'once',  label: 'Sekali Bayar'  },
                                ]}
                                error={errors.billing_period}
                            />
                        </div>

                        <Divider label="Trial & Masa Aktif" />

                        {/* Trial info */}
                        <div className={`rounded-lg border px-3 py-2.5 text-xs flex items-start gap-2 ${
                            trialDays > 0
                                ? 'border-primary/20 bg-primary/5 text-primary'
                                : 'border-border/50 bg-muted/20 text-muted-foreground'
                        }`}>
                            <FlaskConical className="size-3.5 mt-0.5 shrink-0" />
                            <span>
                                {trialDays > 0
                                    ? `Pengguna mendapat akses penuh ${trialDays} hari tanpa perlu bayar terlebih dahulu.`
                                    : 'Tidak ada trial — pembayaran diperlukan sebelum akses diberikan.'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label={<span className="flex items-center gap-1"><FlaskConical className="size-3 text-primary" />Trial Gratis</span>}
                                required type="number"
                                value={form.trial_days} onChange={(v) => set('trial_days', v)}
                                min={0} max={365} suffix="hari"
                                hint="0 = tidak ada trial"
                                error={errors.trial_days}
                            />
                            <Field
                                label={<span className="flex items-center gap-1"><Timer className="size-3" />Masa Aktif</span>}
                                required type="number"
                                value={form.duration_days} onChange={(v) => set('duration_days', v)}
                                min={1} max={3650} suffix="hari"
                                hint="Dihitung sejak bayar"
                                error={errors.duration_days}
                            />
                        </div>

                        <Divider label="Batas & Tampilan" />

                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label={<span className="flex items-center gap-1"><Image className="size-3" />Maks. Galeri</span>}
                                required type="number"
                                value={form.max_gallery_uploads} onChange={(v) => set('max_gallery_uploads', v)}
                                min={0} suffix="foto"
                                hint="0 = tidak terbatas"
                                error={errors.max_gallery_uploads}
                            />
                            <Field
                                label="Urutan Tampil" type="number"
                                value={form.display_order} onChange={(v) => set('display_order', v)}
                                min={0} error={errors.display_order}
                            />
                        </div>

                        <Toggle label="Status Paket" value={form.is_active} onChange={(v) => set('is_active', v)} />

                        {errors.general && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{errors.general}</div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-muted/10">
                        <button type="button" onClick={onClose} disabled={processing}
                            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                            Batal
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                            {processing ? <Spinner /> : <Save className="size-3.5" />}
                            {processing ? 'Menyimpan…' : mode === 'add' ? 'Tambah Paket' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Package Row (table) ──────────────────────────────────────────────────────

function PackageRow({ pkg, onEdit }: { pkg: PackageData; onEdit: () => void }) {
    const { Icon, color, bg } = pkgIcon(pkg.name);
    const [menuOpen, setMenuOpen] = useState(false);

    function toggleActive() {
        router.patch(
            route('settings.packages.update', { package: pkg.id }),
            {
                label: pkg.label, description: pkg.description,
                price: pkg.price, billing_period: pkg.billing_period,
                duration_days: pkg.duration_days, trial_days: pkg.trial_days,
                max_gallery_uploads: pkg.max_gallery_uploads,
                is_active: !pkg.is_active, display_order: pkg.display_order,
            },
            { preserveScroll: true },
        );
    }

    return (
        <tr className="group border-b border-border/30 hover:bg-muted/20 transition-colors">
            {/* Nama */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${bg} shrink-0`}>
                        <Icon className={`size-4 ${color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{pkg.name}</p>
                    </div>
                </div>
            </td>

            {/* Harga */}
            <td className="px-4 py-3">
                <p className="text-sm font-bold text-foreground">{formatRp(pkg.price)}</p>
                <p className="text-[11px] text-muted-foreground">{BILLING_LABELS[pkg.billing_period] ?? pkg.billing_period}</p>
            </td>

            {/* Masa Aktif */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Timer className="size-3.5 text-muted-foreground" />
                    {pkg.duration_days} hari
                </div>
            </td>

            {/* Trial */}
            <td className="px-4 py-3">
                {pkg.trial_days > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <FlaskConical className="size-3" />{pkg.trial_days} hari
                    </span>
                ) : (
                    <span className="text-[11px] text-muted-foreground">Tidak ada</span>
                )}
            </td>

            {/* Galeri */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs">
                    <Image className="size-3.5 text-muted-foreground" />
                    <span className={pkg.max_gallery_uploads === 0 ? 'font-semibold text-emerald-600' : 'text-foreground'}>
                        {pkg.max_gallery_uploads === 0 ? '∞' : pkg.max_gallery_uploads}
                    </span>
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <button
                    onClick={toggleActive}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        pkg.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    <span className={`size-1.5 rounded-full ${pkg.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                </button>
            </td>

            {/* Urutan */}
            <td className="px-4 py-3 text-center">
                <span className="text-xs font-mono text-muted-foreground">{pkg.display_order}</span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={onEdit}
                        title="Edit paket"
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Edit2 className="size-3.5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <MoreVertical className="size-3.5" />
                        </button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => { toggleActive(); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors"
                                    >
                                        {pkg.is_active ? <ToggleLeft className="size-3.5" /> : <ToggleRight className="size-3.5" />}
                                        {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-border/30"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Hapus
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStats({ packages }: { packages: PackageData[] }) {
    const active   = packages.filter((p) => p.is_active).length;
    const withTrial = packages.filter((p) => p.trial_days > 0).length;
    const cheapest  = packages.length ? Math.min(...packages.map((p) => p.price)) : 0;
    const expensive = packages.length ? Math.max(...packages.map((p) => p.price)) : 0;

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
                { label: 'Total Paket',    value: String(packages.length), sub: 'terdaftar',      icon: Package      },
                { label: 'Paket Aktif',    value: String(active),          sub: 'tersedia',       icon: Clock        },
                { label: 'Dengan Trial',   value: String(withTrial),       sub: 'paket',          icon: FlaskConical },
                { label: 'Rentang Harga',  value: formatRp(cheapest),      sub: `s/d ${formatRp(expensive)}`, icon: Zap },
            ].map((s) => {
                const Icon = s.icon;
                return (
                    <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Icon className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-sm font-bold text-foreground truncate">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{s.sub}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Order Controls ───────────────────────────────────────────────────────────

function OrderControls({ pkg, isFirst, isLast }: { pkg: PackageData; isFirst: boolean; isLast: boolean }) {
    function move(direction: 'up' | 'down') {
        const newOrder = direction === 'up' ? pkg.display_order - 1 : pkg.display_order + 1;
        router.patch(
            route('settings.packages.update', { package: pkg.id }),
            {
                label: pkg.label, description: pkg.description,
                price: pkg.price, billing_period: pkg.billing_period,
                duration_days: pkg.duration_days, trial_days: pkg.trial_days,
                max_gallery_uploads: pkg.max_gallery_uploads,
                is_active: pkg.is_active, display_order: newOrder,
            },
            { preserveScroll: true },
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <button
                onClick={() => move('up')} disabled={isFirst}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
                <ChevronUp className="size-3.5" />
            </button>
            <button
                onClick={() => move('down')} disabled={isLast}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
                <ChevronDown className="size-3.5" />
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPackages() {
    const { packages } = usePage<PageProps>().props;
    const [editTarget, setEditTarget] = useState<PackageData | null>(null);
    const [showAdd,    setShowAdd]    = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Paket" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Manajemen Paket Layanan"
                        description="Kelola paket berlangganan, harga, masa trial, dan batas penggunaan."
                    />

                    <FlashBanner />

                    {/* Stats */}
                    <QuickStats packages={packages} />

                    {/* Table */}
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Daftar Paket</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {packages.length} paket terdaftar · {packages.filter((p) => p.is_active).length} aktif
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAdd(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Plus className="size-3.5" />Tambah Paket
                            </button>
                        </div>

                        {packages.length === 0 ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                Belum ada paket. Klik <strong>Tambah Paket</strong> untuk memulai.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/5">
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Paket</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Harga</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Masa Aktif</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Trial</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Galeri</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Urutan</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packages.map((pkg, idx) => (
                                            <tr key={pkg.id} className="group border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                {/* Nama */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <OrderControls
                                                            pkg={pkg}
                                                            isFirst={idx === 0}
                                                            isLast={idx === packages.length - 1}
                                                        />
                                                        <div className={`flex size-8 items-center justify-center rounded-lg ${pkgIcon(pkg.name).bg} shrink-0`}>
                                                            {(() => { const { Icon, color } = pkgIcon(pkg.name); return <Icon className={`size-4 ${color}`} />; })()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
                                                            <p className="text-[11px] font-mono text-muted-foreground">{pkg.name}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Harga */}
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-bold text-foreground">{formatRp(pkg.price)}</p>
                                                    <p className="text-[11px] text-muted-foreground">{BILLING_LABELS[pkg.billing_period] ?? pkg.billing_period}</p>
                                                </td>

                                                {/* Masa Aktif */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                        <Timer className="size-3.5 text-muted-foreground" />
                                                        {pkg.duration_days} hari
                                                    </div>
                                                </td>

                                                {/* Trial */}
                                                <td className="px-4 py-3">
                                                    {pkg.trial_days > 0 ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                                            <FlaskConical className="size-3" />{pkg.trial_days} hari
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground">–</span>
                                                    )}
                                                </td>

                                                {/* Galeri */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Image className="size-3.5 text-muted-foreground" />
                                                        <span className={pkg.max_gallery_uploads === 0 ? 'font-semibold text-emerald-600' : 'text-foreground'}>
                                                            {pkg.max_gallery_uploads === 0 ? '∞' : pkg.max_gallery_uploads}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status toggle */}
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => {
                                                            router.patch(
                                                                route('settings.packages.update', { package: pkg.id }),
                                                                {
                                                                    label: pkg.label, description: pkg.description,
                                                                    price: pkg.price, billing_period: pkg.billing_period,
                                                                    duration_days: pkg.duration_days, trial_days: pkg.trial_days,
                                                                    max_gallery_uploads: pkg.max_gallery_uploads,
                                                                    is_active: !pkg.is_active, display_order: pkg.display_order,
                                                                },
                                                                { preserveScroll: true },
                                                            );
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                                            pkg.is_active
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                    >
                                                        <span className={`size-1.5 rounded-full ${pkg.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                                                        {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </button>
                                                </td>

                                                {/* Urutan */}
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-xs font-mono text-muted-foreground">{pkg.display_order}</span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setEditTarget(pkg)}
                                                            className="rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Edit2 className="size-3" />Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <p className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-amber-700">
                        Perubahan harga berlaku untuk transaksi baru. Paket aktif pelanggan yang sedang berjalan tidak terpengaruh.
                    </p>
                </div>

                {editTarget && (
                    <PackageModal mode="edit" pkg={editTarget} onClose={() => setEditTarget(null)} />
                )}
                {showAdd && (
                    <PackageModal mode="add" onClose={() => setShowAdd(false)} />
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
