import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckSquare,
    Download,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserMinus,
    HelpCircle,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationInfo {
    id: number;
    slug: string;
    title: string;
}

interface GuestRow {
    id: number;
    name: string;
    slug: string | null;
    email: string | null;
    phone_number: string | null;
    gender: 'male' | 'female' | null;
    category: string | null;
    rsvp_status: 'pending' | 'attending' | 'not_attending' | 'maybe';
    rsvp_headcount: number | null;
    rsvp_notes: string | null;
    rsvp_submitted_at: string | null;
    checked_in_at: string | null;
    notes: string | null;
}

interface Stats {
    total: number;
    attending: number;
    notAttending: number;
    maybe: number;
    pending: number;
    checkedIn: number;
    totalHeads: number;
}

interface PaginatedGuests {
    data: GuestRow[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    rsvp_status?: string;
    checked_in?: string;
}

interface Props {
    invitation: InvitationInfo;
    guests: PaginatedGuests;
    stats: Stats;
    filters: Filters;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RSVP_LABEL: Record<string, string> = {
    pending: 'Belum Konfirmasi',
    attending: 'Hadir',
    not_attending: 'Tidak Hadir',
    maybe: 'Masih Ragu',
};

const RSVP_CLASS: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    attending: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    not_attending: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    maybe: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
};

function formatDateTime(dt: string | null): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ─── Slug Field ───────────────────────────────────────────────────────────────

function SlugField({
    invitationSlug,
    value,
    onChange,
    excludeId,
}: {
    invitationSlug: string;
    value: string;
    onChange: (v: string) => void;
    excludeId?: number;
}) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!value) { setStatus('idle'); return; }

        setStatus('checking');
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ slug: value });
                if (excludeId !== undefined) params.set('exclude_id', String(excludeId));
                const res = await fetch(
                    `/customer/invitations/${invitationSlug}/guests/check-slug?${params}`,
                    { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
                );
                const json = await res.json();
                setStatus(json.available ? 'available' : 'taken');
            } catch {
                setStatus('idle');
            }
        }, 400);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [value, invitationSlug, excludeId]);

    const borderClass =
        status === 'taken' ? 'border-red-400 focus:ring-red-400' :
        status === 'available' ? 'border-emerald-400 focus:ring-emerald-400' :
        'border-border';

    return (
        <div>
            <label className="text-sm font-medium text-foreground">Slug</label>
            <input
                value={value}
                onChange={(e) => onChange(toSlug(e.target.value))}
                placeholder="otomatis dari nama"
                className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 ${borderClass}`}
            />
            {status === 'checking' && (
                <p className="mt-1 text-xs text-muted-foreground">Memeriksa ketersediaan…</p>
            )}
            {status === 'taken' && (
                <p className="mt-1 text-xs text-red-500">Slug sudah digunakan pada undangan ini.</p>
            )}
            {status === 'available' && (
                <p className="mt-1 text-xs text-emerald-600">Slug tersedia.</p>
            )}
        </div>
    );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: Stats }) {
    const cards = [
        { label: 'Total Tamu', value: stats.total, icon: Users, color: 'text-blue-500' },
        { label: 'Hadir', value: stats.attending, icon: UserCheck, color: 'text-emerald-500' },
        { label: 'Tidak Hadir', value: stats.notAttending, icon: UserMinus, color: 'text-red-500' },
        { label: 'Masih Ragu', value: stats.maybe, icon: HelpCircle, color: 'text-amber-500' },
        { label: 'Check-in', value: stats.checkedIn, icon: CheckSquare, color: 'text-violet-500' },
        { label: 'Jml Kepala', value: stats.totalHeads, icon: Users, color: 'text-sky-500' },
    ];
    return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {cards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col items-center gap-1">
                    <Icon className={`size-5 ${color}`} />
                    <span className="text-xl font-bold text-foreground">{value}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Add Guest Modal ──────────────────────────────────────────────────────────

function AddGuestModal({ slug: invSlug, onClose }: { slug: string; onClose: () => void }) {
    const [form, setForm] = useState({ name: '', slug: '', email: '', phone_number: '', gender: '', category: '', notes: '' });
    const [slugManual, setSlugManual] = useState(false);
    const [saving, setSaving] = useState(false);
    const [slugTaken, setSlugTaken] = useState(false);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        setForm((f) => {
            const next = { ...f, [k]: val };
            if (k === 'name' && !slugManual) {
                next.slug = toSlug(val);
            }
            return next;
        });
    };

    const handleSlugChange = (v: string) => {
        setSlugManual(true);
        setForm((f) => ({ ...f, slug: v }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (slugTaken) return;
        setSaving(true);
        router.post(`/customer/invitations/${invSlug}/guests`, form, {
            onSuccess: onClose,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Tambah Tamu</h2>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-muted"><X className="size-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Nama *</label>
                            <input required value={form.name} onChange={set('name')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <SlugField
                            invitationSlug={invSlug}
                            value={form.slug}
                            onChange={(v) => { handleSlugChange(v); setSlugTaken(false); }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">No HP</label>
                            <input value={form.phone_number} onChange={set('phone_number')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Jenis Kelamin</label>
                            <select value={form.gender} onChange={set('gender')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">—</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Kategori</label>
                            <input placeholder="Keluarga, Rekan, dll." value={form.category} onChange={set('category')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Catatan</label>
                        <textarea value={form.notes} onChange={set('notes')} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={saving || slugTaken} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {saving ? 'Menyimpan…' : 'Simpan'}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Edit Guest Modal ─────────────────────────────────────────────────────────

function EditGuestModal({ guest, invSlug, onClose }: { guest: GuestRow; invSlug: string; onClose: () => void }) {
    const [form, setForm] = useState({
        name: guest.name,
        slug: guest.slug ?? '',
        email: guest.email ?? '',
        phone_number: guest.phone_number ?? '',
        gender: guest.gender ?? '',
        category: guest.category ?? '',
        notes: guest.notes ?? '',
        rsvp_status: guest.rsvp_status,
        rsvp_headcount: String(guest.rsvp_headcount ?? 1),
    });
    const [slugTaken, setSlugTaken] = useState(false);
    const [saving, setSaving] = useState(false);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (slugTaken) return;
        setSaving(true);
        router.patch(`/customer/invitations/${invSlug}/guests/${guest.id}`, form, {
            onSuccess: onClose,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Edit Tamu</h2>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-muted"><X className="size-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Nama *</label>
                            <input required value={form.name} onChange={set('name')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <SlugField
                            invitationSlug={invSlug}
                            value={form.slug}
                            onChange={(v) => { setForm((f) => ({ ...f, slug: v })); setSlugTaken(false); }}
                            excludeId={guest.id}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">No HP</label>
                            <input value={form.phone_number} onChange={set('phone_number')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Jenis Kelamin</label>
                            <select value={form.gender} onChange={set('gender')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">—</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Kategori</label>
                            <input placeholder="Keluarga, Rekan, dll." value={form.category} onChange={set('category')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground">Status RSVP</label>
                            <select value={form.rsvp_status} onChange={set('rsvp_status')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="pending">Belum Konfirmasi</option>
                                <option value="attending">Hadir</option>
                                <option value="not_attending">Tidak Hadir</option>
                                <option value="maybe">Masih Ragu</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Jml Tamu</label>
                            <input type="number" min={0} max={100} value={form.rsvp_headcount} onChange={set('rsvp_headcount')} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Catatan</label>
                        <textarea value={form.notes} onChange={set('notes')} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={saving || slugTaken} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {saving ? 'Menyimpan…' : 'Simpan'}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Guest Row ────────────────────────────────────────────────────────────────

function GuestTableRow({ guest, slug, onEdit }: { guest: GuestRow; slug: string; onEdit: (g: GuestRow) => void }) {
    const handleCheckIn = () => {
        router.patch(`/customer/invitations/${slug}/guests/${guest.id}/checkin`);
    };
    const handleDelete = () => {
        if (!confirm(`Hapus tamu "${guest.name}"?`)) return;
        router.delete(`/customer/invitations/${slug}/guests/${guest.id}`);
    };

    return (
        <tr className="border-b border-border hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3">
                <p className="font-medium text-foreground text-sm">{guest.name}</p>
                {guest.email && <p className="text-xs text-muted-foreground">{guest.email}</p>}
                {guest.phone_number && <p className="text-xs text-muted-foreground">{guest.phone_number}</p>}
            </td>
            <td className="px-4 py-3">
                {guest.slug
                    ? <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{guest.slug}</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">{guest.category ?? '—'}</td>
            <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${RSVP_CLASS[guest.rsvp_status]}`}>
                    {RSVP_LABEL[guest.rsvp_status]}
                </span>
            </td>
            <td className="px-4 py-3 text-center text-sm text-foreground">{guest.rsvp_headcount ?? 1}</td>
            <td className="px-4 py-3">
                {guest.checked_in_at ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckSquare className="size-3.5" />
                        {formatDateTime(guest.checked_in_at)}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button
                        title={guest.checked_in_at ? 'Batalkan Check-in' : 'Check-in'}
                        onClick={handleCheckIn}
                        className={`p-1.5 rounded-lg transition-colors ${guest.checked_in_at ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <CheckSquare className="size-4" />
                    </button>
                    <button
                        title="Edit"
                        onClick={() => onEdit(guest)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        title="Hapus"
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/5 transition-colors"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuestBookIndex({ invitation, guests, stats, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan', href: '/customer/invitations' },
        { title: invitation.title, href: `/customer/invitations/${invitation.slug}/edit` },
        { title: 'Buku Tamu', href: '#' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState<GuestRow | null>(null);

    const applyFilter = (extra: Record<string, string>) => {
        router.get(
            `/customer/invitations/${invitation.slug}/guests`,
            { ...filters, search, ...extra },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const clearFilter = (key: string) => {
        const f = { ...filters, [key]: undefined };
        if (key === 'search') setSearch('');
        router.get(`/customer/invitations/${invitation.slug}/guests`, f, { preserveScroll: true });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Buku Tamu — ${invitation.title}`} />
            {showAddModal && <AddGuestModal slug={invitation.slug} onClose={() => setShowAddModal(false)} />}
            {editingGuest && (
                <EditGuestModal
                    guest={editingGuest}
                    invSlug={invitation.slug}
                    onClose={() => setEditingGuest(null)}
                />
            )}

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/customer/invitations/${invitation.slug}/edit`}
                            className="size-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="size-4 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Buku Tamu</h1>
                            <p className="text-sm text-muted-foreground">{invitation.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`/customer/invitations/${invitation.slug}/guests/export/csv`}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <Download className="size-4" /> Export CSV
                        </a>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="size-4" /> Tambah Tamu
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <StatsBar stats={stats} />

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="flex-1 min-w-48 flex items-center gap-2 bg-card border border-border rounded-xl px-3">
                        <Search className="size-4 text-muted-foreground shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, email, no HP…"
                            className="flex-1 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(''); clearFilter('search'); }}>
                                <X className="size-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </form>

                    <select
                        value={filters.rsvp_status ?? ''}
                        onChange={(e) => applyFilter({ rsvp_status: e.target.value })}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Semua Status</option>
                        <option value="attending">Hadir</option>
                        <option value="not_attending">Tidak Hadir</option>
                        <option value="maybe">Masih Ragu</option>
                        <option value="pending">Belum Konfirmasi</option>
                    </select>

                    <select
                        value={filters.checked_in ?? ''}
                        onChange={(e) => applyFilter({ checked_in: e.target.value })}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Semua Check-in</option>
                        <option value="yes">Sudah Check-in</option>
                        <option value="no">Belum Check-in</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {guests.data.length === 0 ? (
                        <div className="p-12 flex flex-col items-center text-center gap-3">
                            <Users className="size-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Tidak ada tamu yang ditemukan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slug</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kategori</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status RSVP</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jml</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Check-in</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guests.data.map((g) => (
                                        <GuestTableRow key={g.id} guest={g} slug={invitation.slug} onEdit={setEditingGuest} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {guests.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                Total {guests.total} tamu
                            </p>
                            <div className="flex gap-1">
                                {guests.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-muted'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground opacity-40"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
