import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Check,
    Clock,
    Crown,
    Image as ImageIcon,
    MessageSquare,
    Save,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Paket Berlangganan', href: '/settings/packages' },
];

interface Feature { label: string; included: boolean; note?: string }
interface Package {
    id: string; name: string; price: string; duration: string;
    label?: string; labelColor?: string;
    icon: React.ElementType; iconColor: string; cardBorder: string;
    description: string; features: Feature[];
}

const packages: Package[] = [
    {
        id: 'basic', name: 'Basic', price: 'Rp 99.000', duration: '90 hari',
        icon: Zap, iconColor: 'text-blue-600', cardBorder: 'border-blue-200',
        description: 'Cocok untuk undangan sederhana.',
        features: [
            { label: '1 Undangan Aktif',                       included: true  },
            { label: 'Tamu sampai 100 orang',                  included: true  },
            { label: '5 Foto Upload',                          included: true  },
            { label: 'Penyimpanan 50 MB',                      included: true  },
            { label: 'Custom Subdomain (nama.undesia.com)',     included: true  },
            { label: 'Custom Domain Sendiri',                  included: false },
            { label: 'WhatsApp Blast (100 pesan)',             included: false },
            { label: 'Template Premium',                       included: false },
            { label: 'Live Streaming Link',                    included: false },
            { label: 'Musik Latar',                            included: true  },
            { label: 'RSVP Online',                            included: true  },
            { label: 'Ucapan & Doa Tamu',                      included: true  },
            { label: 'Google Maps Embed',                      included: true  },
            { label: 'Countdown Timer',                        included: true  },
            { label: 'Support Email',                          included: true  },
        ],
    },
    {
        id: 'premium', name: 'Premium', price: 'Rp 199.000', duration: '180 hari',
        label: 'Terpopuler', labelColor: 'bg-primary text-primary-foreground',
        icon: Star, iconColor: 'text-primary', cardBorder: 'border-primary/50',
        description: 'Fitur lengkap untuk undangan berkesan.',
        features: [
            { label: '3 Undangan Aktif',                       included: true  },
            { label: 'Tamu sampai 500 orang',                  included: true  },
            { label: '20 Foto Upload',                         included: true  },
            { label: 'Penyimpanan 500 MB',                     included: true  },
            { label: 'Custom Subdomain (nama.undesia.com)',     included: true  },
            { label: 'Custom Domain Sendiri',                  included: true  },
            { label: 'WhatsApp Blast (500 pesan)',             included: true  },
            { label: 'Template Premium',                       included: true  },
            { label: 'Live Streaming Link',                    included: true  },
            { label: 'Musik Latar',                            included: true  },
            { label: 'RSVP Online',                            included: true  },
            { label: 'Ucapan & Doa Tamu',                      included: true  },
            { label: 'Google Maps Embed',                      included: true  },
            { label: 'Countdown Timer',                        included: true  },
            { label: 'Support Email + WhatsApp',               included: true  },
        ],
    },
    {
        id: 'exclusive', name: 'Exclusive', price: 'Rp 349.000', duration: '365 hari',
        label: 'Terlengkap', labelColor: 'bg-amber-500 text-white',
        icon: Crown, iconColor: 'text-amber-600', cardBorder: 'border-amber-300',
        description: 'Semua fitur tak terbatas untuk kebutuhan profesional.',
        features: [
            { label: 'Undangan Tak Terbatas',                  included: true  },
            { label: 'Tamu Tak Terbatas',                      included: true  },
            { label: 'Foto Tak Terbatas',                      included: true  },
            { label: 'Penyimpanan 5 GB',                       included: true  },
            { label: 'Custom Subdomain (nama.undesia.com)',     included: true  },
            { label: 'Custom Domain Sendiri',                  included: true  },
            { label: 'WhatsApp Blast (Tak Terbatas)',          included: true  },
            { label: 'Template Premium',                       included: true  },
            { label: 'Live Streaming Link',                    included: true  },
            { label: 'Musik Latar',                            included: true  },
            { label: 'RSVP Online',                            included: true  },
            { label: 'Ucapan & Doa Tamu',                      included: true  },
            { label: 'Google Maps Embed',                      included: true  },
            { label: 'Countdown Timer',                        included: true  },
            { label: 'Support Prioritas 24/7',                 included: true  },
        ],
    },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Icon className="size-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

function PackageCard({ pkg, active, onSelect }: { pkg: Package; active: boolean; onSelect: () => void }) {
    const Icon = pkg.icon;
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`relative flex flex-col w-full rounded-2xl border-2 bg-card shadow-sm text-left transition-all hover:shadow-md ${active ? `${pkg.cardBorder} shadow-md ring-2 ring-primary/20` : 'border-border/40 hover:border-border'}`}
        >
            {pkg.label && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-semibold whitespace-nowrap ${pkg.labelColor}`}>
                    {pkg.label}
                </span>
            )}

            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-2.5 mb-2">
                    <Icon className={`size-5 ${pkg.iconColor}`} />
                    <h3 className="text-base font-bold text-foreground">{pkg.name}</h3>
                    {active && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary">
                            <Check className="size-3 text-primary-foreground" />
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{pkg.description}</p>
                <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-extrabold text-foreground">{pkg.price}</span>
                    <span className="text-xs text-muted-foreground pb-0.5">/ {pkg.duration}</span>
                </div>
            </div>

            {/* Features */}
            <div className="px-5 py-4 flex-1">
                <ul className="space-y-1.5">
                    {pkg.features.map((f) => (
                        <li key={f.label} className="flex items-center gap-2">
                            <div className={`flex size-4 items-center justify-center rounded-full shrink-0 ${f.included ? 'bg-emerald-100' : 'bg-muted'}`}>
                                {f.included
                                    ? <Check className="size-2.5 text-emerald-600" />
                                    : <span className="block size-1.5 rounded-full bg-muted-foreground/40" />}
                            </div>
                            <span className={`text-xs ${f.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{f.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </button>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPackages() {
    const [selected, setSelected] = useState<string | null>('premium');

    const currentPkg = packages.find((p) => p.id === 'premium')!;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paket Berlangganan" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Paket Berlangganan" description="Lihat paket aktif Anda dan upgrade untuk fitur lebih lengkap." />

                    {/* Current plan banner */}
                    <div className={`relative overflow-hidden rounded-2xl border-2 ${currentPkg.cardBorder} bg-card shadow-sm px-5 py-4`}>
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Star className="size-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-bold text-foreground">Paket Premium — Aktif</h3>
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Aktif</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="size-3" />Aktif: 1 Jan 2026</span>
                                    <span className="flex items-center gap-1"><Clock className="size-3" />Berakhir: 30 Jun 2026</span>
                                    <span className="flex items-center gap-1"><AlertCircle className="size-3 text-amber-500" />20 hari tersisa</span>
                                </div>
                            </div>
                            <button className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                                Perpanjang
                            </button>
                        </div>

                        {/* Usage bar */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: Users,        label: 'Undangan', used: 2, max: 3, unit: '' },
                                { icon: Users,        label: 'Tamu',     used: 320, max: 500, unit: '' },
                                { icon: ImageIcon,    label: 'Foto',     used: 14, max: 20, unit: '' },
                                { icon: MessageSquare,label: 'WA Blast', used: 210, max: 500, unit: '' },
                            ].map((u) => {
                                const pct = Math.round((u.used / u.max) * 100);
                                const warn = pct >= 80;
                                const Icon = u.icon;
                                return (
                                    <div key={u.label} className="rounded-xl bg-muted/30 px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Icon className="size-3.5 text-muted-foreground" />
                                            <p className="text-[11px] font-medium text-muted-foreground">{u.label}</p>
                                            <p className={`ml-auto text-[11px] font-bold ${warn ? 'text-amber-600' : 'text-foreground'}`}>{u.used}/{u.max}</p>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${warn ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className={`text-[10px] mt-0.5 ${warn ? 'text-amber-600' : 'text-muted-foreground'}`}>{pct}% terpakai</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatChip icon={Zap}    label="Paket Tersedia" value="3 Paket"       />
                        <StatChip icon={Clock}  label="Sisa Hari"      value="20 Hari"        />
                        <StatChip icon={Users}  label="Undangan Aktif" value="2 / 3"          />
                        <StatChip icon={Star}   label="Paket Sekarang" value="Premium"        />
                    </div>

                    {/* Package selection */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Pilih atau Upgrade Paket</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {packages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    active={selected === pkg.id}
                                    onSelect={() => setSelected(pkg.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Promo code */}
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm px-5 py-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Kode Promo</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Masukkan kode promo (mis. HEMAT20)"
                                className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                                Terapkan
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">Kode promo dapat memberikan diskon atau memperpanjang masa aktif.</p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
                        <Crown className="size-5 text-primary shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">Butuh paket custom untuk bisnis?</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Hubungi tim kami untuk penawaran enterprise dengan fitur dan harga yang disesuaikan.</p>
                        </div>
                        <button className="shrink-0 rounded-lg border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                            Hubungi Kami
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                            <Save className="size-3.5" />Upgrade Paket
                        </button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
