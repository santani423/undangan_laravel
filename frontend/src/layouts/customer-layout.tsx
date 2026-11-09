import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { type BreadcrumbItem } from '@/types';

export default function CustomerLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    return (
        <AppShell variant="sidebar">
            <CustomerSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
