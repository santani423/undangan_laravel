import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Crown,
    Edit,
    Eye,
    Filter,
    Grid3X3,
    Image,
    Layers,
    List,
    Palette,
    Plus,
    Search,
    Star,
    Tag,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Upload,
    X,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TemplateData {
    id: number;
    name: string;
    slug: string;
    category: string;
    event_type: string;
    thumbnail: string;
    color_primary: string;
    color_secondary: string;
    is_active: boolean;
    is_premium: boolean;
    is_exclusive: boolean;
    price: number;
    usage_count: number;
    tags: string[];
    created_at: string;
}

// ─── Page props ───────────────────────────────────────────────────────────────

interface PageProps {
    themes: TemplateData[];
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

const CATEGORIES = ['Semua', 'Floral', 'Modern', 'Mewah', 'Minimalis', 'Rustic', 'Alam'];
const EVENT_TYPES = ['Semua', 'Pernikahan', 'Pertunangan', 'Ulang Tahun', 'Aqiqah', 'Khitanan'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(n: number) {
    if (n === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function tierMeta(tpl: TemplateData) {
    if (tpl.is_exclusive) return { label: 'Eksklusif', icon: Crown, cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (tpl.is_premium)   return { label: 'Premium',   icon: Star,  cls: 'bg-primary/10 text-primary border-primary/20' };
    return                       { label: 'Gratis',    icon: Zap,   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}

// ─── Thumbnail placeholder ─────────────────────────────────────────────────────

function TemplateThumbnail({ tpl, size = 'md' }: { tpl: TemplateData; size?: 'sm' | 'md' | 'lg' }) {
    const h = size === 'lg' ? 'h-48' : size === 'md' ? 'h-36' : 'h-24';
    return (
        <div
            className={`relative w-full ${h} rounded-xl overflow-hidden flex items-center justify-center`}
            style={{ background: `linear-gradient(135deg, ${tpl.color_primary}33 0%, ${tpl.color_secondary} 100%)` }}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-60">
                <div className="w-8 h-0.5 rounded-full" style={{ background: tpl.color_primary }} />
                <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: tpl.color_primary }}>{tpl.name}</div>
                <div className="w-5 h-0.5 rounded-full" style={{ background: tpl.color_primary }} />
            </div>
            <Palette className="absolute bottom-2 right-2 size-4 opacity-20" style={{ color: tpl.color_primary }} />
        </div>
    );
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

// ─── Template Form Modal ───────────────────────────────────────────────────────

interface FormState {
    name: string;
    category: string;
    event_type: string;
    color_primary: string;
    color_secondary: string;
    is_active: boolean;
    is_premium: boolean;
    is_exclusive: boolean;
    price: string;
    tags: string;
}

const defaultForm: FormState = {
    name: '', category: 'Floral', event_type: 'Pernikahan',
    color_primary: '#e8a5b4', color_secondary: '#f9e4ea',
    is_active: true, is_premium: false, is_exclusive: false,
    price: '0', tags: '',
};

function TemplateFormModal({
    template,
    onClose,
    onSave,
}: {
    template?: TemplateData;
    onClose: () => void;
    onSave: (data: Partial<TemplateData>) => void;
}) {
    const isEdit = !!template;
    const [form, setForm] = useState<FormState>(
        template
            ? {
                  name: template.name,
                  category: template.category,
                  event_type: template.event_type,
                  color_primary: template.color_primary,
                  color_secondary: template.color_secondary,
                  is_active: template.is_active,
                  is_premium: template.is_premium,
                  is_exclusive: template.is_exclusive,
                  price: String(template.price),
                  tags: template.tags.join(', '),
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
        if (!form.name.trim()) e.name = 'Nama template wajib diisi';
        if (!form.category)    e.category = 'Pilih kategori';
        if (!form.event_type)  e.event_type = 'Pilih jenis acara';
        if ((form.is_premium || form.is_exclusive) && Number(form.price) <= 0)
            e.price = 'Harga harus > 0 untuk template berbayar';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            name: form.name.trim(),
            slug: form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            category: form.category,
            event_type: form.event_type,
            color_primary: form.color_primary,
            color_secondary: form.color_secondary,
            is_active: form.is_active,
            is_premium: form.is_premium || form.is_exclusive,
            is_exclusive: form.is_exclusive,
            price: Number(form.price),
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
    }

    const previewTpl = {
        ...defaultForm,
        id: 0, slug: '', usage_count: 0, created_at: '',
        name: form.name || 'Preview',
        color_primary: form.color_primary,
        color_secondary: form.color_secondary,
        is_premium: form.is_premium,
        is_exclusive: form.is_exclusive,
        is_active: form.is_active,
        price: Number(form.price),
        category: form.category,
        event_type: form.event_type,
        tags: [],
    } as TemplateData;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                            <Layers className="size-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">{isEdit ? 'Edit Template' : 'Tambah Template Baru'}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Mengubah: ${template!.name}` : 'Buat template undangan baru'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Left: Form */}
                        <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
                            {/* Nama */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Nama Template <span className="text-red-500">*</span></label>
                                <input
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    placeholder="mis: Blossom Garden"
                                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>}
                            </div>

                            {/* Kategori + Jenis Acara */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Kategori <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => set('category', e.target.value)}
                                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                    >
                                        {CATEGORIES.filter((c) => c !== 'Semua').map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Jenis Acara <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.event_type}
                                        onChange={(e) => set('event_type', e.target.value)}
                                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                    >
                                        {EVENT_TYPES.filter((t) => t !== 'Semua').map((t) => <option key={t}>{t}</option>)}
                                    </select>
                                    {errors.event_type && <p className="mt-1 text-xs text-red-500">{errors.event_type}</p>}
                                </div>
                            </div>

                            {/* Warna */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Warna Utama</label>
                                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
                                        <input type="color" value={form.color_primary} onChange={(e) => set('color_primary', e.target.value)}
                                            className="size-5 rounded cursor-pointer border-none bg-transparent" />
                                        <span className="text-sm font-mono text-foreground">{form.color_primary}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Warna Sekunder</label>
                                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
                                        <input type="color" value={form.color_secondary} onChange={(e) => set('color_secondary', e.target.value)}
                                            className="size-5 rounded cursor-pointer border-none bg-transparent" />
                                        <span className="text-sm font-mono text-foreground">{form.color_secondary}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tier */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">Tingkat Template</label>
                                <div className="flex gap-2">
                                    {([
                                        { label: 'Gratis',    value: 'free',      icon: Zap,   cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                                        { label: 'Premium',   value: 'premium',   icon: Star,  cls: 'border-primary/30 bg-primary/10 text-primary' },
                                        { label: 'Eksklusif', value: 'exclusive', icon: Crown, cls: 'border-amber-200 bg-amber-50 text-amber-700' },
                                    ] as { label: string; value: string; icon: React.ElementType; cls: string }[]).map((tier) => {
                                        const Icon = tier.icon;
                                        const active = tier.value === 'exclusive'
                                            ? form.is_exclusive
                                            : tier.value === 'premium'
                                            ? (form.is_premium && !form.is_exclusive)
                                            : (!form.is_premium && !form.is_exclusive);
                                        return (
                                            <button
                                                key={tier.value} type="button"
                                                onClick={() => {
                                                    if (tier.value === 'free')      { set('is_premium', false); set('is_exclusive', false); set('price', '0'); }
                                                    if (tier.value === 'premium')   { set('is_premium', true);  set('is_exclusive', false); if (Number(form.price) === 0) set('price', '75000'); }
                                                    if (tier.value === 'exclusive') { set('is_premium', true);  set('is_exclusive', true);  if (Number(form.price) === 0) set('price', '150000'); }
                                                }}
                                                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                                                    active ? tier.cls : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                                                }`}
                                            >
                                                <Icon className="size-3.5" />{tier.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Harga */}
                            {(form.is_premium || form.is_exclusive) && (
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Harga <span className="text-red-500">*</span></label>
                                    <div className="flex items-center rounded-lg border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                        <span className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-r border-border/60 shrink-0">Rp</span>
                                        <input
                                            type="number" min={0} value={form.price}
                                            onChange={(e) => set('price', e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none text-foreground"
                                        />
                                    </div>
                                    {errors.price && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.price}</p>}
                                </div>
                            )}

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags</label>
                                <input
                                    value={form.tags}
                                    onChange={(e) => set('tags', e.target.value)}
                                    placeholder="romantis, floral, pastel (pisahkan dengan koma)"
                                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                />
                                <p className="mt-1 text-[10px] text-muted-foreground">Pisahkan setiap tag dengan koma</p>
                            </div>

                            {/* Status Aktif */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                                <button
                                    type="button"
                                    onClick={() => set('is_active', !form.is_active)}
                                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                                        form.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border/60 bg-background text-muted-foreground'
                                    }`}
                                >
                                    <span className="text-sm font-medium">{form.is_active ? 'Aktif — tampil di platform' : 'Nonaktif — tersembunyi'}</span>
                                    {form.is_active ? <ToggleRight className="size-5 text-emerald-600" /> : <ToggleLeft className="size-5" />}
                                </button>
                            </div>

                            {/* Thumbnail upload placeholder */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Thumbnail</label>
                                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10 py-6 cursor-pointer hover:bg-muted/20 transition-colors">
                                    <div className="text-center">
                                        <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-xs text-muted-foreground">Klik untuk upload thumbnail</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG, WebP — maks 2MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="w-52 shrink-0 border-l border-border/40 px-4 py-5 bg-muted/5 hidden sm:flex flex-col gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
                            <TemplateThumbnail tpl={previewTpl} size="lg" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-foreground truncate">{form.name || '—'}</p>
                                <p className="text-[11px] text-muted-foreground">{form.category} · {form.event_type}</p>
                                {(() => {
                                    const tm = tierMeta(previewTpl);
                                    const Icon = tm.icon;
                                    return (
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tm.cls}`}>
                                            <Icon className="size-2.5" />{tm.label}
                                        </span>
                                    );
                                })()}
                                {form.tags && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t) => (
                                            <span key={t} className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            Batal
                        </button>
                        <button type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                            {isEdit ? <Edit className="size-3.5" /> : <Plus className="size-3.5" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ template, onClose, onConfirm }: { template: TemplateData; onClose: () => void; onConfirm: () => void }) {
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
                            <h2 className="text-sm font-semibold text-foreground">Hapus Template</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-3 mb-4">
                        <TemplateThumbnail tpl={template} size="sm" />
                        <p className="mt-2 text-sm font-semibold text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.category} · {template.event_type} · {template.usage_count} penggunaan</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Yakin ingin menghapus template <strong className="text-foreground">"{template.name}"</strong>?
                        Template yang sudah dipakai pada undangan aktif tidak akan terpengaruh.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 pb-5">
                    <button type="button" onClick={onClose}
                        className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        Batal
                    </button>
                    <button type="button" onClick={onConfirm}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                        <Trash2 className="size-3.5" />Hapus Template
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Template Card (Grid) ──────────────────────────────────────────────────────

function TemplateCard({
    template,
    onEdit,
    onDelete,
    onToggle,
}: {
    template: TemplateData;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const tier = tierMeta(template);
    const TierIcon = tier.icon;

    return (
        <div className={`group relative rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md ${
            template.is_active ? 'border-border/60' : 'border-border/30 opacity-60'
        }`}>
            {/* Thumbnail */}
            <div className="relative">
                <TemplateThumbnail tpl={template} size="md" />
                {/* Tier badge */}
                <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${tier.cls}`}>
                    <TierIcon className="size-2.5" />{tier.label}
                </span>
                {/* Status badge */}
                <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted/80 text-muted-foreground'
                }`}>
                    {template.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        title="Preview"
                        className="flex size-8 items-center justify-center rounded-lg bg-white/90 text-foreground hover:bg-white transition-colors shadow"
                    >
                        <Eye className="size-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className="flex size-8 items-center justify-center rounded-lg bg-white/90 text-foreground hover:bg-white transition-colors shadow"
                    >
                        <Edit className="size-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Hapus"
                        className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
                <div>
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">{template.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{template.category} · {template.event_type}</p>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Image className="size-3" />
                        <span>{template.usage_count} dipakai</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${template.price === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                            {formatRp(template.price)}
                        </span>
                        <button
                            onClick={onToggle}
                            title={template.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className={`inline-flex items-center rounded-full p-1 transition-colors ${
                                template.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {template.is_active ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Template Row (List) ───────────────────────────────────────────────────────

function TemplateRow({
    template,
    onEdit,
    onDelete,
    onToggle,
}: {
    template: TemplateData;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const tier = tierMeta(template);
    const TierIcon = tier.icon;

    return (
        <tr className="group hover:bg-muted/20 transition-colors border-b border-border/20">
            {/* Template */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${template.color_primary}33, ${template.color_secondary})` }}>
                        <Palette className="size-5" style={{ color: template.color_primary }} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{template.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{template.slug}</p>
                    </div>
                </div>
            </td>
            {/* Kategori */}
            <td className="px-4 py-3">
                <div>
                    <p className="text-sm text-foreground">{template.category}</p>
                    <p className="text-[11px] text-muted-foreground">{template.event_type}</p>
                </div>
            </td>
            {/* Tier */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tier.cls}`}>
                    <TierIcon className="size-3" />{tier.label}
                </span>
            </td>
            {/* Harga */}
            <td className="px-4 py-3">
                <span className={`text-sm font-bold ${template.price === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                    {formatRp(template.price)}
                </span>
            </td>
            {/* Penggunaan */}
            <td className="px-4 py-3">
                <span className="text-sm text-foreground">{template.usage_count.toLocaleString('id-ID')}</span>
            </td>
            {/* Status */}
            <td className="px-4 py-3">
                <button onClick={onToggle}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80 ${
                        template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}>
                    {template.is_active
                        ? <><ToggleRight className="size-3.5" />Aktif</>
                        : <><ToggleLeft  className="size-3.5" />Nonaktif</>}
                </button>
            </td>
            {/* Aksi */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Preview">
                        <Eye className="size-3.5" />
                    </button>
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
    { title: 'Tema & Template', href: '/admin/themes' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminThemes() {
    const { themes: templates } = usePage<PageProps>().props;

    const [search, setSearch]       = useState('');
    const [filterCat, setFilterCat] = useState('Semua');
    const [filterEvt, setFilterEvt] = useState('Semua');
    const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium' | 'exclusive'>('all');
    const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
    const [editTarget, setEditTarget]     = useState<TemplateData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TemplateData | null>(null);
    const [showAdd, setShowAdd]           = useState(false);

    function handleAdd(data: Partial<TemplateData>) {
        router.post(route('admin.themes.store'), {
            name:            data.name,
            category:        data.category,
            event_type:      data.event_type,
            color_primary:   data.color_primary,
            color_secondary: data.color_secondary,
            is_active:       data.is_active,
            is_premium:      data.is_premium,
            is_exclusive:    data.is_exclusive,
            price:           data.price,
            tags:            data.tags,
        }, {
            preserveScroll: true,
            onSuccess: () => setShowAdd(false),
        });
    }

    function handleEdit(data: Partial<TemplateData>) {
        router.patch(route('admin.themes.update', { theme: editTarget!.id }), {
            name:            data.name,
            category:        data.category,
            event_type:      data.event_type,
            color_primary:   data.color_primary,
            color_secondary: data.color_secondary,
            is_active:       data.is_active,
            is_premium:      data.is_premium,
            is_exclusive:    data.is_exclusive,
            price:           data.price,
            tags:            data.tags,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function handleDelete() {
        router.delete(route('admin.themes.destroy', { theme: deleteTarget!.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function handleToggle(id: number) {
        router.patch(route('admin.themes.toggle', { theme: id }), {}, { preserveScroll: true });
    }

    // ── Filter & search ─────────────────────────────────────────────────────
    const filtered = templates.filter((t) => {
        if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
            !t.tags.some((tag) => tag.includes(search.toLowerCase()))) return false;
        if (filterCat !== 'Semua' && t.category !== filterCat) return false;
        if (filterEvt !== 'Semua' && t.event_type !== filterEvt) return false;
        if (filterTier === 'free'      && (t.is_premium || t.is_exclusive)) return false;
        if (filterTier === 'premium'   && (!t.is_premium || t.is_exclusive)) return false;
        if (filterTier === 'exclusive' && !t.is_exclusive) return false;
        return true;
    });

    // ── Stats ────────────────────────────────────────────────────────────────
    const totalActive    = templates.filter((t) => t.is_active).length;
    const totalPremium   = templates.filter((t) => t.is_premium && !t.is_exclusive).length;
    const totalExclusive = templates.filter((t) => t.is_exclusive).length;
    const totalUsage     = templates.reduce((s, t) => s + t.usage_count, 0);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Tema & Template" />
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Tema & Template</h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola semua template undangan — tambah, edit, atur tier, dan pantau penggunaan.</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                    >
                        <Plus className="size-4" />Tambah Template
                    </button>
                </div>

                {/* Flash */}
                <FlashBanner />

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Template', value: String(templates.length),  sub: 'terdaftar',      icon: Layers, cls: 'text-primary'       },
                        { label: 'Template Aktif', value: String(totalActive),        sub: 'tampil publik',  icon: ToggleRight, cls: 'text-emerald-600' },
                        { label: 'Premium',        value: String(totalPremium),       sub: 'template berbayar', icon: Star, cls: 'text-primary'     },
                        { label: 'Total Dipakai',  value: totalUsage.toLocaleString('id-ID'), sub: 'kali digunakan', icon: Image, cls: 'text-muted-foreground' },
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

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau tag template…"
                            className="w-full rounded-xl border border-border/60 bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="size-4 text-muted-foreground shrink-0" />
                        <select
                            value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                            className="rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <select
                            value={filterEvt} onChange={(e) => setFilterEvt(e.target.value)}
                            className="rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        >
                            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        {/* Tier filter pills */}
                        <div className="flex rounded-xl border border-border/60 overflow-hidden bg-background">
                            {([
                                { value: 'all', label: 'Semua' },
                                { value: 'free', label: 'Gratis' },
                                { value: 'premium', label: 'Premium' },
                                { value: 'exclusive', label: 'Eksklusif' },
                            ] as { value: typeof filterTier; label: string }[]).map((f) => (
                                <button key={f.value} type="button"
                                    onClick={() => setFilterTier(f.value)}
                                    className={`px-3 py-2 text-xs font-medium transition-colors border-r last:border-r-0 border-border/40 ${
                                        filterTier === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {/* View toggle */}
                        <div className="flex rounded-xl border border-border/60 overflow-hidden bg-background">
                            <button type="button" onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
                                <Grid3X3 className="size-4" />
                            </button>
                            <button type="button" onClick={() => setViewMode('list')}
                                className={`p-2.5 border-l border-border/40 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari {templates.length} template
                    </p>
                    <div className="flex gap-1">
                        {[
                            { label: `${templates.filter((t) => !t.is_active).length} nonaktif`, cls: 'bg-muted/50 text-muted-foreground' },
                            { label: `${totalExclusive} eksklusif`,                               cls: 'bg-amber-50 text-amber-700' },
                        ].map((b) => (
                            <span key={b.label} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-border/60 py-20 text-center">
                        <Layers className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">Tidak ada template ditemukan</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Coba ubah filter atau tambah template baru</p>
                        <button onClick={() => setShowAdd(true)}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Plus className="size-4" />Tambah Template
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Add card */}
                        <button
                            onClick={() => setShowAdd(true)}
                            className="rounded-2xl border-2 border-dashed border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground hover:text-primary"
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl border-2 border-dashed border-current">
                                <Plus className="size-5" />
                            </div>
                            <span className="text-xs font-medium">Tambah Template</span>
                        </button>
                        {filtered.map((t) => (
                            <TemplateCard
                                key={t.id} template={t}
                                onEdit={() => setEditTarget(t)}
                                onDelete={() => setDeleteTarget(t)}
                                onToggle={() => handleToggle(t.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        {['Template', 'Kategori', 'Tier', 'Harga', 'Dipakai', 'Status', 'Aksi'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t) => (
                                        <TemplateRow
                                            key={t.id} template={t}
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
                    Template yang dinonaktifkan tidak akan tampil saat pengguna membuat undangan baru. Template aktif yang sudah dipakai tidak terpengaruh.
                </p>
            </div>

            {/* Modals */}
            {showAdd      && <TemplateFormModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
            {editTarget   && <TemplateFormModal template={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
            {deleteTarget && <DeleteConfirmModal template={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
        </AdminLayout>
    );
}
