import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Eye,
    EyeOff,
    Flag,
    MessageSquare,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationInfo {
    id: number;
    slug: string;
    title: string;
}

interface CommentRow {
    id: number;
    guest_name: string;
    guest_email: string | null;
    comment_text: string;
    status: 'pending' | 'approved' | 'rejected';
    is_flagged: boolean;
    flag_reason: string | null;
    approved_at: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    flagged: number;
}

interface PaginatedComments {
    data: CommentRow[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    status?: string;
    flagged?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    invitation: InvitationInfo;
    comments: PaginatedComments;
    stats: Stats;
    filters: Filters;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Ditampilkan',
    rejected: 'Disembunyikan',
};

const STATUS_CLASS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-muted text-muted-foreground',
};

function formatDate(dt: string): string {
    return new Date(dt).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: Stats }) {
    const cards = [
        { label: 'Total', value: stats.total, color: 'text-blue-500' },
        { label: 'Ditampilkan', value: stats.approved, color: 'text-emerald-500' },
        { label: 'Menunggu', value: stats.pending, color: 'text-amber-500' },
        { label: 'Disembunyikan', value: stats.rejected, color: 'text-muted-foreground' },
        { label: 'Ditandai', value: stats.flagged, color: 'text-red-500' },
    ];
    return (
        <div className="grid grid-cols-5 gap-3">
            {cards.map(({ label, value, color }) => (
                <div key={label} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col items-center gap-1">
                    <span className={`text-xl font-bold ${color}`}>{value}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Comment Card ─────────────────────────────────────────────────────────────

function CommentCard({
    comment,
    slug,
    selected,
    onSelect,
}: {
    comment: CommentRow;
    slug: string;
    selected: boolean;
    onSelect: () => void;
}) {
    const handleApprove = () => router.patch(`/customer/invitations/${slug}/comments/${comment.id}/approve`);
    const handleReject  = () => router.patch(`/customer/invitations/${slug}/comments/${comment.id}/reject`);
    const handleFlag    = () => router.patch(`/customer/invitations/${slug}/comments/${comment.id}/flag`);
    const handleDelete  = () => {
        if (!confirm('Hapus komentar ini?')) return;
        router.delete(`/customer/invitations/${slug}/comments/${comment.id}`);
    };

    return (
        <div className={`bg-card rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition-colors ${comment.is_flagged ? 'border-red-300 dark:border-red-800' : 'border-border'} ${selected ? 'ring-2 ring-primary' : ''}`}>
            {/* Header */}
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onSelect}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">{comment.guest_name}</span>
                        {comment.guest_email && (
                            <span className="text-xs text-muted-foreground">{comment.guest_email}</span>
                        )}
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[comment.status]}`}>
                            {STATUS_LABEL[comment.status]}
                        </span>
                        {comment.is_flagged && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400">
                                <Flag className="size-3" /> Ditandai
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(comment.created_at)}</p>
                </div>
            </div>

            {/* Comment text */}
            <p className="text-sm text-foreground leading-relaxed pl-7">{comment.comment_text}</p>

            {/* Preview bubble — tampilan seperti di undangan */}
            <div className="pl-7">
                <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border/60 max-w-xs">
                    <p className="text-xs font-semibold text-foreground mb-0.5">{comment.guest_name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.comment_text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(comment.created_at)}</p>
                </div>
            </div>

            {/* Flag reason */}
            {comment.is_flagged && comment.flag_reason && (
                <div className="pl-7 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                    <span>{comment.flag_reason}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pl-7 flex-wrap">
                {comment.status !== 'approved' && (
                    <button onClick={handleApprove} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
                        <Eye className="size-3.5" /> Tampilkan
                    </button>
                )}
                {comment.status !== 'rejected' && (
                    <button onClick={handleReject} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                        <EyeOff className="size-3.5" /> Sembunyikan
                    </button>
                )}
                <button onClick={handleFlag} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${comment.is_flagged ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/10' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    <Flag className="size-3.5" /> {comment.is_flagged ? 'Hapus Tanda' : 'Tandai'}
                </button>
                <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/40 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                    <Trash2 className="size-3.5" /> Hapus
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommentsIndex({ invitation, comments, stats, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan', href: '/customer/invitations' },
        { title: invitation.title, href: `/customer/invitations/${invitation.slug}/edit` },
        { title: 'Komentar', href: '#' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    const applyFilter = (extra: Record<string, string | undefined>) => {
        router.get(
            `/customer/invitations/${invitation.slug}/comments`,
            { ...filters, ...extra },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === comments.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(comments.data.map((c) => c.id));
        }
    };

    const handleBulk = () => {
        if (!bulkAction || selectedIds.length === 0) return;
        if (bulkAction === 'delete' && !confirm(`Hapus ${selectedIds.length} komentar?`)) return;
        router.post(
            `/customer/invitations/${invitation.slug}/comments/bulk`,
            { action: bulkAction, ids: selectedIds },
            { onSuccess: () => { setSelectedIds([]); setBulkAction(''); } },
        );
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Komentar — ${invitation.title}`} />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/customer/invitations/${invitation.slug}/edit`}
                        className="size-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="size-4 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Preview Komentar</h1>
                        <p className="text-sm text-muted-foreground">{invitation.title}</p>
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
                            placeholder="Cari nama, email, atau isi komentar…"
                            className="flex-1 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(''); applyFilter({ search: undefined }); }}>
                                <X className="size-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </form>

                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter({ status: e.target.value || undefined })}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="approved">Ditampilkan</option>
                        <option value="rejected">Disembunyikan</option>
                    </select>

                    <select
                        value={filters.flagged ?? ''}
                        onChange={(e) => applyFilter({ flagged: e.target.value || undefined })}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                    >
                        <option value="">Semua Komentar</option>
                        <option value="yes">Hanya Ditandai</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={(e) => applyFilter({ date_from: e.target.value || undefined })}
                            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                        />
                        <span className="text-muted-foreground text-sm">—</span>
                        <input
                            type="date"
                            value={filters.date_to ?? ''}
                            onChange={(e) => applyFilter({ date_to: e.target.value || undefined })}
                            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                        />
                    </div>
                </div>

                {/* Bulk actions */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <span className="text-sm font-medium text-foreground">{selectedIds.length} dipilih</span>
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none"
                        >
                            <option value="">Pilih aksi…</option>
                            <option value="approve">Tampilkan semua</option>
                            <option value="reject">Sembunyikan semua</option>
                            <option value="delete">Hapus semua</option>
                        </select>
                        <button
                            onClick={handleBulk}
                            disabled={!bulkAction}
                            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                        >
                            Terapkan
                        </button>
                        <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                            Batal pilih
                        </button>
                    </div>
                )}

                {/* Comment list */}
                {comments.data.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center text-center gap-3">
                        <MessageSquare className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Tidak ada komentar yang ditemukan.</p>
                    </div>
                ) : (
                    <>
                        {/* Select all */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === comments.data.length && comments.data.length > 0}
                                onChange={toggleAll}
                                className="h-4 w-4 rounded border-border text-primary"
                            />
                            <span className="text-xs text-muted-foreground">Pilih semua di halaman ini</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {comments.data.map((c) => (
                                <CommentCard
                                    key={c.id}
                                    comment={c}
                                    slug={invitation.slug}
                                    selected={selectedIds.includes(c.id)}
                                    onSelect={() => toggleSelect(c.id)}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {comments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Total {comments.total} komentar</p>
                        <div className="flex gap-1">
                            {comments.links.map((link, i) => (
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

                {/* Approved preview section */}
                {stats.approved > 0 && (
                    <div className="mt-4">
                        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            Preview Tampilan Komentar di Undangan
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4">
                            Tampilan komentar di bawah ini sesuai dengan yang akan muncul pada halaman undangan.
                        </p>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-2xl border border-rose-200 dark:border-rose-800 p-6">
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {comments.data.filter((c) => c.status === 'approved').map((c) => (
                                    <div key={c.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-white/60 dark:border-border/60 max-w-sm">
                                        <p className="text-xs font-semibold text-foreground mb-0.5">{c.guest_name}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{c.comment_text}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(c.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
