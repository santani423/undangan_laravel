import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AppWindow, CreditCard, KeyRound, Package, Palette, User } from 'lucide-react';

interface NavGroup {
    label: string;
    items: { title: string; url: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
    {
        label: 'Akun',
        items: [
            { title: 'Profil',     url: '/settings/profile',     icon: User      },
            { title: 'Password',   url: '/settings/password',    icon: KeyRound  },
            { title: 'Tampilan',   url: '/settings/appearance',  icon: Palette   },
        ],
    },
    {
        label: 'Sistem',
        items: [
            { title: 'Aplikasi',  url: '/settings/app',      icon: AppWindow  },
            { title: 'Pembayaran',url: '/settings/payment',  icon: CreditCard },
            { title: 'Paket',     url: '/settings/packages', icon: Package    },
        ],
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = typeof globalThis.window !== 'undefined' ? globalThis.window.location.pathname : '';

    return (
        <div className="px-4 py-6">
            <Heading title="Pengaturan" description="Kelola profil akun dan konfigurasi sistem." />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                {/* Sidebar nav */}
                <aside className="w-full lg:w-52 shrink-0">
                    <nav className="space-y-5">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.label}
                                </p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const active = currentPath === item.url || currentPath.startsWith(item.url + '/');
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.url}
                                                href={item.url}
                                                prefetch
                                                className={cn(
                                                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                    active
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
