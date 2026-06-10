import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    AppWindow,
    Bell,
    Building2,
    CheckCircle2,
    Clock,
    Globe,
    Image as ImageIcon,
    Loader2,
    Save,
    Server,
    ShieldCheck,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan Aplikasi', href: '/settings/app' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Settings {
    app_name: string;
    app_tagline: string;
    app_description: string;
    app_version: string;
    app_logo: string | null;
    app_favicon: string | null;
    company_name: string;
    company_email: string;
    company_phone: string;
    company_address: string;
    company_website: string;
    company_npwp: string;
    domain_main: string;
    subdomain_admin: string;
    subdomain_settings: string;
    subdomain_customer: string;
    domain_main_status: DomainStatus;
    subdomain_admin_status: DomainStatus;
    subdomain_settings_status: DomainStatus;
    subdomain_customer_status: DomainStatus;
    app_timezone: string;
    app_language: string;
    app_date_format: string;
    app_currency: string;
    app_number_format: string;
    app_first_day: string;
    notify_email: boolean;
    notify_push: boolean;
    notify_sms: boolean;
    notify_whatsapp: boolean;
    smtp_host: string;
    smtp_port: string;
    smtp_username: string;
    smtp_password: string;
    smtp_encryption: string;
    mail_from_name: string;
    mail_from_email: string;
}

type DomainStatus = 'active' | 'pending' | 'inactive';

// ── Primitives ────────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, description, children, footer }: {
    icon: React.ElementType; title: string; description: string;
    children: React.ReactNode; footer?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Icon className="size-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
            </div>
            <div className="px-5 divide-y divide-border/40">{children}</div>
            {footer && <div className="px-5 py-3 border-t border-border/40 bg-muted/10">{footer}</div>}
        </div>
    );
}

function FormRow({ label, hint, required, error, children }: {
    label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-5 gap-4 py-3.5">
            <div className="col-span-2">
                <p className="text-sm font-medium text-foreground">
                    {label}{required && <span className="text-destructive ml-0.5">*</span>}
                </p>
                {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
                {error && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="size-3 shrink-0" />{error}
                    </p>
                )}
            </div>
            <div className="col-span-3 flex items-start">{children}</div>
        </div>
    );
}

function Field({ value, onChange, placeholder, disabled, prefix, type = 'text', hasError }: {
    value: string; onChange: (v: string) => void; placeholder?: string;
    disabled?: boolean; prefix?: string; type?: string; hasError?: boolean;
}) {
    const cls = `w-full rounded-lg border ${hasError ? 'border-destructive' : 'border-border/60'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-destructive/30' : 'focus:ring-primary/30'} disabled:opacity-50 disabled:bg-muted/30 transition-all`;

    if (prefix) {
        return (
            <div className={`flex w-full items-center rounded-lg border ${hasError ? 'border-destructive' : 'border-border/60'} bg-background overflow-hidden focus-within:ring-2 ${hasError ? 'focus-within:ring-destructive/30' : 'focus-within:ring-primary/30'} transition-all`}>
                <span className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-r border-border/60 shrink-0 select-none">{prefix}</span>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
        );
    }
    return (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} disabled={disabled} className={cls} />
    );
}

function Textarea({ value, onChange, placeholder, rows = 3, hasError }: {
    value: string; onChange: (v: string) => void;
    placeholder?: string; rows?: number; hasError?: boolean;
}) {
    return (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} rows={rows}
            className={`w-full rounded-lg border ${hasError ? 'border-destructive' : 'border-border/60'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-destructive/30' : 'focus:ring-primary/30'} transition-all resize-none`} />
    );
}

function Select({ value, onChange, options, hasError }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; hasError?: boolean;
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-lg border ${hasError ? 'border-destructive' : 'border-border/60'} bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-destructive/30' : 'focus:ring-primary/30'} transition-all`}>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function Toggle({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
            >
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

function DomainBadge({ status }: { status: DomainStatus }) {
    const map: Record<DomainStatus, { label: string; cls: string; Icon: React.ElementType }> = {
        active:   { label: 'Aktif',    cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
        pending:  { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700',     Icon: Clock        },
        inactive: { label: 'Nonaktif', cls: 'bg-muted text-muted-foreground',  Icon: XCircle      },
    };
    const { label, cls, Icon } = map[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${cls}`}>
            <Icon className="size-3" />{label}
        </span>
    );
}

// ── Asset Upload Box ──────────────────────────────────────────────────────────

// Batas ukuran client-side (harus sinkron dengan UploadAppAssetRequest)
const ASSET_MAX_KB: Record<'logo' | 'favicon', number> = { logo: 5120, favicon: 2048 };

function formatSize(kb: number): string {
    return kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;
}

function AssetUpload({ type, label, hint, accept, currentUrl, onUploaded, onDeleted }: {
    type: 'logo' | 'favicon'; label: string; hint: string; accept: string;
    currentUrl: string | null; onUploaded: (url: string, path: string) => void; onDeleted: () => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const maxKb = ASSET_MAX_KB[type];

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi ukuran di sisi client
        if (file.size > maxKb * 1024) {
            setError(`Ukuran file melebihi batas. Maksimal ${formatSize(maxKb)}.`);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        setUploading(true);
        setError(null);

        const form = new FormData();
        form.append('file', file);

        try {
            const res = await axios.post(`/settings/app/assets/${type}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploaded(res.data.url, res.data.path);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { errors?: { file?: string[] } } } })
                ?.response?.data?.errors?.file?.[0] ?? 'Upload gagal. Coba lagi.';
            setError(msg);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function handleDelete() {
        try {
            await axios.delete(`/settings/app/assets/${type}`);
            onDeleted();
        } catch {
            // fail silently
        }
    }

    if (currentUrl) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 w-full">
                <img src={currentUrl} alt={label} className="h-10 max-w-[120px] rounded object-contain bg-white border border-border/40" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{label} terpasang</p>
                    <p className="text-[11px] text-muted-foreground">Klik ganti untuk update · Maks. {formatSize(maxKb)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                    <button type="button" onClick={() => inputRef.current?.click()}
                        className="rounded-lg border border-border/60 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors">
                        Ganti
                    </button>
                    <button type="button" onClick={handleDelete}
                        className="rounded-lg border border-red-200 px-2 py-1 text-destructive hover:bg-red-50 transition-colors">
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer group ${uploading ? 'opacity-60 cursor-wait' : 'hover:border-primary/50 hover:bg-primary/5 border-border/50'}`}
            >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                    {uploading
                        ? <Loader2 className="size-4 text-primary animate-spin" />
                        : <ImageIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
                <p className="text-sm font-medium text-foreground mb-0.5">{uploading ? 'Mengupload...' : label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{accept} · Maks. {formatSize(maxKb)}</p>
                {!uploading && <p className="mt-2 text-xs font-medium text-primary">Pilih File</p>}
            </div>
            {error && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3 shrink-0" />{error}
                </p>
            )}
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
        </div>
    );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function SaveToast({ status }: { status?: string }) {
    if (status !== 'settings-saved') return null;
    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium text-emerald-800">Pengaturan berhasil disimpan.</p>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsApp() {
    const { settings, status } = usePage<{ settings: Settings; status?: string }>().props;

    const { data, setData, patch, processing, errors, reset } = useForm({
        app_name:           settings.app_name           ?? '',
        app_tagline:        settings.app_tagline        ?? '',
        app_description:    settings.app_description    ?? '',
        app_version:        settings.app_version        ?? '',
        app_logo:           settings.app_logo           ?? null,
        app_favicon:        settings.app_favicon        ?? null,
        company_name:       settings.company_name       ?? '',
        company_email:      settings.company_email      ?? '',
        company_phone:      settings.company_phone      ?? '',
        company_address:    settings.company_address    ?? '',
        company_website:    settings.company_website    ?? '',
        company_npwp:       settings.company_npwp       ?? '',
        domain_main:        settings.domain_main        ?? '',
        subdomain_admin:    settings.subdomain_admin    ?? '',
        subdomain_settings: settings.subdomain_settings ?? '',
        subdomain_customer: settings.subdomain_customer ?? '',
        domain_main_status:        settings.domain_main_status        ?? 'active',
        subdomain_admin_status:    settings.subdomain_admin_status    ?? 'active',
        subdomain_settings_status: settings.subdomain_settings_status ?? 'pending',
        subdomain_customer_status: settings.subdomain_customer_status ?? 'pending',
        app_timezone:       settings.app_timezone       ?? 'Asia/Jakarta',
        app_language:       settings.app_language       ?? 'id',
        app_date_format:    settings.app_date_format    ?? 'd_M_Y',
        app_currency:       settings.app_currency       ?? 'IDR',
        app_number_format:  settings.app_number_format  ?? 'dot_comma',
        app_first_day:      settings.app_first_day      ?? 'monday',
        notify_email:       settings.notify_email       ?? true,
        notify_push:        settings.notify_push        ?? false,
        notify_sms:         settings.notify_sms         ?? false,
        notify_whatsapp:    settings.notify_whatsapp    ?? true,
        smtp_host:          settings.smtp_host          ?? '',
        smtp_port:          String(settings.smtp_port   ?? '587'),
        smtp_username:      settings.smtp_username      ?? '',
        smtp_password:      settings.smtp_password      ?? '',
        smtp_encryption:    settings.smtp_encryption    ?? 'tls',
        mail_from_name:     settings.mail_from_name     ?? '',
        mail_from_email:    settings.mail_from_email    ?? '',
    });

    const [logoUrl, setLogoUrl]       = useState<string | null>(
        settings.app_logo ? `/storage/${settings.app_logo}` : null
    );
    const [faviconUrl, setFaviconUrl] = useState<string | null>(
        settings.app_favicon ? `/storage/${settings.app_favicon}` : null
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('settings.app.update'));
    }

    function handleReset() {
        reset();
        router.reload({ only: ['settings'] });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Aplikasi" />
            <SettingsLayout>
                <form onSubmit={submit} className="space-y-6">
                    <HeadingSmall title="Pengaturan Aplikasi" description="Konfigurasi identitas, domain, dan preferensi platform." />

                    {/* 1 ── Informasi Aplikasi */}
                    <SectionCard icon={AppWindow} title="Informasi Aplikasi" description="Identitas utama platform.">
                        <FormRow label="Nama Aplikasi" required hint="Tampil di browser tab & email." error={errors.app_name}>
                            <Field value={data.app_name} onChange={(v) => setData('app_name', v)}
                                placeholder="Undesia" hasError={!!errors.app_name} />
                        </FormRow>
                        <FormRow label="Tagline" hint="Slogan singkat platform." error={errors.app_tagline}>
                            <Field value={data.app_tagline} onChange={(v) => setData('app_tagline', v)}
                                placeholder="Undangan Digital Modern" />
                        </FormRow>
                        <FormRow label="Deskripsi" hint="Meta description untuk SEO (maks. 500 karakter)." error={errors.app_description}>
                            <Textarea value={data.app_description} onChange={(v) => setData('app_description', v)}
                                placeholder="Platform undangan digital modern..." rows={2}
                                hasError={!!errors.app_description} />
                        </FormRow>
                        <FormRow label="Logo" hint="PNG transparan, min. 200×60px. Maks. 2 MB.">
                            <AssetUpload
                                type="logo" label="Upload Logo" hint="Drag & drop atau klik"
                                accept=".png,.jpg,.svg,.webp" currentUrl={logoUrl}
                                onUploaded={(url, path) => { setLogoUrl(url); setData('app_logo', path); }}
                                onDeleted={() => { setLogoUrl(null); setData('app_logo', null); }}
                            />
                        </FormRow>
                        <FormRow label="Favicon" hint="ICO atau PNG 32×32px. Maks. 512 KB.">
                            <AssetUpload
                                type="favicon" label="Upload Favicon" hint="Drag & drop atau klik"
                                accept=".ico,.png,.jpg,.webp" currentUrl={faviconUrl}
                                onUploaded={(url, path) => { setFaviconUrl(url); setData('app_favicon', path); }}
                                onDeleted={() => { setFaviconUrl(null); setData('app_favicon', null); }}
                            />
                        </FormRow>
                        <FormRow label="Versi Sistem">
                            <Field value={String(data.app_version)} onChange={() => {}} disabled />
                        </FormRow>
                    </SectionCard>

                    {/* 2 ── Informasi Perusahaan */}
                    <SectionCard icon={Building2} title="Informasi Perusahaan" description="Data legal untuk invoice dan komunikasi resmi.">
                        <FormRow label="Nama Perusahaan" required error={errors.company_name}>
                            <Field value={data.company_name} onChange={(v) => setData('company_name', v)}
                                placeholder="PT. Undesia Digital Indonesia" hasError={!!errors.company_name} />
                        </FormRow>
                        <FormRow label="Email Resmi" required error={errors.company_email}>
                            <Field value={data.company_email} onChange={(v) => setData('company_email', v)}
                                type="email" placeholder="halo@undesia.com" hasError={!!errors.company_email} />
                        </FormRow>
                        <FormRow label="No. Telepon" hint="WhatsApp aktif untuk support." error={errors.company_phone}>
                            <Field value={data.company_phone} onChange={(v) => setData('company_phone', v)}
                                placeholder="+62 812-0000-0000" />
                        </FormRow>
                        <FormRow label="Alamat" error={errors.company_address}>
                            <Textarea value={data.company_address} onChange={(v) => setData('company_address', v)}
                                placeholder="Jl. Contoh No. 1, Jakarta Selatan..." rows={2} />
                        </FormRow>
                        <FormRow label="Website" hint="Sertakan https://" error={errors.company_website}>
                            <Field value={data.company_website} onChange={(v) => setData('company_website', v)}
                                placeholder="https://undesia.com" hasError={!!errors.company_website} />
                        </FormRow>
                        <FormRow label="NPWP" error={errors.company_npwp}>
                            <Field value={data.company_npwp} onChange={(v) => setData('company_npwp', v)}
                                placeholder="00.000.000.0-000.000" />
                        </FormRow>
                    </SectionCard>

                    {/* 3 ── Domain & Subdomain */}
                    <SectionCard
                        icon={Globe}
                        title="Domain & Subdomain"
                        description="Konfigurasi domain utama dan subdomain per modul."
                        footer={
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                                <p className="text-xs font-medium text-emerald-700">
                                    SSL/TLS Aktif — Let's Encrypt • Auto-renew aktif
                                </p>
                            </div>
                        }
                    >
                        <FormRow label="Domain Utama" required error={errors.domain_main}>
                            <div className="flex items-center gap-2 w-full">
                                <Field value={data.domain_main} onChange={(v) => setData('domain_main', v)}
                                    placeholder="undesia.com" hasError={!!errors.domain_main} />
                                <DomainBadge status={data.domain_main_status as DomainStatus} />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Admin">
                            <div className="flex items-center gap-2 w-full">
                                <Field value={data.subdomain_admin} onChange={(v) => setData('subdomain_admin', v)}
                                    prefix="admin." placeholder="undesia.com" />
                                <DomainBadge status={data.subdomain_admin_status as DomainStatus} />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Settings">
                            <div className="flex items-center gap-2 w-full">
                                <Field value={data.subdomain_settings} onChange={(v) => setData('subdomain_settings', v)}
                                    prefix="settings." placeholder="undesia.com" />
                                <DomainBadge status={data.subdomain_settings_status as DomainStatus} />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Customer">
                            <div className="flex items-center gap-2 w-full">
                                <Field value={data.subdomain_customer} onChange={(v) => setData('subdomain_customer', v)}
                                    prefix="app." placeholder="undesia.com" />
                                <DomainBadge status={data.subdomain_customer_status as DomainStatus} />
                            </div>
                        </FormRow>
                    </SectionCard>

                    {/* 4 ── Pengaturan Umum */}
                    <SectionCard icon={Server} title="Pengaturan Umum" description="Konfigurasi regional dan format tampilan.">
                        <FormRow label="Zona Waktu" required error={errors.app_timezone}>
                            <Select value={data.app_timezone} onChange={(v) => setData('app_timezone', v)}
                                hasError={!!errors.app_timezone}
                                options={[
                                    { value: 'Asia/Jakarta',  label: 'WIB — UTC+7  (Jakarta, Bandung, Surabaya)' },
                                    { value: 'Asia/Makassar', label: 'WITA — UTC+8 (Makassar, Bali, Lombok)'    },
                                    { value: 'Asia/Jayapura', label: 'WIT — UTC+9  (Jayapura, Ambon)'           },
                                    { value: 'UTC',           label: 'UTC — Coordinated Universal Time'          },
                                ]} />
                        </FormRow>
                        <FormRow label="Bahasa Default" error={errors.app_language}>
                            <Select value={data.app_language} onChange={(v) => setData('app_language', v)}
                                options={[
                                    { value: 'id', label: 'Bahasa Indonesia' },
                                    { value: 'en', label: 'English'          },
                                ]} />
                        </FormRow>
                        <FormRow label="Format Tanggal" error={errors.app_date_format}>
                            <Select value={data.app_date_format} onChange={(v) => setData('app_date_format', v)}
                                options={[
                                    { value: 'd_M_Y', label: 'DD MMM YYYY — 10 Jun 2026'   },
                                    { value: 'd_F_Y', label: 'DD MMMM YYYY — 10 Juni 2026' },
                                    { value: 'd_m_Y', label: 'DD/MM/YYYY — 10/06/2026'     },
                                    { value: 'Y-m-d', label: 'YYYY-MM-DD — 2026-06-10'     },
                                ]} />
                        </FormRow>
                        <FormRow label="Format Mata Uang" error={errors.app_currency}>
                            <Select value={data.app_currency} onChange={(v) => setData('app_currency', v)}
                                options={[
                                    { value: 'IDR', label: 'IDR — Rp 99.000' },
                                    { value: 'USD', label: 'USD — $99.00'    },
                                    { value: 'EUR', label: 'EUR — €99.00'    },
                                ]} />
                        </FormRow>
                        <FormRow label="Format Angka" error={errors.app_number_format}>
                            <Select value={data.app_number_format} onChange={(v) => setData('app_number_format', v)}
                                options={[
                                    { value: 'dot_comma',   label: '1.000,00 — titik ribuan, koma desimal' },
                                    { value: 'comma_dot',   label: '1,000.00 — koma ribuan, titik desimal' },
                                ]} />
                        </FormRow>
                        <FormRow label="Hari Pertama Minggu" error={errors.app_first_day}>
                            <Select value={data.app_first_day} onChange={(v) => setData('app_first_day', v)}
                                options={[
                                    { value: 'monday', label: 'Senin' },
                                    { value: 'sunday', label: 'Minggu' },
                                ]} />
                        </FormRow>
                    </SectionCard>

                    {/* 5 ── Notifikasi Global */}
                    <SectionCard icon={Bell} title="Notifikasi Global" description="Aktifkan saluran notifikasi di seluruh platform.">
                        <Toggle label="Email Notification"
                            description="Notifikasi transaksi dan aktivitas akun via email."
                            checked={!!data.notify_email}
                            onChange={(v) => setData('notify_email', v)} />
                        <Toggle label="Push Notification"
                            description="Notifikasi push ke browser (perlu service worker)."
                            checked={!!data.notify_push}
                            onChange={(v) => setData('notify_push', v)} />
                        <Toggle label="SMS Notification"
                            description="OTP dan notifikasi penting via SMS gateway."
                            checked={!!data.notify_sms}
                            onChange={(v) => setData('notify_sms', v)} />
                        <Toggle label="WhatsApp Notification"
                            description="Undangan dan notifikasi via WhatsApp Gateway."
                            checked={!!data.notify_whatsapp}
                            onChange={(v) => setData('notify_whatsapp', v)} />

                        {/* SMTP config — shown when email notif is on */}
                        {data.notify_email && (
                            <div className="py-3 space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Konfigurasi SMTP</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">SMTP Host</label>
                                        <Field value={String(data.smtp_host)} onChange={(v) => setData('smtp_host', v)}
                                            placeholder="smtp.gmail.com" hasError={!!errors.smtp_host} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Port</label>
                                        <Field value={String(data.smtp_port)} onChange={(v) => setData('smtp_port', v)}
                                            placeholder="587" hasError={!!errors.smtp_port} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Username</label>
                                        <Field value={String(data.smtp_username)} onChange={(v) => setData('smtp_username', v)}
                                            placeholder="user@gmail.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Password / App Password</label>
                                        <Field value={String(data.smtp_password)} onChange={(v) => setData('smtp_password', v)}
                                            type="password" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Enkripsi</label>
                                        <Select value={String(data.smtp_encryption)} onChange={(v) => setData('smtp_encryption', v)}
                                            options={[
                                                { value: 'tls',  label: 'TLS (587)'  },
                                                { value: 'ssl',  label: 'SSL (465)'  },
                                                { value: 'none', label: 'None (25)'  },
                                            ]} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Nama Pengirim</label>
                                        <Field value={String(data.mail_from_name)} onChange={(v) => setData('mail_from_name', v)}
                                            placeholder="Undesia" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-foreground mb-1">Email Pengirim</label>
                                        <Field value={String(data.mail_from_email)} onChange={(v) => setData('mail_from_email', v)}
                                            type="email" placeholder="noreply@undesia.com"
                                            hasError={!!errors.mail_from_email} />
                                        {errors.mail_from_email && (
                                            <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="size-3" />{errors.mail_from_email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Save Bar */}
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/40 mt-2">
                        <p className="text-xs text-muted-foreground">
                            {processing && (
                                <span className="flex items-center gap-1.5 text-primary">
                                    <Loader2 className="size-3.5 animate-spin" />Menyimpan...
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={handleReset} disabled={processing}
                                className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                                Reset
                            </button>
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                                {processing
                                    ? <><Loader2 className="size-3.5 animate-spin" />Menyimpan...</>
                                    : <><Save className="size-3.5" />Simpan Perubahan</>}
                            </button>
                        </div>
                    </div>
                </form>
            </SettingsLayout>

            <SaveToast status={status} />
        </AppLayout>
    );
}
