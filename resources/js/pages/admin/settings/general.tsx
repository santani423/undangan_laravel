import { SettingsTabNav, type SettingsTab } from '@/components/settings/settings-tab-nav';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CheckCircle2,
    Clock,
    Globe,
    Image as ImageIcon,
    Info,
    Save,
    Server,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'Aplikasi', href: '/admin/settings/general' },
];

const tabs: SettingsTab[] = [
    { id: 'app-info',    label: 'Informasi Aplikasi',  icon: Info      },
    { id: 'company',     label: 'Informasi Perusahaan', icon: Building2 },
    { id: 'domain',      label: 'Domain & Subdomain',  icon: Globe     },
    { id: 'general',     label: 'Pengaturan Umum',     icon: Server    },
    { id: 'notif',       label: 'Notifikasi',          icon: Bell      },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, description, children, footer }: {
    icon: React.ElementType; title: string; description: string;
    children: React.ReactNode; footer?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Icon className="size-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
            </div>
            <div className="px-6 divide-y divide-border/40">{children}</div>
            {footer && <div className="px-6 py-3 border-t border-border/40 bg-muted/10">{footer}</div>}
        </div>
    );
}

function FormRow({ label, hint, required, children }: {
    label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-12 gap-6 py-4">
            <div className="col-span-4">
                <p className="text-sm font-medium text-foreground">
                    {label}{required && <span className="text-destructive ml-0.5">*</span>}
                </p>
                {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
            </div>
            <div className="col-span-8 flex items-start">{children}</div>
        </div>
    );
}

function Input({ defaultValue, placeholder, disabled, prefix }: {
    defaultValue?: string; placeholder?: string; disabled?: boolean; prefix?: string;
}) {
    if (prefix) {
        return (
            <div className="flex w-full items-center rounded-lg border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60 transition-all">
                <span className="px-3 py-2 text-sm text-muted-foreground bg-muted/50 border-r border-border/60 shrink-0 select-none">{prefix}</span>
                <input type="text" defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground" />
            </div>
        );
    }
    return (
        <input type="text" defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 disabled:opacity-50 disabled:bg-muted/30 transition-all" />
    );
}

function Textarea({ defaultValue, placeholder, rows = 3 }: { defaultValue?: string; placeholder?: string; rows?: number }) {
    return (
        <textarea defaultValue={defaultValue} placeholder={placeholder} rows={rows}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all resize-none" />
    );
}

function Select({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) {
    return (
        <select defaultValue={defaultValue}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all">
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function UploadBox({ label, hint, accept }: { label: string; hint: string; accept: string }) {
    return (
        <div className="w-full border-2 border-dashed border-border/50 rounded-xl p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                <ImageIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{accept}</p>
            <button className="mt-2.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Pilih File</button>
        </div>
    );
}

type DomainStatus = 'active' | 'pending' | 'inactive' | 'error';
function DomainBadge({ status }: { status: DomainStatus }) {
    const map: Record<DomainStatus, { label: string; cls: string; Icon: React.ElementType }> = {
        active:   { label: 'Aktif',    cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
        pending:  { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700',     Icon: Clock        },
        inactive: { label: 'Nonaktif', cls: 'bg-muted text-muted-foreground',  Icon: XCircle      },
        error:    { label: 'Error',    cls: 'bg-red-100 text-red-700',         Icon: XCircle      },
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
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none ${on ? 'bg-primary' : 'bg-border'}`}>
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

function SaveBar({ note }: { note?: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-6 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{note ?? 'Perubahan berlaku setelah disimpan.'}</p>
            <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">Reset</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                    <Save className="size-3.5" />Simpan Perubahan
                </button>
            </div>
        </div>
    );
}

// ── Tab Panels ────────────────────────────────────────────────────────────────

function TabAppInfo() {
    return (
        <div className="space-y-6">
            <SectionCard icon={Info} title="Informasi Aplikasi" description="Identitas utama platform yang tampil di browser, email, dan meta SEO.">
                <FormRow label="Nama Aplikasi" required hint="Tampil di browser tab dan header email.">
                    <Input defaultValue="Undesia" />
                </FormRow>
                <FormRow label="Tagline" hint="Kalimat singkat di bawah nama aplikasi.">
                    <Input defaultValue="Undangan Digital Modern" />
                </FormRow>
                <FormRow label="Deskripsi Aplikasi" hint="Deskripsi untuk meta description & SEO.">
                    <Textarea defaultValue="Platform undangan digital modern untuk berbagai jenis acara: pernikahan, ulang tahun, khitanan, aqiqah, gender reveal, dan syukuran." rows={3} />
                </FormRow>
                <FormRow label="Logo Aplikasi" hint="PNG transparan, min. 200×60px.">
                    <UploadBox label="Upload Logo" hint="Drag & drop atau klik untuk upload" accept="Format: PNG, SVG, WebP" />
                </FormRow>
                <FormRow label="Favicon" hint="ICO atau PNG 32×32px untuk browser tab.">
                    <UploadBox label="Upload Favicon" hint="Drag & drop atau klik untuk upload" accept="Format: ICO, PNG (32×32)" />
                </FormRow>
                <FormRow label="Versi Sistem" hint="Versi aplikasi saat ini (read-only).">
                    <Input defaultValue="2.0.0" disabled />
                </FormRow>
            </SectionCard>
            <SaveBar />
        </div>
    );
}

function TabCompany() {
    return (
        <div className="space-y-6">
            <SectionCard icon={Building2} title="Informasi Perusahaan" description="Data legal perusahaan yang digunakan pada invoice dan komunikasi resmi.">
                <FormRow label="Nama Perusahaan" required>
                    <Input defaultValue="PT. Undesia Digital Indonesia" />
                </FormRow>
                <FormRow label="Email Perusahaan" required hint="Digunakan sebagai From address pada notifikasi email.">
                    <Input defaultValue="halo@undesia.com" />
                </FormRow>
                <FormRow label="Nomor Telepon" hint="Nomor WhatsApp aktif untuk layanan pelanggan.">
                    <Input defaultValue="+62 812-0000-0000" placeholder="+62 812-xxxx-xxxx" />
                </FormRow>
                <FormRow label="Alamat" hint="Alamat lengkap untuk keperluan legal dan invoice.">
                    <Textarea placeholder="Jl. Contoh No. 1, Jakarta Selatan, DKI Jakarta 12345" rows={2} />
                </FormRow>
                <FormRow label="Website" hint="URL website resmi perusahaan.">
                    <Input defaultValue="https://undesia.com" />
                </FormRow>
                <FormRow label="NPWP" hint="Nomor NPWP perusahaan untuk keperluan pajak.">
                    <Input placeholder="00.000.000.0-000.000" />
                </FormRow>
            </SectionCard>

            {/* Sosial Media */}
            <SectionCard icon={Globe} title="Akun Media Sosial" description="Link akun media sosial yang tampil di footer platform.">
                <FormRow label="Instagram" hint="URL profil Instagram resmi.">
                    <Input prefix="instagram.com/" defaultValue="undesia.id" />
                </FormRow>
                <FormRow label="TikTok" hint="URL profil TikTok resmi.">
                    <Input prefix="tiktok.com/@" defaultValue="undesia.id" />
                </FormRow>
                <FormRow label="YouTube" hint="URL channel YouTube resmi.">
                    <Input placeholder="https://youtube.com/@undesia" />
                </FormRow>
                <FormRow label="Facebook" hint="URL halaman Facebook resmi.">
                    <Input placeholder="https://facebook.com/undesia" />
                </FormRow>
            </SectionCard>
            <SaveBar />
        </div>
    );
}

function TabDomain() {
    return (
        <div className="space-y-6">
            <SectionCard icon={Globe} title="Konfigurasi Domain & Subdomain"
                description="Pemetaan domain utama dan subdomain per modul sistem."
                footer={
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-medium text-emerald-700">SSL/TLS Aktif — Let's Encrypt</p>
                            <p className="text-[11px] text-emerald-600 mt-0.5">Sertifikat berlaku hingga 10 Sep 2026 • Auto-renew aktif</p>
                        </div>
                        <button className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors shrink-0">Perbarui Sekarang</button>
                    </div>
                }
            >
                <FormRow label="Domain Utama" required hint="Domain produksi platform.">
                    <div className="flex items-center gap-2 w-full">
                        <Input defaultValue="undesia.com" />
                        <DomainBadge status="active" />
                    </div>
                </FormRow>
                <FormRow label="Subdomain Admin" hint="Panel administrasi (admin.undesia.com).">
                    <div className="flex items-center gap-2 w-full">
                        <Input prefix="admin." defaultValue="undesia.com" />
                        <DomainBadge status="active" />
                    </div>
                </FormRow>
                <FormRow label="Subdomain Settings" hint="Modul pengaturan (settings.undesia.com).">
                    <div className="flex items-center gap-2 w-full">
                        <Input prefix="settings." defaultValue="undesia.com" />
                        <DomainBadge status="pending" />
                    </div>
                </FormRow>
                <FormRow label="Subdomain Customer" hint="Area pelanggan (app.undesia.com).">
                    <div className="flex items-center gap-2 w-full">
                        <Input prefix="app." defaultValue="undesia.com" />
                        <DomainBadge status="pending" />
                    </div>
                </FormRow>
                <FormRow label="Subdomain Mitra" hint="Portal mitra / reseller (mitra.undesia.com).">
                    <div className="flex items-center gap-2 w-full">
                        <Input prefix="mitra." defaultValue="undesia.com" />
                        <DomainBadge status="inactive" />
                    </div>
                </FormRow>
            </SectionCard>

            {/* DNS Records */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
                    <h2 className="text-sm font-semibold text-foreground">DNS Records Aktif</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Rekam DNS yang perlu dikonfigurasi pada domain registrar.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Host</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Value</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">TTL</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {[
                                { type: 'A',     host: '@',        value: '103.xxx.xxx.xxx', ttl: '300',  status: 'active'   as DomainStatus },
                                { type: 'CNAME', host: 'admin',    value: 'undesia.com',     ttl: '300',  status: 'active'   as DomainStatus },
                                { type: 'CNAME', host: 'settings', value: 'undesia.com',     ttl: '300',  status: 'pending'  as DomainStatus },
                                { type: 'CNAME', host: 'app',      value: 'undesia.com',     ttl: '300',  status: 'pending'  as DomainStatus },
                                { type: 'TXT',   host: '_dmarc',   value: 'v=DMARC1; p=none', ttl: '3600', status: 'active'  as DomainStatus },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">{row.type}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs font-mono text-foreground">{row.host}</td>
                                    <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground truncate max-w-[200px]">{row.value}</td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.ttl}s</td>
                                    <td className="px-4 py-2.5"><DomainBadge status={row.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <SaveBar note="Perubahan domain membutuhkan waktu propagasi DNS (5–60 menit)." />
        </div>
    );
}

function TabGeneral() {
    return (
        <div className="space-y-6">
            <SectionCard icon={Server} title="Pengaturan Umum" description="Konfigurasi regional dan format tampilan data di seluruh platform.">
                <FormRow label="Zona Waktu" required hint="Semua timestamp UTC, ditampilkan dalam zona ini.">
                    <Select defaultValue="Asia/Jakarta" options={[
                        { value: 'Asia/Jakarta',  label: 'WIB — Asia/Jakarta (UTC+7)'  },
                        { value: 'Asia/Makassar', label: 'WITA — Asia/Makassar (UTC+8)' },
                        { value: 'Asia/Jayapura', label: 'WIT — Asia/Jayapura (UTC+9)'  },
                    ]} />
                </FormRow>
                <FormRow label="Bahasa Default" hint="Bahasa antarmuka untuk pengguna baru.">
                    <Select defaultValue="id" options={[
                        { value: 'id', label: 'Bahasa Indonesia' },
                        { value: 'en', label: 'English'          },
                    ]} />
                </FormRow>
                <FormRow label="Format Tanggal" hint="Format yang digunakan di seluruh tampilan tanggal.">
                    <Select defaultValue="d_M_Y" options={[
                        { value: 'd_M_Y', label: 'DD MMM YYYY — 10 Jun 2026'   },
                        { value: 'd_F_Y', label: 'DD MMMM YYYY — 10 Juni 2026' },
                        { value: 'd_m_Y', label: 'DD/MM/YYYY — 10/06/2026'     },
                        { value: 'Y_m_d', label: 'YYYY-MM-DD — 2026-06-10'     },
                    ]} />
                </FormRow>
                <FormRow label="Format Mata Uang" hint="Format harga yang tampil kepada pelanggan.">
                    <Select defaultValue="IDR" options={[
                        { value: 'IDR', label: 'IDR — Rupiah (Rp 99.000)' },
                        { value: 'USD', label: 'USD — US Dollar ($99.00)' },
                    ]} />
                </FormRow>
                <FormRow label="Format Angka" hint="Pemisah ribuan dan desimal.">
                    <Select defaultValue="id_ID" options={[
                        { value: 'id_ID', label: 'Indonesia — 1.000,00' },
                        { value: 'en_US', label: 'US — 1,000.00'        },
                    ]} />
                </FormRow>
                <FormRow label="Hari Pertama Minggu" hint="Digunakan pada tampilan kalender.">
                    <Select defaultValue="1" options={[
                        { value: '1', label: 'Senin' },
                        { value: '0', label: 'Minggu' },
                    ]} />
                </FormRow>
            </SectionCard>

            <SectionCard icon={Server} title="Mode Maintenance" description="Aktifkan mode maintenance untuk menutup akses sementara dari publik.">
                <FormRow label="Mode Maintenance" hint="Saat aktif, hanya admin yang dapat mengakses platform.">
                    <Toggle label="Aktifkan Mode Maintenance" description="Halaman maintenance ditampilkan ke pengunjung." defaultOn={false} />
                </FormRow>
                <FormRow label="Pesan Maintenance" hint="Pesan yang tampil saat platform dalam maintenance.">
                    <Textarea defaultValue="Sistem sedang dalam pemeliharaan. Mohon tunggu beberapa saat." rows={2} />
                </FormRow>
                <FormRow label="Estimasi Selesai" hint="Tampil di halaman maintenance (opsional).">
                    <Input placeholder="Senin, 15 Juni 2026 pukul 10.00 WIB" />
                </FormRow>
            </SectionCard>
            <SaveBar />
        </div>
    );
}

function TabNotif() {
    return (
        <div className="space-y-6">
            <SectionCard icon={Bell} title="Saluran Notifikasi" description="Aktifkan atau nonaktifkan saluran notifikasi di seluruh platform.">
                <Toggle label="Email Notification" description="Kirim notifikasi email untuk transaksi, RSVP, dan aktivitas akun." defaultOn={true} />
                <Toggle label="Push Notification" description="Notifikasi push ke browser pelanggan (memerlukan service worker)." defaultOn={false} />
                <Toggle label="SMS Notification" description="Kirim OTP dan notifikasi penting via SMS gateway." defaultOn={false} />
                <Toggle label="WhatsApp Notification" description="Kirim undangan dan notifikasi via WhatsApp Gateway." defaultOn={true} />
            </SectionCard>

            <SectionCard icon={Bell} title="Template Notifikasi Email" description="Atur template email untuk setiap jenis notifikasi sistem.">
                {[
                    { label: 'Selamat Datang (Registrasi)', key: 'welcome',      status: 'Aktif'   },
                    { label: 'Konfirmasi Email',            key: 'verify-email', status: 'Aktif'   },
                    { label: 'Pembayaran Berhasil',         key: 'pay-success',  status: 'Aktif'   },
                    { label: 'Pembayaran Gagal',            key: 'pay-failed',   status: 'Aktif'   },
                    { label: 'Invoice Undangan',            key: 'invoice',      status: 'Aktif'   },
                    { label: 'Notifikasi RSVP ke Pemilik',  key: 'rsvp-owner',   status: 'Draft'   },
                    { label: 'Pengingat Masa Aktif',        key: 'expiry-warn',  status: 'Draft'   },
                    { label: 'Reset Password',              key: 'reset-pwd',    status: 'Aktif'   },
                ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-medium text-foreground">{t.label}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.key}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {t.status}
                            </span>
                            <button className="rounded-lg border border-border/60 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                                Edit Template
                            </button>
                        </div>
                    </div>
                ))}
            </SectionCard>

            <SectionCard icon={Bell} title="Pengaturan Email SMTP" description="Konfigurasi server email untuk pengiriman notifikasi.">
                <FormRow label="SMTP Host" required>
                    <Input defaultValue="smtp.mailgun.org" />
                </FormRow>
                <FormRow label="SMTP Port" required>
                    <Input defaultValue="587" />
                </FormRow>
                <FormRow label="Username / Email">
                    <Input defaultValue="postmaster@undesia.com" />
                </FormRow>
                <FormRow label="Password / API Key" hint="Tersimpan terenkripsi.">
                    <Input placeholder="••••••••••••••••" />
                </FormRow>
                <FormRow label="Encryption">
                    <Select defaultValue="tls" options={[
                        { value: 'tls',  label: 'TLS' },
                        { value: 'ssl',  label: 'SSL' },
                        { value: 'none', label: 'None' },
                    ]} />
                </FormRow>
                <FormRow label="From Name">
                    <Input defaultValue="Undesia Platform" />
                </FormRow>
                <FormRow label="From Email">
                    <Input defaultValue="noreply@undesia.com" />
                </FormRow>
            </SectionCard>
            <SaveBar />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsGeneral() {
    const [activeTab, setActiveTab] = useState('app-info');

    const panels: Record<string, React.ReactNode> = {
        'app-info': <TabAppInfo />,
        'company':  <TabCompany />,
        'domain':   <TabDomain />,
        'general':  <TabGeneral />,
        'notif':    <TabNotif />,
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Aplikasi" />
            <SettingsLayout>
                {/* Sub-tab navigation */}
                <SettingsTabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                {/* Tab content */}
                <div className="max-w-4xl mx-auto p-6">
                    {panels[activeTab]}
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}
