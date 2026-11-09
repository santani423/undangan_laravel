import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

/** Props every page receives besides its own data (see @/lib/navigation). */
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: { success?: string | null; error?: string | null; info?: string | null; status?: string | null };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    /** Role area from the API: 'admin' (admin/super_admin), 'customer', or null. */
    area?: 'admin' | 'customer' | null;
    /** Spatie role names. */
    roles?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
