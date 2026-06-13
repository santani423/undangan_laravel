import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Crown,
    Eye,
    Gem,
    ImageOff,
    Package,
    Search,
    Star,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
    { title: 'Buat Undangan', href: '/customer/invitations/create' },
    { title: 'Pilih Tema & Paket', href: '#' },
];

interface EventType {
    id: number;
    name: string;
    label: string;
}

interface Theme {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    preview_image_url: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
    price: number;
    tags: string[] | null;
    usage_count: number;
}

interface PackageFeature {
    id: number;
    feature_key: string;
    feature_type: string;
    feature_value: string;
}

interface PackageItem {
    id: number;
    name: string;
    label: string;
    description: string | null;
    price: string;
    currency: string;
    billing_period: string;
    duration_days: number | null;
    max_gallery_uploads: number | null;
    features: PackageFeature[];
}

interface Props {
    eventType: EventType;
    themes: Theme[];
    packages: PackageItem[];
}

function ThemeCard({
    theme,
    isSelected,
    onSelect,
    onPreview,
}: {
    theme: Theme;
    isSelected: boolean;
    onSelect: () => void;
    onPreview: () => void;
}) {
    return (
        <div
            className={`group relative flex flex-col rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-150 ${
                isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'border-border hover:border-primary/40 hover:shadow-sm'
            }`}
            onClick={onSelect}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                {theme.thumbnail_url ? (
                    <img
                        src={theme.thumbnail_url}
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        style={{
                            background: theme.color_primary
                                ? `linear-gradient(135deg, ${theme.color_primary}33, ${theme.color_secondary ?? theme.color_primary}55)`
                                : undefined,
                        }}
                    >
                        <ImageOff className="size-8 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/60">Preview tidak tersedia</span>
                    </div>
                )}

                {/* Color swatch */}
                {(theme.color_primary || theme.color_secondary) && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                        {theme.color_primary && (
                            <span
                                className="size-4 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: theme.color_primary }}
                            />
                        )}
                        {theme.color_secondary && (
                            <span
                                className="size-4 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: theme.color_secondary }}
                            />
                        )}
                    </div>
                )}

                {/* Badge premium / exclusive */}
                {theme.is_exclusive ? (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        <Gem className="size-2.5" /> Eksklusif
                    </span>
                ) : theme.is_premium ? (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        <Crown className="size-2.5" /> Premium
                    </span>
                ) : (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        Gratis
                    </span>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                    <div className="absolute top-2 right-2 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                        <Check className="size-3.5" />
                    </div>
                )}

                {/* Preview button on hover */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPreview();
                    }}
                    className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/60 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                >
                    <Eye className="size-3.5" />
                    Lihat Preview
                </button>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1 bg-card">
                <p className="font-semibold text-sm text-foreground leading-tight line-clamp-1">{theme.name}</p>
                {theme.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{theme.description}</p>
                )}
                {theme.tags && theme.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {theme.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PackageCard({
    pkg,
    isSelected,
    onSelect,
}: {
    pkg: PackageItem;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const price = parseFloat(pkg.price);
    const isFree = price === 0;

    const enabledFeatures = pkg.features.filter(
        (f) => f.feature_type === 'boolean' && f.feature_value === 'true',
    );
    const limitFeatures = pkg.features.filter((f) => f.feature_type === 'limit');

    return (
        <div
            className={`relative flex flex-col rounded-2xl border-2 cursor-pointer transition-all duration-150 overflow-hidden ${
                isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'border-border hover:border-primary/40 hover:shadow-sm'
            }`}
            onClick={onSelect}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow z-10">
                    <Check className="size-3.5" />
                </div>
            )}

            <div className="p-5 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isFree ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'
                    }`}>
                        {isFree ? <Package className="size-5" /> : <Star className="size-5" />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-foreground leading-tight">{pkg.label}</p>
                        {pkg.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pkg.description}</p>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div>
                    {isFree ? (
                        <p className="text-2xl font-bold text-emerald-600">Gratis</p>
                    ) : (
                        <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-bold text-foreground">
                                Rp {price.toLocaleString('id-ID')}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                /{pkg.billing_period === 'month' ? 'bulan' : 'tahun'}
                            </span>
                        </div>
                    )}
                    {pkg.duration_days && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Durasi {pkg.duration_days} hari
                        </p>
                    )}
                </div>

                {/* Features */}
                {(enabledFeatures.length > 0 || limitFeatures.length > 0) && (
                    <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
                        {limitFeatures.map((f) => (
                            <li key={f.id} className="flex items-center gap-2 text-xs text-foreground">
                                <Check className="size-3.5 shrink-0 text-primary" />
                                <span>
                                    {f.feature_key === 'max_invitations'
                                        ? `Maks. ${f.feature_value} undangan`
                                        : f.feature_key === 'max_guests'
                                        ? `Maks. ${f.feature_value} tamu`
                                        : `${f.feature_key}: ${f.feature_value}`}
                                </span>
                            </li>
                        ))}
                        {pkg.max_gallery_uploads && (
                            <li className="flex items-center gap-2 text-xs text-foreground">
                                <Check className="size-3.5 shrink-0 text-primary" />
                                <span>Maks. {pkg.max_gallery_uploads} foto galeri</span>
                            </li>
                        )}
                        {enabledFeatures.slice(0, 4).map((f) => (
                            <li key={f.id} className="flex items-center gap-2 text-xs text-foreground">
                                <Check className="size-3.5 shrink-0 text-primary" />
                                <span className="capitalize">
                                    {f.feature_key.replace(/_/g, ' ')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function SelectTheme({ eventType, themes, packages }: Props) {
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

    const filtered = themes.filter((t) => {
        const matchSearch =
            search === '' ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.tags ?? []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
        const matchFilter =
            filter === 'all' ||
            (filter === 'free' && !t.is_premium && !t.is_exclusive) ||
            (filter === 'premium' && (t.is_premium || t.is_exclusive));
        return matchSearch && matchFilter;
    });

    function handleNext() {
        if (!selectedTheme || !selectedPackage) return;
        router.visit(
            `/customer/invitations/create/detail?event_type_id=${eventType.id}&theme_id=${selectedTheme.id}&package_id=${selectedPackage.id}`,
        );
    }

    const canContinue = !!selectedTheme && !!selectedPackage;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Pilih Tema & Paket" />
            <div className="flex flex-col gap-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pilih Tema & Paket</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Tema untuk undangan <span className="font-medium text-foreground">{eventType.label}</span>.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            <Check className="size-3" />
                        </div>
                        Jenis Undangan
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            2
                        </div>
                        Tema & Paket
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="size-6 rounded-full border border-border flex items-center justify-center text-xs font-bold">
                            3
                        </div>
                        Detail Acara
                    </div>
                </div>

                {/* ── Section: Pilih Tema ── */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedTheme ? 'bg-primary text-primary-foreground' : 'border-2 border-primary text-primary'
                        }`}>
                            {selectedTheme ? <Check className="size-3.5" /> : '1'}
                        </div>
                        <h2 className="font-semibold text-foreground">Pilih Tema</h2>
                        {selectedTheme && (
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                {selectedTheme.name}
                            </span>
                        )}
                    </div>

                    {/* Filter & Search */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari tema..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'free', 'premium'] as const).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFilter(f)}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                        filter === f
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                    }`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'free' ? 'Gratis' : 'Premium'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Grid */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <ImageOff className="size-10 text-muted-foreground/40" />
                            <p className="text-muted-foreground text-sm">Tidak ada tema yang ditemukan.</p>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="text-primary text-sm hover:underline"
                                >
                                    Hapus pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {filtered.map((theme) => (
                                <ThemeCard
                                    key={theme.id}
                                    theme={theme}
                                    isSelected={selectedTheme?.id === theme.id}
                                    onSelect={() => setSelectedTheme(theme)}
                                    onPreview={() => setPreviewTheme(theme)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Section: Pilih Paket ── */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedPackage ? 'bg-primary text-primary-foreground' : 'border-2 border-primary text-primary'
                        }`}>
                            {selectedPackage ? <Check className="size-3.5" /> : '2'}
                        </div>
                        <h2 className="font-semibold text-foreground">Pilih Paket</h2>
                        {selectedPackage && (
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                {selectedPackage.label}
                            </span>
                        )}
                    </div>

                    {packages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                            <Package className="size-10 text-muted-foreground/40" />
                            <p className="text-muted-foreground text-sm">Belum ada paket tersedia.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {packages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    isSelected={selectedPackage?.id === pkg.id}
                                    onSelect={() => setSelectedPackage(pkg)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <button
                        type="button"
                        onClick={() => router.visit('/customer/invitations/create')}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                        Kembali
                    </button>
                    <div className="flex items-center gap-3">
                        {(!selectedTheme || !selectedPackage) && (
                            <p className="text-xs text-muted-foreground">
                                {!selectedTheme && !selectedPackage
                                    ? 'Pilih tema dan paket terlebih dahulu'
                                    : !selectedTheme
                                    ? 'Pilih tema terlebih dahulu'
                                    : 'Pilih paket terlebih dahulu'}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canContinue}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Lanjutkan
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewTheme && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setPreviewTheme(null)}
                >
                    <div
                        className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aspect-[3/4] bg-muted rounded-t-2xl overflow-hidden">
                            {previewTheme.preview_image_url ? (
                                <img
                                    src={previewTheme.preview_image_url}
                                    alt={previewTheme.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : previewTheme.thumbnail_url ? (
                                <img
                                    src={previewTheme.thumbnail_url}
                                    alt={previewTheme.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{
                                        background: previewTheme.color_primary
                                            ? `linear-gradient(135deg, ${previewTheme.color_primary}44, ${previewTheme.color_secondary ?? previewTheme.color_primary}66)`
                                            : undefined,
                                    }}
                                >
                                    <ImageOff className="size-12 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{previewTheme.name}</h3>
                                    {previewTheme.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{previewTheme.description}</p>
                                    )}
                                </div>
                                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPreviewTheme(null)}
                                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTheme(previewTheme);
                                        setPreviewTheme(null);
                                    }}
                                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    Pilih Tema Ini
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
