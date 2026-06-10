import { SettingsTabNav, type SettingsTab } from '@/components/settings/settings-tab-nav';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Banknote,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    Globe,
    LayoutGrid,
    RefreshCw,
    Save,
    Shield,
    Smartphone,
    ToggleLeft,
    ToggleRight,
    Wallet,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Pengaturan', href: '/admin/settings/general' },
    { title: 'Pembayaran', href: '/admin/settings/payment' },
];

const tabs: SettingsTab[] = [
    { id: 'gateway',  label: 'Payment Gateway',       icon: CreditCard  },
    { id: 'methods',  label: 'Metode Pembayaran',     icon: LayoutGrid  },
    { id: 'webhook',  label: 'Konfigurasi Webhook',   icon: Globe       },
    { id: 'logs',     label: 'Log Integrasi',         icon: FileText    },
];

// ── Shared types & data ───────────────────────────────────────────────────────

type GatewayStatus = 'connected' | 'disconnected' | 'sandbox' | 'error';
type Env = 'sandbox' | 'production';

interface PaymentMethod { id: string; label: string; icon: React.ElementType; enabled: boolean; }
interface GatewayConfig {
    id: string; name: string; logo: string; description: string;
    status: GatewayStatus; env: Env; enabled: boolean; lastSync?: string;
    fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
    methods: PaymentMethod[];
}

const gateways: GatewayConfig[] = [
    {
        id: 'midtrans', name: 'Midtrans', logo: 'MT',
        description: 'Payment gateway lokal terpercaya. Mendukung VA, QRIS, e-wallet, kartu kredit.',
        status: 'sandbox', env: 'sandbox', enabled: true, lastSync: '10 Jun 2026, 08:42',
        fields: [
            { key: 'merchant_id', label: 'Merchant ID',           placeholder: 'G123456789'                },
            { key: 'client_key',  label: 'Client Key',            placeholder: 'SB-Mid-client-xxxxxxxxxxxx' },
            { key: 'server_key',  label: 'Server Key',            placeholder: 'SB-Mid-server-xxxxxxxxxxxx', secret: true },
            { key: 'webhook_url', label: 'Notification URL',      placeholder: 'https://undesia.com/webhook/midtrans' },
        ],
        methods: [
            { id: 'va',      label: 'Virtual Account',           icon: Banknote,  enabled: true  },
            { id: 'qris',    label: 'QRIS',                      icon: Smartphone,enabled: true  },
            { id: 'ewallet', label: 'E-Wallet (GoPay, OVO, Dana)',icon: Wallet,    enabled: true  },
            { id: 'cc',      label: 'Kartu Kredit / Debit',      icon: CreditCard,enabled: false },
        ],
    },
    {
        id: 'xendit', name: 'Xendit', logo: 'XD',
        description: 'Platform pembayaran dengan coverage terluas. Transfer bank, QRIS, e-wallet.',
        status: 'disconnected', env: 'sandbox', enabled: false,
        fields: [
            { key: 'api_key',       label: 'API Key (Secret Key)',            placeholder: 'xnd_development_xxxxxxxxxxxx', secret: true },
            { key: 'public_key',    label: 'Public Key',                      placeholder: 'xnd_public_development_xxxxxxxxxxxx' },
            { key: 'webhook_token', label: 'Webhook Verification Token',      placeholder: 'your-webhook-token', secret: true },
            { key: 'callback_url',  label: 'Callback URL',                    placeholder: 'https://undesia.com/webhook/xendit' },
        ],
        methods: [
            { id: 'va',       label: 'Virtual Account',                    icon: Banknote,  enabled: false },
            { id: 'qris',     label: 'QRIS',                               icon: Smartphone,enabled: false },
            { id: 'ewallet',  label: 'E-Wallet (OVO, Dana, ShopeePay)',    icon: Wallet,    enabled: false },
            { id: 'transfer', label: 'Transfer Bank Manual',               icon: ArrowRight,enabled: false },
        ],
    },
    {
        id: 'tripay', name: 'Tripay', logo: 'TP',
        description: 'Gateway lokal dengan biaya rendah. Cocok untuk transaksi volume tinggi.',
        status: 'disconnected', env: 'sandbox', enabled: false,
        fields: [
            { key: 'api_key',       label: 'API Key',         placeholder: 'DEV-xxxxxxxxxxxxxxxx' },
            { key: 'private_key',   label: 'Private Key',     placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', secret: true },
            { key: 'merchant_code', label: 'Merchant Code',   placeholder: 'T1234' },
            { key: 'callback_url',  label: 'Callback URL',    placeholder: 'https://undesia.com/webhook/tripay' },
        ],
        methods: [
            { id: 'va',       label: 'Virtual Account (BCA, BNI, BRI, Mandiri)', icon: Banknote,  enabled: false },
            { id: 'qris',     label: 'QRIS',                                      icon: Smartphone,enabled: false },
            { id: 'alfamart', label: 'Minimarket (Alfamart, Indomaret)',           icon: Wallet,    enabled: false },
        ],
    },
    {
        id: 'manual', name: 'Transfer Manual', logo: 'TF',
        description: 'Konfirmasi pembayaran manual via transfer bank. Admin verifikasi secara manual.',
        status: 'connected', env: 'production', enabled: true, lastSync: 'N/A',
        fields: [
            { key: 'bank_name',   label: 'Nama Bank',       placeholder: 'BCA / BNI / BRI / Mandiri' },
            { key: 'account_no',  label: 'Nomor Rekening',  placeholder: '1234567890' },
            { key: 'account_name',label: 'Atas Nama',       placeholder: 'PT. Undesia Digital Indonesia' },
            { key: 'conf_email',  label: 'Email Konfirmasi',placeholder: 'finance@undesia.com' },
        ],
        methods: [{ id: 'transfer', label: 'Transfer Bank', icon: Banknote, enabled: true }],
    },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GatewayStatus }) {
    const map: Record<GatewayStatus, { label: string; cls: string; Icon: React.ElementType }> = {
        connected:    { label: 'Terhubung',        cls: 'bg-emerald-100 text-emerald-700', Icon: Wifi         },
        disconnected: { label: 'Tidak Terhubung',  cls: 'bg-muted text-muted-foreground',  Icon: WifiOff      },
        sandbox:      { label: 'Sandbox',          cls: 'bg-amber-100 text-amber-700',     Icon: Zap          },
        error:        { label: 'Error',            cls: 'bg-red-100 text-red-700',         Icon: AlertCircle  },
    };
    const { label, cls, Icon } = map[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${cls}`}>
            <Icon className="size-3" />{label}
        </span>
    );
}

function SecretField({ placeholder }: { placeholder: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative flex items-center">
            <input type={show ? 'text' : 'password'} placeholder={placeholder}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}

function MethodToggle({ method }: { method: PaymentMethod }) {
    const [on, setOn] = useState(method.enabled);
    const Icon = method.icon;
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-2.5">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{method.label}</span>
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
                    <Save className="size-3.5" />Simpan
                </button>
            </div>
        </div>
    );
}

// ── Tab: Payment Gateway ──────────────────────────────────────────────────────

function GatewayCard({ gateway }: { gateway: GatewayConfig }) {
    const [expanded, setExpanded] = useState(gateway.enabled);
    const [enabled, setEnabled] = useState(gateway.enabled);
    const [env, setEnv] = useState<Env>(gateway.env);

    return (
        <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all ${enabled ? 'border-border/60' : 'border-border/30 opacity-70'}`}>
            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${gateway.status === 'connected' || gateway.status === 'sandbox' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {gateway.logo}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">{gateway.name}</h3>
                        <StatusBadge status={gateway.status} />
                        {enabled && env === 'sandbox' && <span className="text-[10px] text-amber-600 font-medium">Mode Testing</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{gateway.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {gateway.lastSync && <span className="text-[10px] text-muted-foreground hidden lg:block">Sync: {gateway.lastSync}</span>}
                    <button role="switch" aria-checked={enabled} onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-border'}`}>
                        <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Expanded */}
            {expanded && (
                <div className="border-t border-border/40">
                    <div className="grid grid-cols-2 gap-0 divide-x divide-border/40">
                        {/* Credentials */}
                        <div className="px-5 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kredensial API</p>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Shield className="size-3" />AES-256-CBC
                                </span>
                            </div>
                            <div className="space-y-3">
                                {gateway.fields.map((f) => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                                        {f.secret ? <SecretField placeholder={f.placeholder} /> : (
                                            <input type="text" placeholder={f.placeholder}
                                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                        )}
                                    </div>
                                ))}
                                {/* Env toggle */}
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">Environment</label>
                                    <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs">
                                        <button onClick={() => setEnv('sandbox')} className={`flex-1 py-2 font-medium transition-colors ${env === 'sandbox' ? 'bg-amber-100 text-amber-700' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                                            Sandbox (Testing)
                                        </button>
                                        <button onClick={() => setEnv('production')} className={`flex-1 py-2 font-medium transition-colors border-l border-border/60 ${env === 'production' ? 'bg-emerald-100 text-emerald-700' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                                            Production (Live)
                                        </button>
                                    </div>
                                    {env === 'production' && (
                                        <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                                            <AlertCircle className="size-3 shrink-0" />Mode production memproses transaksi nyata.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Methods + Monitoring */}
                        <div className="flex flex-col">
                            <div className="px-5 py-4 border-b border-border/40 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Metode Pembayaran</p>
                                {gateway.methods.map((m) => <MethodToggle key={m.id} method={m} />)}
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monitoring</p>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                                        <p className="text-[10px] text-muted-foreground">Status</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {gateway.status === 'connected' || gateway.status === 'sandbox'
                                                ? <CheckCircle2 className="size-3 text-emerald-600" />
                                                : <AlertCircle className="size-3 text-muted-foreground" />}
                                            <p className="text-xs font-semibold text-foreground">
                                                {gateway.status === 'sandbox' ? 'Sandbox OK' : gateway.status === 'connected' ? 'Live OK' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                                        <p className="text-[10px] text-muted-foreground">Last Sync</p>
                                        <p className="text-xs font-semibold text-foreground mt-0.5">{gateway.lastSync ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                                        <Activity className="size-3.5" />Log
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                                        <RefreshCw className="size-3.5" />Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">Kredensial disimpan terenkripsi.</p>
                        <div className="flex items-center gap-2">
                            <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <ExternalLink className="size-3" />Dokumentasi
                            </button>
                            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabGateway() {
    const activeCount = gateways.filter((g) => g.enabled).length;
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Gateway',    value: gateways.length.toString(),  sub: 'terdaftar'   },
                    { label: 'Gateway Aktif',    value: activeCount.toString(),       sub: 'terhubung'   },
                    { label: 'Mode Production',  value: '1',                          sub: 'gateway live' },
                    { label: 'Enkripsi',         value: 'AES-256',                   sub: 'semua kunci'  },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </div>
                ))}
            </div>
            {/* Security note */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Shield className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                    Semua API key dan secret key disimpan terenkripsi menggunakan <strong>AES-256-CBC</strong> via Laravel Crypt. Nilai tidak pernah tersimpan dalam plaintext di database maupun log sistem.
                </p>
            </div>
            <div className="space-y-4">
                {gateways.map((g) => <GatewayCard key={g.id} gateway={g} />)}
            </div>
        </div>
    );
}

// ── Tab: Metode Pembayaran ────────────────────────────────────────────────────

const allMethods = [
    { id: 'va_bca',        label: 'Virtual Account BCA',          icon: Banknote,   category: 'Virtual Account', gateways: ['Midtrans','Xendit','Tripay'], enabled: true  },
    { id: 'va_bni',        label: 'Virtual Account BNI',          icon: Banknote,   category: 'Virtual Account', gateways: ['Midtrans','Xendit','Tripay'], enabled: true  },
    { id: 'va_bri',        label: 'Virtual Account BRI',          icon: Banknote,   category: 'Virtual Account', gateways: ['Midtrans','Tripay'],          enabled: true  },
    { id: 'va_mandiri',    label: 'Virtual Account Mandiri',      icon: Banknote,   category: 'Virtual Account', gateways: ['Midtrans','Tripay'],          enabled: true  },
    { id: 'qris',          label: 'QRIS',                         icon: Smartphone, category: 'QRIS',            gateways: ['Midtrans','Xendit','Tripay'], enabled: true  },
    { id: 'gopay',         label: 'GoPay',                        icon: Wallet,     category: 'E-Wallet',        gateways: ['Midtrans'],                  enabled: true  },
    { id: 'ovo',           label: 'OVO',                          icon: Wallet,     category: 'E-Wallet',        gateways: ['Xendit'],                    enabled: false },
    { id: 'dana',          label: 'DANA',                         icon: Wallet,     category: 'E-Wallet',        gateways: ['Xendit'],                    enabled: false },
    { id: 'shopeepay',     label: 'ShopeePay',                    icon: Wallet,     category: 'E-Wallet',        gateways: ['Xendit'],                    enabled: false },
    { id: 'cc',            label: 'Kartu Kredit / Debit',         icon: CreditCard, category: 'Kartu',           gateways: ['Midtrans'],                  enabled: false },
    { id: 'alfamart',      label: 'Alfamart',                     icon: Wallet,     category: 'Minimarket',      gateways: ['Tripay'],                    enabled: false },
    { id: 'indomaret',     label: 'Indomaret',                    icon: Wallet,     category: 'Minimarket',      gateways: ['Tripay'],                    enabled: false },
    { id: 'transfer_bank', label: 'Transfer Bank Manual',         icon: Banknote,   category: 'Manual',          gateways: ['Manual'],                    enabled: true  },
];

function TabMethods() {
    const categories = [...new Set(allMethods.map((m) => m.category))];
    return (
        <div className="space-y-6">
            {categories.map((cat) => {
                const items = allMethods.filter((m) => m.category === cat);
                return (
                    <div key={cat} className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-border/40 bg-muted/20">
                            <h3 className="text-sm font-semibold text-foreground">{cat}</h3>
                        </div>
                        <div className="divide-y divide-border/30">
                            {items.map((m) => {
                                const [on, setOn] = useState(m.enabled);
                                const Icon = m.icon;
                                return (
                                    <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-8 items-center justify-center rounded-lg ${on ? 'bg-primary/10' : 'bg-muted'}`}>
                                                <Icon className={`size-4 ${on ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{m.label}</p>
                                                <p className="text-[11px] text-muted-foreground">via {m.gateways.join(', ')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium ${on ? 'text-emerald-600' : 'text-muted-foreground'}`}>{on ? 'Aktif' : 'Nonaktif'}</span>
                                            <button role="switch" aria-checked={on} onClick={() => setOn(!on)}
                                                className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
                                                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            <SaveBar />
        </div>
    );
}

// ── Tab: Webhook ──────────────────────────────────────────────────────────────

function TabWebhook() {
    const webhooks = [
        { gateway: 'Midtrans',       url: 'https://undesia.com/webhook/midtrans',  status: 'active' as const,  lastHit: '2 menit lalu'  },
        { gateway: 'Xendit',         url: 'https://undesia.com/webhook/xendit',    status: 'inactive' as const, lastHit: '—'             },
        { gateway: 'Tripay',         url: 'https://undesia.com/webhook/tripay',    status: 'inactive' as const, lastHit: '—'             },
        { gateway: 'Transfer Manual',url: 'https://undesia.com/webhook/manual',    status: 'active' as const,  lastHit: '1 jam lalu'    },
    ];

    return (
        <div className="space-y-6">
            {/* Base URL config */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                    <h2 className="text-sm font-semibold text-foreground">URL Webhook per Gateway</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">URL ini harus didaftarkan pada dashboard masing-masing payment gateway.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                {['Gateway','Webhook URL','Status','Last Hit','Aksi'].map((h) => (
                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {webhooks.map((w) => (
                                <tr key={w.gateway} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{w.gateway}</td>
                                    <td className="px-4 py-3">
                                        <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{w.url}</code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${w.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                            {w.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{w.lastHit}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Salin URL</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Redirect URLs */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                    <h2 className="text-sm font-semibold text-foreground">URL Redirect Setelah Pembayaran</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Halaman tujuan setelah proses pembayaran selesai.</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                    {[
                        { label: 'Success Redirect URL',  value: 'https://undesia.com/payment/success', hint: 'Setelah pembayaran berhasil.' },
                        { label: 'Failed Redirect URL',   value: 'https://undesia.com/payment/failed',  hint: 'Setelah pembayaran gagal atau dibatalkan.' },
                        { label: 'Pending Redirect URL',  value: 'https://undesia.com/payment/pending', hint: 'Untuk metode dengan pembayaran tertunda (VA, minimarket).' },
                    ].map((item) => (
                        <div key={item.label}>
                            <label className="block text-xs font-medium text-foreground mb-1">{item.label}</label>
                            <input type="text" defaultValue={item.value}
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                            <p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p>
                        </div>
                    ))}
                </div>
            </div>
            <SaveBar />
        </div>
    );
}

// ── Tab: Log Integrasi ────────────────────────────────────────────────────────

const logData = [
    { id: 'LOG-001', time: '10 Jun 2026 08:42:11', gateway: 'Midtrans', event: 'payment.success',  status: 'success', amount: 'Rp 199.000', ref: 'TRX-2026-0001' },
    { id: 'LOG-002', time: '10 Jun 2026 08:40:05', gateway: 'Midtrans', event: 'payment.pending',  status: 'pending', amount: 'Rp 99.000',  ref: 'TRX-2026-0002' },
    { id: 'LOG-003', time: '10 Jun 2026 07:15:33', gateway: 'Manual',   event: 'transfer.confirm', status: 'success', amount: 'Rp 349.000', ref: 'TRX-2026-0003' },
    { id: 'LOG-004', time: '10 Jun 2026 06:55:18', gateway: 'Midtrans', event: 'payment.failed',   status: 'failed',  amount: 'Rp 199.000', ref: 'TRX-2026-0004' },
    { id: 'LOG-005', time: '09 Jun 2026 23:11:45', gateway: 'Midtrans', event: 'payment.success',  status: 'success', amount: 'Rp 99.000',  ref: 'TRX-2026-0005' },
    { id: 'LOG-006', time: '09 Jun 2026 21:30:22', gateway: 'Manual',   event: 'transfer.confirm', status: 'success', amount: 'Rp 199.000', ref: 'TRX-2026-0006' },
    { id: 'LOG-007', time: '09 Jun 2026 19:05:10', gateway: 'Midtrans', event: 'webhook.error',    status: 'error',   amount: '—',          ref: '—'             },
    { id: 'LOG-008', time: '09 Jun 2026 17:42:09', gateway: 'Midtrans', event: 'payment.success',  status: 'success', amount: 'Rp 349.000', ref: 'TRX-2026-0008' },
];

function TabLogs() {
    const statusMap: Record<string, string> = {
        success: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        failed:  'bg-red-100 text-red-700',
        error:   'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Webhook Hari Ini', value: '24',    sub: 'diterima'    },
                    { label: 'Berhasil',               value: '21',    sub: '87.5%'       },
                    { label: 'Gagal / Error',          value: '3',     sub: 'perlu review'},
                    { label: 'Rata-rata Respons',      value: '142ms', sub: 'response time'},
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Log Table */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Log Webhook & Integrasi</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Riwayat 50 request webhook terakhir dari semua gateway.</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                        <RefreshCw className="size-3.5" />Refresh
                    </button>
                </div>
                {/* Filter bar */}
                <div className="px-5 py-3 border-b border-border/40 flex items-center gap-3 bg-muted/5">
                    <select className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                        <option>Semua Gateway</option>
                        <option>Midtrans</option>
                        <option>Xendit</option>
                        <option>Tripay</option>
                        <option>Manual</option>
                    </select>
                    <select className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                        <option>Semua Status</option>
                        <option>Success</option>
                        <option>Pending</option>
                        <option>Failed</option>
                        <option>Error</option>
                    </select>
                    <input type="text" placeholder="Cari ref / ID transaksi..." className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/10">
                                {['Log ID','Waktu','Gateway','Event','Jumlah','Ref Transaksi','Status'].map((h) => (
                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {logData.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{log.id}</td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{log.time}</td>
                                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{log.gateway}</td>
                                    <td className="px-4 py-2.5">
                                        <code className="text-xs font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded">{log.event}</code>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{log.amount}</td>
                                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{log.ref}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusMap[log.status]}`}>{log.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Menampilkan 8 dari 48 log</p>
                    <div className="flex items-center gap-1">
                        {[1,2,3,'...',6].map((p, i) => (
                            <button key={i} className={`size-7 rounded text-xs font-medium transition-colors ${p === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPayment() {
    const [activeTab, setActiveTab] = useState('gateway');

    const panels: Record<string, React.ReactNode> = {
        gateway: <TabGateway />,
        methods: <TabMethods />,
        webhook: <TabWebhook />,
        logs:    <TabLogs />,
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Pembayaran" />
            <SettingsLayout>
                <SettingsTabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                <div className="max-w-5xl mx-auto p-6">
                    {panels[activeTab]}
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}
