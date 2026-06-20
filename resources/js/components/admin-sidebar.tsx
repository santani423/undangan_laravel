import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    AppWindow,
    BarChart3,
    Bell,
    ChevronRight,
    CreditCard,
    Globe,
    LayoutGrid,
    Mail,
    MessageSquare,
    Package,
    Shield,
    ShieldCheck,
    Star,
    Tag,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
    title: string;
    url: string;
    icon: React.ElementType;
    children?: { title: string; url: string }[];
}

const menuGroups: { label: string; items: MenuItem[] }[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', url: '/admin', icon: LayoutGrid },
        ],
    },
    {
        label: 'Manajemen Pengguna',
        items: [
            {
                title: 'Pengguna',
                url: '/admin/users',
                icon: Users,
                children: [
                    { title: 'Semua Pengguna', url: '/admin/users' },
                    { title: 'Admin & Operator', url: '/admin/users/admins' },
                ],
            },
            {
                title: 'Hak Akses',
                url: '/admin/users/roles',
                icon: ShieldCheck,
                children: [
                    { title: 'Role', url: '/admin/users/roles' },
                    { title: 'Permission', url: '/admin/users/permissions' },
                ],
            },
        ],
    },
    {
        label: 'Manajemen Undangan',
        items: [
            {
                title: 'Semua Undangan',
                url: '/admin/invitations',
                icon: Mail,
                children: [
                    { title: 'Daftar Undangan', url: '/admin/invitations' },
                    { title: 'Custom Domain', url: '/admin/invitations/custom-domains' },
                ],
            },
        ],
    },
    {
        label: 'Konten Platform',
        items: [
            { title: 'Jenis Acara', url: '/admin/event-types', icon: Tag },
            {
                title: 'Template & Tema',
                url: '/admin/themes',
                icon: Globe,
                children: [
                    { title: 'Daftar Tema', url: '/admin/themes' },
                    { title: 'Kategori Tema', url: '/admin/themes/categories' },
                ],
            },
            // { title: 'Paket & Harga', url: '/admin/packages', icon: Package },
        ],
    },
    {
        label: 'Keuangan',
        items: [
            {
                title: 'Transaksi',
                url: '/admin/transactions',
                icon: Wallet,
                children: [
                    { title: 'Semua Transaksi', url: '/admin/transactions' },
                    { title: 'Pembayaran Masuk', url: '/admin/transactions/payments' },
                    { title: 'Refund', url: '/admin/transactions/refunds' },
                ],
            },
        ],
    },
    {
        label: 'Komunitas',
        items: [
            { title: 'Testimoni', url: '/admin/content/testimonials', icon: Star },
        ],
    },
    {
        label: 'Laporan',
        items: [
            {
                title: 'Laporan & Analitik',
                url: '/admin/reports/platform',
                icon: BarChart3,
                children: [
                    { title: 'Statistik Platform', url: '/admin/reports/platform' },
                    { title: 'Laporan Pendapatan', url: '/admin/reports/revenue' },
                    { title: 'Log Aktivitas', url: '/admin/reports/activity-logs' },
                ],
            },
        ],
    },
    {
        label: 'Sistem',
        items: [
            { title: 'Pengaturan Aplikasi', url: '/admin/settings/general',      icon: AppWindow     },
            { title: 'Paket & Harga',       url: '/admin/settings/packages',     icon: Package       },
            { title: 'Pembayaran',          url: '/admin/settings/payment',      icon: CreditCard    },
            { title: 'WhatsApp Gateway',    url: '/admin/settings/whatsapp',     icon: MessageSquare },
            { title: 'Notifikasi',          url: '/admin/settings/notification', icon: Bell          },
        ],
    },
];

function NavMenuItem({ item }: { item: MenuItem }) {
    const page = usePage();
    const isActive = page.url.startsWith(item.url) && item.url !== '/admin'
        ? true
        : page.url === item.url;

    const [open, setOpen] = useState(isActive);

    if (item.children) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setOpen(!open)}
                    isActive={isActive}
                    className="justify-between"
                >
                    <div className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                    </div>
                    <ChevronRight className={`size-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
                </SidebarMenuButton>
                {open && (
                    <SidebarMenuSub>
                        {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton asChild isActive={page.url === child.url}>
                                    <Link href={child.url}>{child.title}</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={page.url === item.url}>
                <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                                    <Shield className="size-4" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="truncate leading-none font-bold tracking-wide">Undesia</span>
                                    <span className="truncate text-xs opacity-60 leading-none mt-0.5">Super Admin</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
                {menuGroups.map((group) => (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <NavMenuItem key={item.url} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
