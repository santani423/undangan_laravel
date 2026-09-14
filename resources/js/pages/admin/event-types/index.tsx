import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Edit,
    FileText,
    Layers,
    Plus,
    Search,
    Tag,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EventTypeData {
    id: number;
    name: string;
    label: string;
    description: string | null;
    icon_path: string | null;
    is_active: boolean;
    theme_count: number;
    invitations_count: number;
    created_at: string;
}

interface PageProps {
    eventTypes: EventTypeData[];
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

function FlashBanner() {
    const { flash } = usePage<PageProps>().props;
    const msg = flash?.success || flash?.error || null;
    const isSuccess = !!flash?.success;
    const [visible, setVisible] = useState(false);
    const lastMsg = useRef<string | null>(null);

    useEffect(() => {
        if (msg && msg !== lastMsg.current) {
            lastMsg.current = msg;
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [msg]);

    if (!visible || !msg) return null;
    return (
        <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
        }`}>
            <span className="flex items-center gap-2">
                {isSuccess ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                {msg}
            </span>
            <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="size-4" />
            </button>
        </div>
    );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────

interface FormState {
    name: string;
    label: string;
    description: string;
    icon_path: string;
    is_active: boolean;
}

const defaultForm: FormState = { name: '', label: '', description: '', icon_path: '', is_active: true };

function EventTypeFormModal({
    eventType,
    onClose,
    onSave,
}: {
    eventType?: EventTypeData;
    onClose: () => void;
    onSave: (data: FormState) => void;
}) {
    const isEdit = !!eventType;
    const [form, setForm] = useState<FormState>(
        eventType
            ? {
                  name: eventType.name,
                  label: eventType.label,
                  description: eventType.description ?? '',
                  icon_path: eventType.icon_path ?? '',
                  is_active: eventType.is_active,
              }
            : defaultForm,
    );
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    function set<K extends keyof FormState>(key: K, val: FormState[K]) {
        setForm((p) => ({ ...p, [key]: val }));
        setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
    }

    function validate() {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = 'Nama sistem wajib diisi';
        else if (!/^[a-zA-Z0-9_-]+$/.test(form.name.trim())) e.name = 'Hanya huruf, angka, - dan _';
        if (!form.label.trim()) e.label = 'Label tampilan wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            name: form.name.trim(),
            label: form.label.trim(),
            description: form.description.trim(),
            icon_path: form.icon_path.trim(),
            is_active: form.is_active,
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                            <Tag className="size-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">{isEdit ? 'Edit Jenis Acara' : 'Tambah Jenis Acara'}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Mengubah: ${eventType!.label}` : 'Buat jenis acara baru'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Label Tampilan <span className="text-red-500">*</span></label>
                            <input
                                value={form.label}
                                onChange={(e) => set('label', e.target.value)}
                                placeholder="mis: Khitanan"
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                            {errors.label && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.label}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Nama Sistem <span className="text-red-500">*</span></label>
                            <input
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="mis: khitanan"
                                disabled={isEdit}
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            <p className="mt-1 text-[10px] text-muted-foreground">Dipakai untuk menghubungkan tema ke jenis acara ini. {isEdit ? 'Tidak bisa diubah setelah dibuat.' : 'Huruf kecil, tanpa spasi.'}</p>
                            {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Deskripsi</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                rows={3}
                                placeholder="mis: Undangan acara khitanan/sunatan"
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Path Ikon</label>
                            <input
                                value={form.icon_path}
                                onChange={(e) => set('icon_path', e.target.value)}
                                placeholder="mis: icons/khitanan.svg"
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                            <button
                                type="button"
                                onClick={() => set('is_active', !form.is_active)}
                                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                                    form.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border/60 bg-background text-muted-foreground'
                                }`}
                            >
                                <span className="text-sm font-medium">{form.is_active ? 'Aktif — tema bisa dipesan' : 'Nonaktif — tema tidak bisa dipesan'}</span>
                                {form.is_active ? <ToggleRight className="size-5 text-emerald-600" /> : <ToggleLeft className="size-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            Batal
                        </button>
                        <button type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                            {isEdit ? <Edit className="size-3.5" /> : <Plus className="size-3.5" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Jenis Acara'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ eventType, onClose, onConfirm }: { eventType: EventTypeData; onClose: () => void; onConfirm: () => void }) {
    const blocked = eventType.invitations_count > 0;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
             onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 shrink-0">
                            <Trash2 className="size-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Hapus Jenis Acara</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                    </div>
                    {blocked ? (
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">"{eventType.label}"</strong> masih dipakai oleh {eventType.invitations_count} undangan yang sudah dibuat, jadi tidak bisa dihapus.
                            Nonaktifkan saja agar tidak bisa dipesan lagi.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Yakin ingin menghapus jenis acara <strong className="text-foreground">"{eventType.label}"</strong>?
                            {eventType.theme_count > 0 && ` ${eventType.theme_count} tema masih menggunakan jenis acara ini.`}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 px-6 pb-5">
                    <button type="button" onClick={onClose}
                        className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        Batal
                    </button>
                    {!blocked && (
                        <button type="button" onClick={onConfirm}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                            <Trash2 className="size-3.5" />Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Row ───────────────────────────────────────────────────────────────────────

function EventTypeRow({
    eventType,
    onEdit,
    onDelete,
    onToggle,
}: {
    eventType: EventTypeData;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    return (
        <tr className={`group hover:bg-muted/20 transition-colors border-b border-border/20 ${!eventType.is_active ? 'opacity-60' : ''}`}>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Tag className="size-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{eventType.label}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{eventType.name}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 max-w-xs">
                <p className="text-sm text-muted-foreground line-clamp-2">{eventType.description || '—'}</p>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm text-foreground">{eventType.theme_count}</span>
                <span className="text-[11px] text-muted-foreground"> tema</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm text-foreground">{eventType.invitations_count}</span>
                <span className="text-[11px] text-muted-foreground"> undangan</span>
            </td>
            <td className="px-4 py-3">
                <button onClick={onToggle}
                    title={eventType.is_active ? 'Nonaktifkan — tema dengan jenis acara ini tidak bisa dipesan' : 'Aktifkan kembali'}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80 ${
                        eventType.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}>
                    {eventType.is_active
                        ? <><ToggleRight className="size-3.5" />Aktif</>
                        : <><ToggleLeft  className="size-3.5" />Nonaktif</>}
                </button>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button onClick={onEdit} className="rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1">
                        <Edit className="size-3" />Edit
                    </button>
                    <button onClick={onDelete} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Breadcrumbs ───────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin' },
    { title: 'Jenis Acara', href: '/admin/event-types' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminEventTypes() {
    const { eventTypes } = usePage<PageProps>().props;

    const [search, setSearch] = useState('');
    const [editTarget, setEditTarget]     = useState<EventTypeData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EventTypeData | null>(null);
    const [showAdd, setShowAdd]           = useState(false);

    function handleAdd(data: FormState) {
        router.post(route('admin.event-types.store'), { ...data }, {
            preserveScroll: true,
            onSuccess: () => setShowAdd(false),
        });
    }

    function handleEdit(data: FormState) {
        router.patch(route('admin.event-types.update', { eventType: editTarget!.id }), { ...data }, {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function handleDelete() {
        router.delete(route('admin.event-types.destroy', { eventType: deleteTarget!.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function handleToggle(id: number) {
        router.patch(route('admin.event-types.toggle', { eventType: id }), {}, { preserveScroll: true });
    }

    const filtered = eventTypes.filter((t) =>
        !search ||
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()),
    );

    const totalActive = eventTypes.filter((t) => t.is_active).length;
    const totalThemes = eventTypes.reduce((s, t) => s + t.theme_count, 0);
    const totalInvitations = eventTypes.reduce((s, t) => s + t.invitations_count, 0);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Jenis Acara" />
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Jenis Acara</h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola jenis acara yang tersedia: Wedding, Birthday, Khitanan, Aqiqah, Gender Reveal, Syukuran, dan lainnya.</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                    >
                        <Plus className="size-4" />Tambah Jenis Acara
                    </button>
                </div>

                <FlashBanner />

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Jenis Acara', value: String(eventTypes.length), sub: 'terdaftar',     icon: Layers,      cls: 'text-primary'       },
                        { label: 'Aktif',             value: String(totalActive),       sub: 'bisa dipesan',  icon: ToggleRight, cls: 'text-emerald-600' },
                        { label: 'Tema Terhubung',    value: String(totalThemes),        sub: 'di semua jenis', icon: Tag,        cls: 'text-primary'     },
                        { label: 'Undangan Dibuat',   value: String(totalInvitations),   sub: 'total historis', icon: FileText,   cls: 'text-muted-foreground' },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <Icon className={`size-3.5 ${s.cls} opacity-60`} />
                                </div>
                                <p className="text-xl font-bold text-foreground">{s.value}</p>
                                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari jenis acara…"
                        className="w-full rounded-xl border border-border/60 bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                </div>

                {/* Content */}
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-border/60 py-20 text-center">
                        <Tag className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">Tidak ada jenis acara ditemukan</p>
                        <button onClick={() => setShowAdd(true)}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Plus className="size-4" />Tambah Jenis Acara
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Jenis Acara', 'Deskripsi', 'Tema', 'Undangan', 'Status', 'Aksi'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t) => (
                                        <EventTypeRow
                                            key={t.id} eventType={t}
                                            onEdit={() => setEditTarget(t)}
                                            onDelete={() => setDeleteTarget(t)}
                                            onToggle={() => handleToggle(t.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Info note */}
                <p className="rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Tag className="size-3.5 shrink-0 text-muted-foreground/60" />
                    Jenis acara yang dinonaktifkan akan disembunyikan dari alur pembuatan undangan — tema yang menggunakan jenis acara ini tidak bisa dipesan sampai diaktifkan kembali.
                </p>
            </div>

            {/* Modals */}
            {showAdd      && <EventTypeFormModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
            {editTarget   && <EventTypeFormModal eventType={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
            {deleteTarget && <DeleteConfirmModal eventType={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
        </AdminLayout>
    );
}
