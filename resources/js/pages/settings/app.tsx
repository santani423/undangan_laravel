import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AppWindow,
    Bell,
    Building2,
    CheckCircle2,
    Clock,
    Globe,
    Image as ImageIcon,
    Save,
    Server,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan Aplikasi', href: '/settings/app' },
];

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

function FormRow({ label, hint, required, children }: {
    label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-5 gap-4 py-3.5">
            <div className="col-span-2">
                <p className="text-sm font-medium text-foreground">
                    {label}{required && <span className="text-destructive ml-0.5">*</span>}
                </p>
                {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
            </div>
            <div className="col-span-3 flex items-start">{children}</div>
        </div>
    );
}

function Input({ defaultValue, placeholder, disabled, prefix }: {
    defaultValue?: string; placeholder?: string; disabled?: boolean; prefix?: string;
}) {
    if (prefix) {
        return (
            <div className="flex w-full items-center rounded-lg border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-r border-border/60 shrink-0 select-none">{prefix}</span>
                <input type="text" defaultValue={defaultValue} placeholder={placeholder}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
        );
    }
    return (
        <input type="text" defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:bg-muted/30 transition-all" />
    );
}

function Textarea({ defaultValue, placeholder, rows = 3 }: { defaultValue?: string; placeholder?: string; rows?: number }) {
    return (
        <textarea defaultValue={defaultValue} placeholder={placeholder} rows={rows}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
    );
}

function Select({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) {
    return (
        <select defaultValue={defaultValue}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function UploadBox({ label, hint, accept }: { label: string; hint: string; accept: string }) {
    return (
        <div className="w-full border-2 border-dashed border-border/50 rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                <ImageIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{accept}</p>
            <button className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Pilih File</button>
        </div>
    );
}

type DomainStatus = 'active' | 'pending' | 'inactive';
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

function Toggle({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <button role="switch" aria-checked={on} onClick={() => setOn(!on)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

function SaveBar() {
    return (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-2">
            <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">Reset</button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                <Save className="size-3.5" />Simpan Perubahan
            </button>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsApp() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Aplikasi" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Pengaturan Aplikasi" description="Konfigurasi identitas, domain, dan preferensi platform." />

                    {/* 1 ── Informasi Aplikasi */}
                    <SectionCard icon={AppWindow} title="Informasi Aplikasi" description="Identitas utama platform.">
                        <FormRow label="Nama Aplikasi" required hint="Tampil di browser tab & email.">
                            <Input defaultValue="Undesia" />
                        </FormRow>
                        <FormRow label="Tagline" hint="Slogan singkat platform.">
                            <Input defaultValue="Undangan Digital Modern" />
                        </FormRow>
                        <FormRow label="Deskripsi" hint="Meta description untuk SEO.">
                            <Textarea defaultValue="Platform undangan digital modern untuk berbagai jenis acara." rows={2} />
                        </FormRow>
                        <FormRow label="Logo" hint="PNG transparan, min. 200×60px.">
                            <UploadBox label="Upload Logo" hint="Drag & drop atau klik" accept="PNG, SVG, WebP" />
                        </FormRow>
                        <FormRow label="Favicon" hint="ICO atau PNG 32×32px.">
                            <UploadBox label="Upload Favicon" hint="Drag & drop atau klik" accept="ICO, PNG 32×32" />
                        </FormRow>
                        <FormRow label="Versi Sistem">
                            <Input defaultValue="2.0.0" disabled />
                        </FormRow>
                    </SectionCard>

                    {/* 2 ── Informasi Perusahaan */}
                    <SectionCard icon={Building2} title="Informasi Perusahaan" description="Data legal untuk invoice dan komunikasi resmi.">
                        <FormRow label="Nama Perusahaan" required>
                            <Input defaultValue="PT. Undesia Digital Indonesia" />
                        </FormRow>
                        <FormRow label="Email" required>
                            <Input defaultValue="halo@undesia.com" />
                        </FormRow>
                        <FormRow label="No. Telepon" hint="WhatsApp aktif untuk support.">
                            <Input defaultValue="+62 812-0000-0000" />
                        </FormRow>
                        <FormRow label="Alamat">
                            <Textarea placeholder="Jl. Contoh No. 1, Jakarta Selatan..." rows={2} />
                        </FormRow>
                        <FormRow label="Website">
                            <Input defaultValue="https://undesia.com" />
                        </FormRow>
                    </SectionCard>

                    {/* 3 ── Domain */}
                    <SectionCard
                        icon={Globe}
                        title="Domain & Subdomain"
                        description="Konfigurasi domain utama dan subdomain per modul."
                        footer={
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                                <p className="text-xs font-medium text-emerald-700">SSL/TLS Aktif — Let's Encrypt • Auto-renew aktif hingga 10 Sep 2026</p>
                            </div>
                        }
                    >
                        <FormRow label="Domain Utama" required>
                            <div className="flex items-center gap-2 w-full">
                                <Input defaultValue="undesia.com" />
                                <DomainBadge status="active" />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Admin">
                            <div className="flex items-center gap-2 w-full">
                                <Input prefix="admin." defaultValue="undesia.com" />
                                <DomainBadge status="active" />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Settings">
                            <div className="flex items-center gap-2 w-full">
                                <Input prefix="settings." defaultValue="undesia.com" />
                                <DomainBadge status="pending" />
                            </div>
                        </FormRow>
                        <FormRow label="Subdomain Customer">
                            <div className="flex items-center gap-2 w-full">
                                <Input prefix="app." defaultValue="undesia.com" />
                                <DomainBadge status="pending" />
                            </div>
                        </FormRow>
                    </SectionCard>

                    {/* 4 ── Pengaturan Umum */}
                    <SectionCard icon={Server} title="Pengaturan Umum" description="Konfigurasi regional dan format tampilan.">
                        <FormRow label="Zona Waktu" required>
                            <Select defaultValue="Asia/Jakarta" options={[
                                { value: 'Asia/Jakarta',  label: 'WIB — UTC+7'  },
                                { value: 'Asia/Makassar', label: 'WITA — UTC+8' },
                                { value: 'Asia/Jayapura', label: 'WIT — UTC+9'  },
                            ]} />
                        </FormRow>
                        <FormRow label="Bahasa Default">
                            <Select defaultValue="id" options={[
                                { value: 'id', label: 'Bahasa Indonesia' },
                                { value: 'en', label: 'English'          },
                            ]} />
                        </FormRow>
                        <FormRow label="Format Tanggal">
                            <Select defaultValue="d_M_Y" options={[
                                { value: 'd_M_Y', label: 'DD MMM YYYY — 10 Jun 2026'   },
                                { value: 'd_F_Y', label: 'DD MMMM YYYY — 10 Juni 2026' },
                                { value: 'd_m_Y', label: 'DD/MM/YYYY — 10/06/2026'     },
                            ]} />
                        </FormRow>
                        <FormRow label="Format Mata Uang">
                            <Select defaultValue="IDR" options={[
                                { value: 'IDR', label: 'IDR — Rp 99.000' },
                                { value: 'USD', label: 'USD — $99.00'    },
                            ]} />
                        </FormRow>
                    </SectionCard>

                    {/* 5 ── Notifikasi */}
                    <SectionCard icon={Bell} title="Notifikasi Global" description="Aktifkan saluran notifikasi di seluruh platform.">
                        <Toggle label="Email Notification"     description="Notifikasi transaksi dan aktivitas akun via email."           defaultOn={true}  />
                        <Toggle label="Push Notification"      description="Notifikasi push ke browser (perlu service worker)."            defaultOn={false} />
                        <Toggle label="SMS Notification"       description="OTP dan notifikasi penting via SMS gateway."                   defaultOn={false} />
                        <Toggle label="WhatsApp Notification"  description="Undangan dan notifikasi via WhatsApp Gateway."                 defaultOn={true}  />
                    </SectionCard>

                    <SaveBar />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
