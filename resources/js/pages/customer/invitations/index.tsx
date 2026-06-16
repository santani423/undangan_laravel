import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookHeart,
    Calendar,
    Crown,
    ExternalLink,
    Gem,
    MoreVertical,
    Pencil,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationTheme {
    name: string;
    thumbnail_url: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
}

interface InvitationEventType {
    name: string;
    label: string;
}

interface InvitationPackage {
    label: string;
    billing_period: string;
    price: string;
}

interface Invitation {
    id: number;
    slug: string;
    title: string;
    status: 'draft' | 'active' | 'expired' | 'archived';
    is_public: boolean;
    created_at: string;
    expires_at: string | null;
    guests_count: number;
    theme: InvitationTheme | null;
    event_type: InvitationEventType | null;
    package: InvitationPackage | null;
    first_event_date: string | null;
}

interface Props {
    invitations: Invitation[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    draft:    'Draft',
    active:   'Aktif',
    expired:  'Kadaluarsa',
    archived: 'Diarsipkan',
};

const STATUS_CLASS: Record<string, string> = {
    draft:    'bg-muted text-muted-foreground',
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    expired:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

// ─── Card dropdown menu ───────────────────────────────────────────────────────

function CardMenu({ invitation }: { invitation: Invitation }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    function handleDelete() {
        if (!confirm(`Hapus undangan "${invitation.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(`/customer/invitations/${invitation.id}`);
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
                <MoreVertical className="size-4" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-9 z-20 w-44 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                        <Link
                            href={`/customer/invitations/${invitation.slug}/edit`}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <Pencil className="size-4 text-muted-foreground" />
                            Edit Undangan
                        </Link>
                        <a
                            href={`/undangan/${invitation.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <ExternalLink className="size-4 text-muted-foreground" />
                            Lihat Undangan
                        </a>
                        <div className="border-t border-border" />
                        <button
                            type="button"
                            onClick={() => { setOpen(false); handleDelete(); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                        >
                            <Trash2 className="size-4" />
                            Hapus
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Invitation Card ──────────────────────────────────────────────────────────

function InvitationCard({ invitation }: { invitation: Invitation }) {
    const theme = invitation.theme;

    const thumbnail = theme?.thumbnail_url ? (
        <img
            src={theme.thumbnail_url}
            alt={theme.name}
            className="w-full h-full object-cover"
        />
    ) : (
        <div
            className="w-full h-full"
            style={{
                background: theme?.color_primary
                    ? `linear-gradient(135deg, ${theme.color_primary}88, ${theme.color_secondary ?? theme.color_primary}cc)`
                    : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
            }}
        />
    );

    return (
        <div className="group bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-muted">
                {thumbnail}

                {/* Status badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_CLASS[invitation.status]}`}>
                    {STATUS_LABEL[invitation.status]}
                </span>

                {/* Theme badge */}
                {theme && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                        {theme.is_exclusive ? (
                            <><Gem className="size-3" /> Eksklusif</>
                        ) : theme.is_premium ? (
                            <><Crown className="size-3" /> Premium</>
                        ) : null}
                        {!theme.is_exclusive && !theme.is_premium ? theme.name : null}
                        {(theme.is_exclusive || theme.is_premium) ? ` · ${theme.name}` : null}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-3 p-4 flex-1">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-1">
                            {invitation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {invitation.event_type?.label ?? '—'}
                            {invitation.package && (
                                <> · <span className="text-foreground/70">{invitation.package.label}</span></>
                            )}
                        </p>
                    </div>
                    <CardMenu invitation={invitation} />
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        <span>
                            {invitation.first_event_date
                                ? formatDate(invitation.first_event_date)
                                : 'Tanggal belum ditentukan'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 shrink-0" />
                        <span>{invitation.guests_count} tamu</span>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                    <Link
                        href={`/customer/invitations/${invitation.slug}/detail`}
                        className="flex-1 text-center rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Edit  
                    </Link>
                    <a
                        href={`/undangan/${invitation.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Lihat
                    </a>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationsIndex({ invitations }: Props) {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Undangan Saya" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Undangan Saya</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {invitations.length > 0
                                ? `${invitations.length} undangan dibuat`
                                : 'Kelola semua undangan digital Anda.'}
                        </p>
                    </div>
                    <Link
                        href="/customer/invitations/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" />
                        Buat Undangan
                    </Link>
                </div>

                {/* List / Empty state */}
                {invitations.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border/60 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="bg-muted p-4 rounded-2xl mb-4">
                            <BookHeart className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">Belum Ada Undangan</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Mulai buat undangan digital pertama Anda.
                        </p>
                        <Link
                            href="/customer/invitations/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="size-4" />
                            Buat Undangan Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {invitations.map((inv) => (
                            <InvitationCard key={inv.id} invitation={inv} />
                        ))}

                        {/* Add new card */}
                        <Link
                            href="/customer/invitations/create"
                            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border min-h-[280px] text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                            <div className="size-12 rounded-full border-2 border-current flex items-center justify-center">
                                <Plus className="size-6" />
                            </div>
                            <span className="text-sm font-medium">Buat Undangan Baru</span>
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
