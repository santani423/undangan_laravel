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
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    LayoutGrid,
    Mail,
    Package,
    Star,
    User,
} from 'lucide-react';

interface MenuItem {
    title: string;
    url: string;
    icon: React.ElementType;
}

const menuGroups: { label: string; items: MenuItem[] }[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', url: '/customer', icon: LayoutGrid },
        ],
    },
    {
        label: 'Undangan Saya',
        items: [
            { title: 'Daftar Undangan', url: '/customer/invitations', icon: Mail },
        ],
    },
    {
        label: 'Langganan',
        items: [
            { title: 'Paket Saya', url: '/customer/subscription', icon: Package },
            { title: 'Transaksi', url: '/customer/transactions', icon: CreditCard },
        ],
    },
    {
        label: 'Akun',
        items: [
            { title: 'Profil Saya', url: '/customer/profile', icon: User },
        ],
    },
];

export function CustomerSidebar() {
    const page = usePage();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/customer">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                                    <Star className="size-4" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="truncate leading-none font-bold tracking-wide">Undesia</span>
                                    <span className="truncate text-xs opacity-60 leading-none mt-0.5">Member Area</span>
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
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild isActive={page.url === item.url}>
                                        <Link href={item.url}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
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
