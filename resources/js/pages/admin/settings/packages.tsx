import { SettingsTabNav, type SettingsTab } from '@/components/settings/settings-tab-nav';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Check,
    ChevronRight,
    Crown,
    Edit,
    Eye,
    LayoutList,
    Package,
    Percent,
    Plus,
    Save,
    Sliders,
    Sparkles,
    Star,
    Tag,
    ToggleLeft,
    ToggleRight,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'Paket & Harga', href: '/admin/settings/packages' },
];

const tabs: SettingsTab[] = [
    { id: 'packages',  label: 'Daftar Paket',    icon: Package    },
    { id: 'features',  label: 'Fitur Paket',      icon: LayoutList },
    { id: 'limits',    label: 'Batas Penggunaan', icon: Sliders    },
    { id: 'promo',     label: 'Harga & Promo',    icon: Percent    },
];

// ── Shared data ───────────────────────────────────────────────────────────────

interface PackageItem {
    id: string; name: string; code: string; tagline: string;
    price: number; duration: number; status: 'active' | 'inactive'; popular: boolean;
    icon: React.ElementType; colorClass: string; borderClass: string; badgeClass: string;
    features: { category: string; items: { label: string; included: boolean; note?: string }[] }[];
}

const packages: PackageItem[] = [
    {
        id: 'pkg_basic', name: 'Basic', code: 'BASIC', tagline: 'Sempurna untuk memulai',
        price: 99000, duration: 90, status: 'active', popular: false,
        icon: Zap, colorClass: 'text-sky-600', borderClass: 'border-sky-200', badgeClass: 'bg-sky-100 text-sky-700',
        features: [
            { category: 'Konten', items: [
                { label: 'Tamu tidak terbatas', included: true },
                { label: 'RSVP sederhana', included: true },
                { label: 'Buku tamu digital', included: true },
                { label: 'Galeri foto (maks. 10)', included: true },
                { label: 'Google Maps embed', included: true },
                { label: 'Countdown timer', included: true },
                { label: 'Musik latar', included: false },
                { label: 'Live streaming', included: false },
            ]},
            { category: 'Lanjutan', items: [
                { label: 'Template (5 pilihan)', included: true },
                { label: 'Custom domain', included: false },
                { label: 'QR Code undangan', included: true },
                { label: 'WhatsApp blast', included: false },
                { label: 'Amplop digital', included: false },
                { label: 'Custom CSS', included: false },
                { label: 'AI Writing Helper', included: false },
            ]},
        ],
    },
    {
        id: 'pkg_premium', name: 'Premium', code: 'PREMIUM', tagline: 'Paling banyak dipilih',
        price: 199000, duration: 180, status: 'active', popular: true,
        icon: Star, colorClass: 'text-primary', borderClass: 'border-primary/40', badgeClass: 'bg-primary/10 text-primary',
        features: [
            { category: 'Konten', items: [
                { label: 'Tamu tidak terbatas', included: true },
                { label: 'RSVP lengkap + konfirmasi', included: true },
                { label: 'Buku tamu digital', included: true },
                { label: 'Galeri foto tidak terbatas', included: true },
                { label: 'Google Maps embed', included: true },
                { label: 'Countdown timer', included: true },
                { label: 'Musik latar', included: true },
                { label: 'Live streaming (embed)', included: true },
            ]},
            { category: 'Lanjutan', items: [
                { label: 'Semua template (50+)', included: true },
                { label: 'Custom domain', included: true, note: 'TXT DNS verification' },
                { label: 'QR Code undangan', included: true },
                { label: 'WhatsApp blast', included: true },
                { label: 'Amplop digital (rekening)', included: true },
                { label: 'Custom CSS', included: false },
                { label: 'AI Writing Helper', included: false },
            ]},
        ],
    },
    {
        id: 'pkg_exclusive', name: 'Exclusive', code: 'EXCLUSIVE', tagline: 'Pengalaman tanpa batas',
        price: 349000, duration: 365, status: 'active', popular: false,
        icon: Crown, colorClass: 'text-amber-600', borderClass: 'border-amber-300', badgeClass: 'bg-amber-100 text-amber-700',
        features: [
            { category: 'Konten', items: [
                { label: 'Tamu tidak terbatas', included: true },
                { label: 'RSVP lengkap + konfirmasi', included: true },
                { label: 'Buku tamu digital', included: true },
                { label: 'Galeri foto & video tidak terbatas', included: true },
                { label: 'Google Maps embed', included: true },
                { label: 'Countdown timer animasi', included: true },
                { label: 'Musik latar (playlist)', included: true },
                { label: 'Live streaming (embed + native)', included: true },
            ]},
            { category: 'Lanjutan', items: [
                { label: 'Semua template + exclusive templates', included: true },
                { label: 'Custom domain + SSL otomatis', included: true, note: "Let's Encrypt" },
                { label: 'QR Code undangan', included: true },
                { label: 'WhatsApp blast', included: true },
                { label: 'Amplop digital (QRIS + rekening)', included: true },
                { label: 'Custom CSS & Page Builder', included: true },
                { label: 'AI Writing Helper', included: true },
            ]},
        ],
    },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function SaveBar({ note }: { note?: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-6 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{note ?? 'Perubahan berlaku setelah disimpan.'}</p>
            <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">Reset</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                    <Save className="size-3.5" />Simpan
                </button>
            </div>
        </div>
    );
}

function Input({ defaultValue, placeholder, prefix }: { defaultValue?: string; placeholder?: string; prefix?: string }) {
    if (prefix) {
        return (
            <div className="flex items-center rounded-lg border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-r border-border/60 shrink-0">{prefix}</span>
                <input type="text" defaultValue={defaultValue} placeholder={placeholder}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
        );
    }
    return (
        <input type="text" defaultValue={defaultValue} placeholder={placeholder}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
    );
}

// ── Tab: Daftar Paket ─────────────────────────────────────────────────────────

function PackageCard({ pkg }: { pkg: PackageItem }) {
    const [active, setActive] = useState(pkg.status === 'active');
    const Icon = pkg.icon;
    return (
        <div className={`relative rounded-2xl border-2 bg-card shadow-sm overflow-hidden transition-all ${pkg.popular ? pkg.borderClass : 'border-border/60'}`}>
            {pkg.popular && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
            <div className={`px-5 py-4 border-b border-border/40 ${pkg.popular ? 'bg-primary/5' : 'bg-muted/20'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex size-9 items-center justify-center rounded-xl ${pkg.badgeClass}`}>
                            <Icon className="size-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground">{pkg.name}</h3>
                                {pkg.popular && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                        <Sparkles className="size-2.5" />Populer
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{pkg.tagline}</p>
                        </div>
                    </div>
                    <button onClick={() => setActive(!active)} className="shrink-0 transition-colors" title={active ? 'Nonaktifkan' : 'Aktifkan'}>
                        {active ? <ToggleRight className="size-6 text-primary" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                    </button>
                </div>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-bold text-foreground">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(pkg.price)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">per acara • berlaku {pkg.duration} hari</p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pkg.badgeClass}`}>{pkg.code}</span>
                        <p className={`text-[11px] mt-1 font-medium ${active ? 'text-emerald-600' : 'text-muted-foreground'}`}>{active ? '● Aktif' : '○ Nonaktif'}</p>
                    </div>
                </div>
            </div>
            <div className="px-5 py-4 space-y-4">
                {pkg.features.map((g) => (
                    <div key={g.category}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{g.category}</p>
                        <ul className="space-y-1.5">
                            {g.items.map((item) => (
                                <li key={item.label} className="flex items-start gap-2">
                                    <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${item.included ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground/40'}`}>
                                        <Check className="size-2.5" />
                                    </span>
                                    <span className={`text-xs ${item.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{item.label}
                                        {item.note && item.included && <span className="ml-1 text-[10px] text-muted-foreground">({item.note})</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <Eye className="size-3.5" />Detail
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    <Edit className="size-3.5" />Edit Paket
                </button>
            </div>
        </div>
    );
}

function TabPackages() {
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Paket',   value: '3',        sub: 'terdaftar'   },
                    { label: 'Paket Aktif',   value: '3',        sub: 'tersedia'    },
                    { label: 'Terlaris',      value: 'Premium',  sub: 'bulan ini'   },
                    { label: 'Harga Terendah',value: 'Rp 99.000',sub: 'paket Basic' },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
            </div>
            <SaveBar note="Perubahan harga berlaku untuk pembelian baru. Paket aktif pelanggan tidak terpengaruh." />
        </div>
    );
}

// ── Tab: Fitur Paket ──────────────────────────────────────────────────────────

const featureKeys = [
    { key: 'unlimited_guests',   label: 'Tamu Tidak Terbatas',      category: 'Konten',   basic: true,  premium: true,  exclusive: true  },
    { key: 'rsvp_advanced',      label: 'RSVP Lengkap + Konfirmasi', category: 'Konten',   basic: false, premium: true,  exclusive: true  },
    { key: 'guestbook',          label: 'Buku Tamu Digital',         category: 'Konten',   basic: true,  premium: true,  exclusive: true  },
    { key: 'gallery_unlimited',  label: 'Galeri Tidak Terbatas',     category: 'Konten',   basic: false, premium: true,  exclusive: true  },
    { key: 'music',              label: 'Musik Latar',               category: 'Konten',   basic: false, premium: true,  exclusive: true  },
    { key: 'livestream',         label: 'Live Streaming',            category: 'Konten',   basic: false, premium: true,  exclusive: true  },
    { key: 'countdown',          label: 'Countdown Timer',           category: 'Konten',   basic: true,  premium: true,  exclusive: true  },
    { key: 'maps',               label: 'Google Maps Embed',         category: 'Konten',   basic: true,  premium: true,  exclusive: true  },
    { key: 'all_templates',      label: 'Semua Template (50+)',      category: 'Desain',   basic: false, premium: true,  exclusive: true  },
    { key: 'exclusive_templates',label: 'Template Exclusive',        category: 'Desain',   basic: false, premium: false, exclusive: true  },
    { key: 'custom_css',         label: 'Custom CSS',                category: 'Desain',   basic: false, premium: false, exclusive: true  },
    { key: 'page_builder',       label: 'Page Builder',              category: 'Desain',   basic: false, premium: false, exclusive: true  },
    { key: 'custom_domain',      label: 'Custom Domain',             category: 'Domain',   basic: false, premium: true,  exclusive: true  },
    { key: 'ssl_auto',           label: 'SSL Otomatis (Let\'s Encrypt)', category: 'Domain', basic: false, premium: false, exclusive: true },
    { key: 'qr_code',            label: 'QR Code Undangan',          category: 'Share',    basic: true,  premium: true,  exclusive: true  },
    { key: 'wa_blast',           label: 'WhatsApp Blast',            category: 'Share',    basic: false, premium: true,  exclusive: true  },
    { key: 'gift_envelope',      label: 'Amplop Digital (Rekening)', category: 'Gift',     basic: false, premium: true,  exclusive: true  },
    { key: 'qris_envelope',      label: 'Amplop Digital (QRIS)',     category: 'Gift',     basic: false, premium: false, exclusive: true  },
    { key: 'instagram_filter',   label: 'Instagram Filter AR',       category: 'Premium',  basic: false, premium: false, exclusive: true  },
    { key: 'ai_writer',          label: 'AI Writing Helper',         category: 'Premium',  basic: false, premium: false, exclusive: true  },
];

function CheckCell({ val }: { val: boolean }) {
    return (
        <div className="flex justify-center">
            <span className={`flex size-5 items-center justify-center rounded-full ${val ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground/30'}`}>
                <Check className="size-3" />
            </span>
        </div>
    );
}

function TabFeatures() {
    const categories = [...new Set(featureKeys.map((f) => f.category))];
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Matriks Fitur per Paket</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Kelola fitur yang tersedia di setiap paket layanan.</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                        <Plus className="size-3.5" />Tambah Fitur
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-[50%]">Fitur</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-sky-600 w-[15%]">Basic</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-primary w-[15%]">Premium</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-amber-600 w-[15%]">Exclusive</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <>
                                    <tr key={`cat-${cat}`} className="bg-muted/5 border-y border-border/30">
                                        <td colSpan={5} className="px-4 py-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat}</span>
                                        </td>
                                    </tr>
                                    {featureKeys.filter((f) => f.category === cat).map((f) => (
                                        <tr key={f.key} className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
                                            <td className="px-4 py-2.5">
                                                <p className="text-sm text-foreground">{f.label}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{f.key}</p>
                                            </td>
                                            <td className="px-4 py-2.5"><CheckCell val={f.basic} /></td>
                                            <td className="px-4 py-2.5"><CheckCell val={f.premium} /></td>
                                            <td className="px-4 py-2.5"><CheckCell val={f.exclusive} /></td>
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
            <SaveBar />
        </div>
    );
}

// ── Tab: Batas Penggunaan ─────────────────────────────────────────────────────

function TabLimits() {
    const rows = [
        { label: 'Jumlah Tamu',          key: 'max_guests',     basic: '∞',    premium: '∞',    exclusive: '∞',   unit: 'tamu'       },
        { label: 'Jumlah Foto',          key: 'max_photos',     basic: '10',   premium: '∞',    exclusive: '∞',   unit: 'foto'       },
        { label: 'Jumlah Video',         key: 'max_videos',     basic: '0',    premium: '5',    exclusive: '∞',   unit: 'video'      },
        { label: 'Kapasitas Storage',    key: 'storage_mb',     basic: '50',   premium: '500',  exclusive: '2048',unit: 'MB'         },
        { label: 'RSVP Konfirmasi',      key: 'rsvp_confirm',   basic: '∞',    premium: '∞',    exclusive: '∞',   unit: 'konfirmasi' },
        { label: 'WA Blast / hari',      key: 'wa_blast_day',   basic: '0',    premium: '200',  exclusive: '1000',unit: 'pesan'      },
        { label: 'Custom Domain',        key: 'custom_domains', basic: '0',    premium: '1',    exclusive: '3',   unit: 'domain'     },
        { label: 'Masa Aktif',           key: 'duration_days',  basic: '90',   premium: '180',  exclusive: '365', unit: 'hari'       },
    ];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                    <h2 className="text-sm font-semibold text-foreground">Batas Penggunaan per Paket</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">∞ = tidak terbatas. Nilai 0 = fitur tidak tersedia.</p>
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
                                <tr key={r.key} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-foreground">{r.label}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono">{r.key}</p>
                                    </td>
                                    {[r.basic, r.premium, r.exclusive].map((val, i) => (
                                        <td key={i} className="px-4 py-3 text-center">
                                            <input type="text" defaultValue={val}
                                                className="w-20 rounded-lg border border-border/60 bg-background px-2 py-1 text-sm text-center font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-border/40 bg-amber-50/50">
                    <p className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Sliders className="size-3.5 shrink-0" />
                        Semua paket menggunakan kebijakan data tidak terbatas (tamu, RSVP). Perbedaan utama ada pada akses fitur, bukan volume data.
                    </p>
                </div>
            </div>
            <SaveBar />
        </div>
    );
}

// ── Tab: Harga & Promo ────────────────────────────────────────────────────────

function TabPromo() {
    const promos = [
        { code: 'UNDESIA20',  type: 'Persentase', value: '20%',       minOrder: 'Rp 100.000', used: 45,  limit: 100, exp: '31 Jul 2026', status: 'active'   },
        { code: 'NEWUSER50K', type: 'Nominal',    value: 'Rp 50.000', minOrder: 'Rp 150.000', used: 128, limit: 500, exp: '30 Jun 2026', status: 'active'   },
        { code: 'LEBARAN30',  type: 'Persentase', value: '30%',       minOrder: 'Rp 200.000', used: 200, limit: 200, exp: '20 Apr 2026', status: 'expired'  },
        { code: 'BASIC2FREE', type: 'Gratis',     value: '1 bulan',   minOrder: 'Rp 99.000',  used: 10,  limit: 50,  exp: '31 Agt 2026', status: 'inactive' },
    ];

    const statusMap: Record<string, string> = {
        active:   'bg-emerald-100 text-emerald-700',
        expired:  'bg-muted text-muted-foreground',
        inactive: 'bg-amber-100 text-amber-700',
    };
    const statusLabel: Record<string, string> = {
        active: 'Aktif', expired: 'Kedaluwarsa', inactive: 'Nonaktif',
    };

    return (
        <div className="space-y-6">
            {/* Pricing Summary */}
            <div className="grid grid-cols-3 gap-4">
                {packages.map((p) => {
                    const Icon = p.icon;
                    return (
                        <div key={p.id} className={`rounded-2xl border-2 bg-card p-5 shadow-sm ${p.popular ? p.borderClass : 'border-border/60'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`flex size-7 items-center justify-center rounded-lg ${p.badgeClass}`}>
                                    <Icon className="size-3.5" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                                {p.popular && <span className="text-[10px] font-medium text-primary">★ Populer</span>}
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 mb-4">per acara</p>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Harga Normal</label>
                                    <Input defaultValue={p.price.toString()} prefix="Rp " />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Harga Coret (opsional)</label>
                                    <Input placeholder="0" prefix="Rp " />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Durasi (hari)</label>
                                    <Input defaultValue={p.duration.toString()} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Promo Codes */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Tag className="size-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Kode Promo</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Kelola kode diskon dan promosi platform.</p>
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
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Kode</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Tipe</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Nilai Diskon</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Min. Order</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Penggunaan</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Kadaluarsa</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                <th className="px-4 py-2.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {promos.map((p) => (
                                <tr key={p.code} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <span className="font-mono text-sm font-bold text-foreground">{p.code}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.type}</td>
                                    <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{p.value}</td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.minOrder}</td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((p.used / p.limit) * 100, 100)}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{p.used}/{p.limit}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.exp}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusMap[p.status]}`}>{statusLabel[p.status]}</span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                                            <Edit className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SaveBar note="Perubahan harga berlaku untuk pembelian baru. Kode promo aktif setelah disimpan." />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPackages() {
    const [activeTab, setActiveTab] = useState('packages');

    const panels: Record<string, React.ReactNode> = {
        packages: <TabPackages />,
        features: <TabFeatures />,
        limits:   <TabLimits />,
        promo:    <TabPromo />,
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Paket" />
            <SettingsLayout>
                <SettingsTabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                <div className="max-w-6xl mx-auto p-6">
                    {panels[activeTab]}
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}
