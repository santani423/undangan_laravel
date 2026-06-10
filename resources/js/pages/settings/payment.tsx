import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
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
    RefreshCw,
    Save,
    Shield,
    Smartphone,
    Wallet,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan Pembayaran', href: '/settings/payment' },
];

type GatewayStatus = 'connected' | 'disconnected' | 'sandbox' | 'error';
type Env = 'sandbox' | 'production';

interface PaymentMethod { id: string; label: string; icon: React.ElementType; enabled: boolean }
interface GatewayConfig {
    id: string; name: string; logo: string; description: string;
    status: GatewayStatus; env: Env; enabled: boolean; lastSync?: string;
    fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
    methods: PaymentMethod[];
}

const gateways: GatewayConfig[] = [
    {
        id: 'midtrans', name: 'Midtrans', logo: 'MT',
        description: 'Payment gateway lokal terpercaya. VA, QRIS, e-wallet, kartu kredit.',
        status: 'sandbox', env: 'sandbox', enabled: true, lastSync: '10 Jun 2026, 08:42',
        fields: [
            { key: 'merchant_id', label: 'Merchant ID',      placeholder: 'G123456789'                  },
            { key: 'client_key',  label: 'Client Key',       placeholder: 'SB-Mid-client-xxxxxxxxxxxx'   },
            { key: 'server_key',  label: 'Server Key',       placeholder: 'SB-Mid-server-xxxxxxxxxxxx', secret: true },
            { key: 'webhook_url', label: 'Notification URL', placeholder: 'https://undesia.com/webhook/midtrans' },
        ],
        methods: [
            { id: 'va',      label: 'Virtual Account',            icon: Banknote,  enabled: true  },
            { id: 'qris',    label: 'QRIS',                       icon: Smartphone,enabled: true  },
            { id: 'ewallet', label: 'E-Wallet (GoPay, OVO, Dana)',icon: Wallet,    enabled: true  },
            { id: 'cc',      label: 'Kartu Kredit / Debit',       icon: CreditCard,enabled: false },
        ],
    },
    {
        id: 'xendit', name: 'Xendit', logo: 'XD',
        description: 'Coverage terluas. Transfer bank, QRIS, e-wallet.',
        status: 'disconnected', env: 'sandbox', enabled: false,
        fields: [
            { key: 'api_key',       label: 'API Key (Secret Key)',       placeholder: 'xnd_development_xxxxxxxxxxxx', secret: true },
            { key: 'public_key',    label: 'Public Key',                 placeholder: 'xnd_public_development_xxxxxxxxxxxx' },
            { key: 'webhook_token', label: 'Webhook Verification Token', placeholder: 'your-webhook-token', secret: true },
            { key: 'callback_url',  label: 'Callback URL',               placeholder: 'https://undesia.com/webhook/xendit' },
        ],
        methods: [
            { id: 'va',       label: 'Virtual Account',                 icon: Banknote,  enabled: false },
            { id: 'qris',     label: 'QRIS',                            icon: Smartphone,enabled: false },
            { id: 'ewallet',  label: 'E-Wallet (OVO, Dana, ShopeePay)', icon: Wallet,    enabled: false },
            { id: 'transfer', label: 'Transfer Bank Manual',            icon: ArrowRight,enabled: false },
        ],
    },
    {
        id: 'tripay', name: 'Tripay', logo: 'TP',
        description: 'Biaya rendah untuk transaksi volume tinggi.',
        status: 'disconnected', env: 'sandbox', enabled: false,
        fields: [
            { key: 'api_key',       label: 'API Key',       placeholder: 'DEV-xxxxxxxxxxxxxxxx' },
            { key: 'private_key',   label: 'Private Key',   placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', secret: true },
            { key: 'merchant_code', label: 'Kode Merchant', placeholder: 'T1234' },
            { key: 'callback_url',  label: 'Callback URL',  placeholder: 'https://undesia.com/webhook/tripay' },
        ],
        methods: [
            { id: 'va',       label: 'Virtual Account (BCA, BNI, BRI, Mandiri)', icon: Banknote,  enabled: false },
            { id: 'qris',     label: 'QRIS',                                      icon: Smartphone,enabled: false },
            { id: 'alfamart', label: 'Minimarket (Alfamart, Indomaret)',           icon: Wallet,    enabled: false },
        ],
    },
    {
        id: 'manual', name: 'Transfer Manual', logo: 'TF',
        description: 'Konfirmasi manual via transfer bank.',
        status: 'connected', env: 'production', enabled: true, lastSync: 'N/A',
        fields: [
            { key: 'bank_name',    label: 'Nama Bank',        placeholder: 'BCA / BNI / BRI / Mandiri' },
            { key: 'account_no',   label: 'Nomor Rekening',   placeholder: '1234567890' },
            { key: 'account_name', label: 'Atas Nama',        placeholder: 'PT. Undesia Digital Indonesia' },
            { key: 'conf_email',   label: 'Email Konfirmasi', placeholder: 'finance@undesia.com' },
        ],
        methods: [{ id: 'transfer', label: 'Transfer Bank', icon: Banknote, enabled: true }],
    },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GatewayStatus }) {
    const map: Record<GatewayStatus, { label: string; cls: string; Icon: React.ElementType }> = {
        connected:    { label: 'Terhubung',       cls: 'bg-emerald-100 text-emerald-700', Icon: Wifi        },
        disconnected: { label: 'Tidak Terhubung', cls: 'bg-muted text-muted-foreground',  Icon: WifiOff     },
        sandbox:      { label: 'Sandbox',         cls: 'bg-amber-100 text-amber-700',     Icon: Zap         },
        error:        { label: 'Error',           cls: 'bg-red-100 text-red-700',         Icon: AlertCircle },
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
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono" />
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
        <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
            <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{method.label}</span>
            </div>
            <button role="switch" aria-checked={on} onClick={() => setOn(!on)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

function GatewayCard({ gateway }: { gateway: GatewayConfig }) {
    const [expanded, setExpanded] = useState(gateway.enabled);
    const [enabled, setEnabled] = useState(gateway.enabled);
    const [env, setEnv] = useState<Env>(gateway.env);

    return (
        <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all ${enabled ? 'border-border/60' : 'border-border/30 opacity-70'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${gateway.status === 'connected' || gateway.status === 'sandbox' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {gateway.logo}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">{gateway.name}</h3>
                        <StatusBadge status={gateway.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{gateway.description}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button role="switch" aria-checked={enabled} onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}>
                        <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Expanded config */}
            {expanded && (
                <div className="border-t border-border/40">
                    <div className="grid grid-cols-2 divide-x divide-border/40">
                        {/* Credentials */}
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kredensial API</p>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Shield className="size-3" />AES-256-CBC
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {gateway.fields.map((f) => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                                        {f.secret ? <SecretField placeholder={f.placeholder} /> : (
                                            <input type="text" placeholder={f.placeholder}
                                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                        )}
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">Environment</label>
                                    <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs">
                                        <button onClick={() => setEnv('sandbox')} className={`flex-1 py-1.5 font-medium transition-colors ${env === 'sandbox' ? 'bg-amber-100 text-amber-700' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                                            Sandbox
                                        </button>
                                        <button onClick={() => setEnv('production')} className={`flex-1 py-1.5 font-medium border-l border-border/60 transition-colors ${env === 'production' ? 'bg-emerald-100 text-emerald-700' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                                            Production
                                        </button>
                                    </div>
                                    {env === 'production' && (
                                        <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
                                            <AlertCircle className="size-3 shrink-0" />Mode production memproses transaksi nyata.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Methods + Monitoring */}
                        <div className="flex flex-col">
                            <div className="px-4 py-4 border-b border-border/40">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Metode Pembayaran</p>
                                {gateway.methods.map((m) => <MethodToggle key={m.id} method={m} />)}
                            </div>
                            <div className="px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Monitoring</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                                        <p className="text-[10px] text-muted-foreground">Status</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {gateway.status === 'connected' || gateway.status === 'sandbox'
                                                ? <CheckCircle2 className="size-3 text-emerald-600" />
                                                : <AlertCircle className="size-3 text-muted-foreground" />}
                                            <p className="text-xs font-semibold">{gateway.status === 'sandbox' ? 'Sandbox OK' : gateway.status === 'connected' ? 'Live OK' : 'Offline'}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                                        <p className="text-[10px] text-muted-foreground">Last Sync</p>
                                        <p className="text-xs font-semibold mt-0.5">{gateway.lastSync ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border/60 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                                        <Activity className="size-3.5" />Log
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                                        <RefreshCw className="size-3.5" />Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Kredensial disimpan terenkripsi.</span>
                        <div className="flex items-center gap-2">
                            <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <ExternalLink className="size-3" />Docs
                            </button>
                            <button className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPayment() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Pembayaran" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Pengaturan Pembayaran" description="Konfigurasi payment gateway, metode, dan monitoring integrasi." />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Gateway Aktif',  value: '2',      sub: 'dari 4 gateway' },
                            { label: 'Mode Production', value: '1',     sub: 'Transfer Manual'  },
                            { label: 'Enkripsi',        value: 'AES-256',sub: 'semua kunci API' },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <p className="text-lg font-bold text-foreground mt-0.5">{s.value}</p>
                                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Security note */}
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <Shield className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            Semua API key dan secret key disimpan terenkripsi menggunakan <strong>AES-256-CBC</strong> via Laravel Crypt. Tidak pernah tersimpan dalam plaintext.
                        </p>
                    </div>

                    {/* Gateway Cards */}
                    <div className="space-y-3">
                        {gateways.map((g) => <GatewayCard key={g.id} gateway={g} />)}
                    </div>

                    {/* Redirect URLs */}
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-border/40 bg-muted/20">
                            <h3 className="text-sm font-semibold text-foreground">URL Redirect Pembayaran</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Halaman tujuan setelah proses pembayaran selesai.</p>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            {[
                                { label: 'Success URL', value: 'https://undesia.com/payment/success' },
                                { label: 'Failed URL',  value: 'https://undesia.com/payment/failed'  },
                                { label: 'Pending URL', value: 'https://undesia.com/payment/pending' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <label className="block text-xs font-medium text-foreground mb-1">{item.label}</label>
                                    <input type="text" defaultValue={item.value}
                                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Reset</button>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                            <Save className="size-3.5" />Simpan Perubahan
                        </button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
