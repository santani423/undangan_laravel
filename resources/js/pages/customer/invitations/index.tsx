import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookHeart, Calendar, Crown, ExternalLink, Gem, MoreVertical, Pencil, Plus, Trash2, Users } from 'lucide-react';
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
    draft: 'Draft',
    active: 'Aktif',
    expired: 'Kadaluarsa',
    archived: 'Diarsipkan',
};

const STATUS_CLASS: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    expired: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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
                className="text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors"
            >
                <MoreVertical className="size-4" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="bg-background border-border absolute top-9 right-0 z-20 w-44 overflow-hidden rounded-xl border shadow-lg">
                        <Link
                            href={`/customer/invitations/${invitation.slug}/edit`}
                            className="text-foreground hover:bg-muted flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <Pencil className="text-muted-foreground size-4" />
                            Edit Undangan
                        </Link>
                        <a
                            href={`/${invitation.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:bg-muted flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <ExternalLink className="text-muted-foreground size-4" />
                            Lihat Undangan
                        </a>
                        <div className="border-border border-t" />
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                handleDelete();
                            }}
                            className="text-destructive hover:bg-destructive/5 flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors"
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
        <img src={theme.thumbnail_url} alt={theme.name} className="h-full w-full object-cover" />
    ) : (
        <div
            className="h-full w-full"
            style={{
                background: theme?.color_primary
                    ? `linear-gradient(135deg, ${theme.color_primary}88, ${theme.color_secondary ?? theme.color_primary}cc)`
                    : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
            }}
        />
    );

    return (
        <div className="group bg-card border-border flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
            {/* Thumbnail */}
            <div className="bg-muted relative h-40 overflow-hidden">
                {thumbnail}

                {/* Status badge */}
                <span className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[invitation.status]}`}>
                    {STATUS_LABEL[invitation.status]}
                </span>

                {/* Theme badge */}
                {theme && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {theme.is_exclusive ? (
                            <>
                                <Gem className="size-3" /> Eksklusif
                            </>
                        ) : theme.is_premium ? (
                            <>
                                <Crown className="size-3" /> Premium
                            </>
                        ) : null}
                        {!theme.is_exclusive && !theme.is_premium ? theme.name : null}
                        {theme.is_exclusive || theme.is_premium ? ` · ${theme.name}` : null}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-foreground line-clamp-1 text-base leading-tight font-semibold">{invitation.title}</h3>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {invitation.event_type?.label ?? '—'}
                            {invitation.package && (
                                <>
                                    {' '}
                                    · <span className="text-foreground/70">{invitation.package.label}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <CardMenu invitation={invitation} />
                </div>

                {/* Meta */}
                <div className="text-muted-foreground flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        <span>{invitation.first_event_date ? formatDate(invitation.first_event_date) : 'Tanggal belum ditentukan'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 shrink-0" />
                        <span>{invitation.guests_count} tamu</span>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="border-border mt-auto flex items-center gap-2 border-t pt-3">
                    {invitation.status === 'draft' ? (
                        <Link
                            href={`/customer/invitations/${invitation.slug}/payment`}
                            className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-amber-600"
                        >
                            Bayar
                        </Link>
                    ) : (
                        <Link
                            href={`/customer/invitations/${invitation.slug}/detail`}
                            className="border-border text-foreground hover:bg-muted flex-1 rounded-xl border px-3 py-2 text-center text-xs font-medium transition-colors"
                        >
                            Detail
                        </Link>
                    )}
                    <a
                        href={`/${invitation.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium transition-colors"
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
                        <h1 className="text-foreground text-2xl font-bold">Undangan Saya</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {invitations.length > 0 ? `${invitations.length} undangan dibuat` : 'Kelola semua undangan digital Anda.'}
                        </p>
                    </div>
                    <Link
                        href="/customer/invitations/create"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                        <Plus className="size-4" />
                        Buat Undangan
                    </Link>
                </div>

                {/* List / Empty state */}
                {invitations.length === 0 ? (
                    <div className="bg-card border-border/60 flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
                        <div className="bg-muted mb-4 rounded-2xl p-4">
                            <BookHeart className="text-muted-foreground size-8" />
                        </div>
                        <h3 className="text-foreground mb-1 font-semibold">Belum Ada Undangan</h3>
                        <p className="text-muted-foreground mb-4 text-sm">Mulai buat undangan digital pertama Anda.</p>
                        <Link
                            href="/customer/invitations/create"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
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
                            className="border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors"
                        >
                            <div className="flex size-12 items-center justify-center rounded-full border-2 border-current">
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
