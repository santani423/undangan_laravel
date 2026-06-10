import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { AppWindow, Bell, CreditCard, MessageSquare, Package } from 'lucide-react';

/**
 * Standalone settings layout — subdomain-ready.
 * Dapat digunakan langsung sebagai root layout apabila dipindahkan ke settings.undesia.com.
 * Di dalam admin panel, dibungkus dengan AdminLayout.
 */

const settingsNav = [
    {
        title: 'Aplikasi',
        href: '/admin/settings/general',
        icon: AppWindow,
        description: 'Info & konfigurasi sistem',
    },
    {
        title: 'Paket & Harga',
        href: '/admin/settings/packages',
        icon: Package,
        description: 'Manajemen paket layanan',
    },
    {
        title: 'Pembayaran',
        href: '/admin/settings/payment',
        icon: CreditCard,
        description: 'Gateway & metode bayar',
    },
    {
        title: 'WhatsApp',
        href: '/admin/settings/whatsapp',
        icon: MessageSquare,
        description: 'WA Gateway provider',
    },
    {
        title: 'Notifikasi',
        href: '/admin/settings/notification',
        icon: Bell,
        description: 'Template & preferensi',
    },
];

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const page = usePage();
    const currentUrl = page.url;

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)]">
            {/* ── Settings Navigation Sidebar ─────────────────────────────── */}
            <aside className="w-56 shrink-0 border-r border-border/50 flex flex-col">
                <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Pengaturan
                    </p>
                </div>

                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {settingsNav.map((item) => {
                        const isActive =
                            currentUrl === item.href ||
                            currentUrl.startsWith(item.href + '?') ||
                            currentUrl.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all group',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'size-4 shrink-0 transition-colors',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    )}
                                />
                                <div className="min-w-0">
                                    <div className="leading-tight truncate text-[13px]">{item.title}</div>
                                    <div className="text-[10px] opacity-60 leading-tight truncate mt-0.5">
                                        {item.description}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Subdomain indicator */}
                <div className="p-3 border-t border-border/50">
                    <div className="rounded-lg bg-muted/60 px-3 py-2 text-center">
                        <p className="text-[10px] font-medium text-muted-foreground">Subdomain Ready</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">settings.undesia.com</p>
                    </div>
                </div>
            </aside>

            {/* ── Settings Content ─────────────────────────────────────────── */}
            <main className="flex-1 overflow-auto bg-background/50">
                {children}
            </main>
        </div>
    );
}
