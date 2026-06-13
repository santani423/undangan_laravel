import ImageCropUpload from '@/components/image-crop-upload';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Crown,
    Gem,
    Heart,
    Image,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
    { title: 'Buat Undangan', href: '/customer/invitations/create' },
    { title: 'Detail Acara', href: '#' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventTypeField {
    id: number;
    field_key: string;
    field_label: string;
    field_type: string;
    is_required: boolean;
    placeholder: string | null;
    help_text: string | null;
    options: string[] | null;
    display_order: number;
}

interface EventType {
    id: number;
    name: string;
    label: string;
    fields: EventTypeField[];
}

interface Theme {
    id: number;
    name: string;
    slug: string;
    thumbnail_url: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
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
    price: string;
    currency: string;
    billing_period: string;
    max_gallery_uploads: number | null;
    features: PackageFeature[];
}

interface Props {
    eventType: EventType;
    theme: Theme;
    package: PackageItem;
}

// ─── Tab definitions per event type ──────────────────────────────────────────

type TabKey = 'couple' | 'acara' | 'gallery' | 'love_story' | 'info' | 'host';

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
}

const TAB_DEFINITIONS: Record<TabKey, TabDef> = {
    couple:     { key: 'couple',     label: 'Couple',     icon: <Heart className="size-4" /> },
    acara:      { key: 'acara',      label: 'Acara',      icon: <CalendarDays className="size-4" /> },
    gallery:    { key: 'gallery',    label: 'Gallery',    icon: <Image className="size-4" /> },
    love_story: { key: 'love_story', label: 'Love Story', icon: <BookOpen className="size-4" /> },
    info:       { key: 'info',       label: 'Info Acara', icon: <CalendarDays className="size-4" /> },
    host:       { key: 'host',       label: 'Penyelenggara', icon: <Users className="size-4" /> },
};

/** Tab yang ditampilkan untuk setiap event type */
const EVENT_TYPE_TABS: Record<string, TabKey[]> = {
    wedding:      ['couple', 'acara', 'gallery', 'love_story'],
    birthday:     ['info', 'gallery'],
    khitanan:     ['info', 'gallery'],
    aqiqah:       ['info', 'gallery'],
    gender_reveal:['info', 'gallery'],
    syukuran:     ['host', 'info', 'gallery'],
};

const DEFAULT_TABS: TabKey[] = ['info', 'gallery'];

// ─── Field grouping per event type + tab ─────────────────────────────────────

/** Kunci field yang masuk ke tab tertentu untuk wedding */
const WEDDING_TAB_FIELDS: Record<string, string[]> = {
    couple: [
        'groom_name', 'groom_nickname', 'groom_photo', 'groom_father', 'groom_mother', 'groom_instagram',
        'bride_name', 'bride_nickname', 'bride_photo', 'bride_father', 'bride_mother', 'bride_instagram',
        'couple_photo', 'opening_quote',
    ],
    acara: [],      // diisi dari event_type_fields bertipe date/time/location — lihat renderAcaraTab
    gallery: [],    // upload galeri
    love_story: [], // love story entries
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryBar({ theme, pkg }: { theme: Theme; pkg: PackageItem }) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 shrink-0">
                {theme.thumbnail_url ? (
                    <img
                        src={theme.thumbnail_url}
                        alt={theme.name}
                        className="size-10 rounded-lg object-cover border border-border"
                    />
                ) : (
                    <div
                        className="size-10 rounded-lg border border-border"
                        style={{
                            background: theme.color_primary
                                ? `linear-gradient(135deg, ${theme.color_primary}55, ${theme.color_secondary ?? theme.color_primary}77)`
                                : '#e5e7eb',
                        }}
                    />
                )}
                <div>
                    <p className="font-medium text-foreground leading-tight">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {theme.is_exclusive ? (
                            <span className="inline-flex items-center gap-1"><Gem className="size-3" /> Eksklusif</span>
                        ) : theme.is_premium ? (
                            <span className="inline-flex items-center gap-1"><Crown className="size-3" /> Premium</span>
                        ) : 'Gratis'}
                    </p>
                </div>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
                <p className="font-medium text-foreground leading-tight">{pkg.label}</p>
                <p className="text-xs text-muted-foreground">
                    {parseFloat(pkg.price) === 0
                        ? 'Gratis'
                        : `Rp ${parseFloat(pkg.price).toLocaleString('id-ID')}/${pkg.billing_period === 'month' ? 'bln' : 'thn'}`}
                </p>
            </div>
        </div>
    );
}

function FieldInput({ field, value, onChange }: {
    field: EventTypeField;
    value: string;
    onChange: (val: string) => void;
}) {
    const base = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    if (field.field_type === 'textarea') {
        return (
            <textarea
                rows={3}
                placeholder={field.placeholder ?? ''}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${base} resize-none`}
            />
        );
    }

    if (field.field_type === 'select' && field.options) {
        return (
            <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
                <option value="">— Pilih —</option>
                {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        );
    }

    if (field.field_type === 'file') {
        return (
            <ImageCropUpload
                label={field.field_label}
                required={field.is_required}
                helpText={field.help_text ?? undefined}
                aspectRatio={field.field_key === 'couple_photo' ? 4 / 3 : 1}
                value={value || null}
                onChange={(dataUrl) => onChange(dataUrl ?? '')}
            />
        );
    }

    return (
        <input
            type={field.field_type === 'date' ? 'date' : 'text'}
            placeholder={field.placeholder ?? ''}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={base}
        />
    );
}

function FieldGroup({ fields, values, onChange }: {
    fields: EventTypeField[];
    values: Record<string, string>;
    onChange: (key: string, val: string) => void;
}) {
    if (fields.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-6 text-center">
                Tidak ada field untuk tab ini.
            </p>
        );
    }
    return (
        <div className="flex flex-col gap-5">
            {fields.map((f) => (
                <div key={f.id} className="flex flex-col gap-1.5">
                    {/* ImageCropUpload renders its own label & helpText */}
                    {f.field_type !== 'file' && (
                        <label className="text-sm font-medium text-foreground">
                            {f.field_label}
                            {f.is_required && <span className="ml-1 text-destructive">*</span>}
                        </label>
                    )}
                    <FieldInput
                        field={f}
                        value={values[f.field_key] ?? ''}
                        onChange={(val) => onChange(f.field_key, val)}
                    />
                    {f.field_type !== 'file' && f.help_text && (
                        <p className="text-xs text-muted-foreground">{f.help_text}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Tab content renderers ────────────────────────────────────────────────────

function CoupleTab({ fields, values, onChange }: {
    fields: EventTypeField[];
    values: Record<string, string>;
    onChange: (key: string, val: string) => void;
}) {
    const coupleFields = fields.filter((f) => WEDDING_TAB_FIELDS.couple.includes(f.field_key));
    const groomFields = coupleFields.filter((f) => f.field_key.startsWith('groom'));
    const brideFields = coupleFields.filter((f) => f.field_key.startsWith('bride'));
    const sharedFields = coupleFields.filter((f) => !f.field_key.startsWith('groom') && !f.field_key.startsWith('bride'));

    return (
        <div className="flex flex-col gap-8">
            {/* Pengantin Pria */}
            <section>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">♂</span>
                    Pengantin Pria
                </h3>
                <FieldGroup fields={groomFields} values={values} onChange={onChange} />
            </section>

            <div className="border-t border-border" />

            {/* Pengantin Wanita */}
            <section>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="size-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">♀</span>
                    Pengantin Wanita
                </h3>
                <FieldGroup fields={brideFields} values={values} onChange={onChange} />
            </section>

            {sharedFields.length > 0 && (
                <>
                    <div className="border-t border-border" />
                    <section>
                        <h3 className="font-semibold text-foreground mb-4">Lainnya</h3>
                        <FieldGroup fields={sharedFields} values={values} onChange={onChange} />
                    </section>
                </>
            )}
        </div>
    );
}

interface AcaraEvent {
    id: number;
    name: string;
    date: string;
    time_start: string;
    time_end: string;
    location_name: string;
    location_address: string;
    maps_url: string;
}

function AcaraTab({ events, setEvents }: {
    events: AcaraEvent[];
    setEvents: React.Dispatch<React.SetStateAction<AcaraEvent[]>>;
}) {
    function addEvent() {
        setEvents((prev) => [
            ...prev,
            { id: Date.now(), name: '', date: '', time_start: '', time_end: '', location_name: '', location_address: '', maps_url: '' },
        ]);
    }

    function updateEvent(id: number, key: keyof AcaraEvent, val: string) {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: val } : e)));
    }

    function removeEvent(id: number) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    }

    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    return (
        <div className="flex flex-col gap-6">
            {events.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Belum ada jadwal acara. Klik tombol di bawah untuk menambahkan.
                </p>
            )}

            {events.map((ev, idx) => (
                <div key={ev.id} className="rounded-2xl border border-border p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">Acara {idx + 1}</p>
                        <button
                            type="button"
                            onClick={() => removeEvent(ev.id)}
                            className="text-xs text-destructive hover:underline"
                        >
                            Hapus
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">Nama Acara <span className="text-destructive">*</span></label>
                            <input type="text" placeholder="cth. Akad Nikah" value={ev.name} onChange={(e) => updateEvent(ev.id, 'name', e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Tanggal <span className="text-destructive">*</span></label>
                            <input type="date" value={ev.date} onChange={(e) => updateEvent(ev.id, 'date', e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-sm font-medium text-foreground">Mulai</label>
                                <input type="time" value={ev.time_start} onChange={(e) => updateEvent(ev.id, 'time_start', e.target.value)} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-sm font-medium text-foreground">Selesai</label>
                                <input type="time" value={ev.time_end} onChange={(e) => updateEvent(ev.id, 'time_end', e.target.value)} className={inputCls} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Nama Lokasi <span className="text-destructive">*</span></label>
                            <input type="text" placeholder="cth. Masjid Al-Ikhlas" value={ev.location_name} onChange={(e) => updateEvent(ev.id, 'location_name', e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Link Maps</label>
                            <input type="url" placeholder="https://maps.google.com/..." value={ev.maps_url} onChange={(e) => updateEvent(ev.id, 'maps_url', e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">Alamat Lengkap</label>
                            <textarea rows={2} placeholder="Jl. ..." value={ev.location_address} onChange={(e) => updateEvent(ev.id, 'location_address', e.target.value)} className={`${inputCls} resize-none`} />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addEvent}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
                + Tambah Jadwal Acara
            </button>
        </div>
    );
}

interface GalleryItem {
    id: number;
    file: File | null;
    preview: string;
    caption: string;
}

function GalleryTab({ items, setItems, maxUploads }: {
    items: GalleryItem[];
    setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
    maxUploads: number | null;
}) {
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const remaining = maxUploads ? maxUploads - items.length : Infinity;
        files.slice(0, remaining).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setItems((prev) => [
                    ...prev,
                    { id: Date.now() + Math.random(), file, preview: ev.target?.result as string, caption: '' },
                ]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }

    function removeItem(id: number) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    function updateCaption(id: number, val: string) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, caption: val } : i)));
    }

    const atLimit = maxUploads !== null && items.length >= maxUploads;

    return (
        <div className="flex flex-col gap-5">
            {maxUploads && (
                <p className="text-xs text-muted-foreground">
                    Paket Anda memungkinkan upload maksimal <span className="font-medium text-foreground">{maxUploads} foto</span>.
                    {' '}({items.length}/{maxUploads} digunakan)
                </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border">
                        <img src={item.preview} alt="" className="w-full aspect-square object-cover" />
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                        <input
                            type="text"
                            placeholder="Caption..."
                            value={item.caption}
                            onChange={(e) => updateCaption(item.id, e.target.value)}
                            className="absolute inset-x-0 bottom-0 bg-black/50 text-white placeholder:text-white/60 text-xs px-2 py-1 outline-none"
                        />
                    </div>
                ))}

                {!atLimit && (
                    <label className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground">
                        <span className="text-2xl leading-none">+</span>
                        <span className="text-xs">Tambah Foto</span>
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
                    </label>
                )}
            </div>
        </div>
    );
}

interface LoveStoryEntry {
    id: number;
    year: string;
    title: string;
    story: string;
    photo: string;
}

function LoveStoryTab({ entries, setEntries }: {
    entries: LoveStoryEntry[];
    setEntries: React.Dispatch<React.SetStateAction<LoveStoryEntry[]>>;
}) {
    function addEntry() {
        setEntries((prev) => [...prev, { id: Date.now(), year: '', title: '', story: '', photo: '' }]);
    }

    function updateEntry(id: number, key: keyof LoveStoryEntry, val: string) {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: val } : e)));
    }

    function removeEntry(id: number) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    return (
        <div className="flex flex-col gap-6">
            {entries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Belum ada cerita. Klik tombol di bawah untuk menambahkan.
                </p>
            )}

            <div className="relative">
                {entries.length > 0 && (
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                )}
                <div className="flex flex-col gap-6">
                    {entries.map((entry, idx) => (
                        <div key={entry.id} className="relative pl-10">
                            <div className="absolute left-0 size-8 rounded-full bg-primary/10 text-primary border-2 border-primary flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                            </div>
                            <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm text-foreground">Momen #{idx + 1}</p>
                                    <button type="button" onClick={() => removeEntry(entry.id)} className="text-xs text-destructive hover:underline">Hapus</button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-foreground">Tahun / Periode</label>
                                        <input type="text" placeholder="cth. 2020" value={entry.year} onChange={(e) => updateEntry(entry.id, 'year', e.target.value)} className={inputCls} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-foreground">Judul Momen</label>
                                        <input type="text" placeholder="cth. Pertama Bertemu" value={entry.title} onChange={(e) => updateEntry(entry.id, 'title', e.target.value)} className={inputCls} />
                                    </div>
                                    <div className="flex flex-col gap-1.5 col-span-2">
                                        <label className="text-xs font-medium text-foreground">Cerita</label>
                                        <textarea rows={3} placeholder="Ceritakan momen ini..." value={entry.story} onChange={(e) => updateEntry(entry.id, 'story', e.target.value)} className={`${inputCls} resize-none`} />
                                    </div>
                                    <div className="flex flex-col gap-1.5 col-span-2">
                                        <label className="text-xs font-medium text-foreground">Foto (opsional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateEntry(entry.id, 'photo', e.target.files?.[0]?.name ?? '')}
                                            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={addEntry}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
                + Tambah Momen
            </button>
        </div>
    );
}

/** Tab generik — tampilkan semua field dari EventTypeFields yang tidak tercakup tab lain */
function GenericFieldTab({ fields, values, onChange }: {
    fields: EventTypeField[];
    values: Record<string, string>;
    onChange: (key: string, val: string) => void;
}) {
    return <FieldGroup fields={fields} values={values} onChange={onChange} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateDetail({ eventType, theme, package: pkg }: Props) {
    const tabKeys: TabKey[] = EVENT_TYPE_TABS[eventType.name] ?? DEFAULT_TABS;
    const [activeTab, setActiveTab] = useState<TabKey>(tabKeys[0]);

    const currentTabIndex = tabKeys.indexOf(activeTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === tabKeys.length - 1;

    function goToPrevTab() {
        if (!isFirstTab) setActiveTab(tabKeys[currentTabIndex - 1]);
    }

    function goToNextTab() {
        if (!isLastTab) setActiveTab(tabKeys[currentTabIndex + 1]);
    }

    // field values for dynamic fields
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

    // acara events (tab Acara)
    const [acaraEvents, setAcaraEvents] = useState<AcaraEvent[]>([]);

    // gallery
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

    // love story
    const [loveStoryEntries, setLoveStoryEntries] = useState<LoveStoryEntry[]>([]);

    function handleFieldChange(key: string, val: string) {
        setFieldValues((prev) => ({ ...prev, [key]: val }));
    }

    function handleSubmit() {
        // TODO: submit ke backend
        console.log({ fieldValues, acaraEvents, galleryItems, loveStoryEntries });
    }

    function renderTabContent() {
        switch (activeTab) {
            case 'couple':
                return (
                    <CoupleTab
                        fields={eventType.fields}
                        values={fieldValues}
                        onChange={handleFieldChange}
                    />
                );
            case 'acara':
                return <AcaraTab events={acaraEvents} setEvents={setAcaraEvents} />;
            case 'gallery':
                return (
                    <GalleryTab
                        items={galleryItems}
                        setItems={setGalleryItems}
                        maxUploads={pkg.max_gallery_uploads}
                    />
                );
            case 'love_story':
                return <LoveStoryTab entries={loveStoryEntries} setEntries={setLoveStoryEntries} />;
            case 'info':
                // Info Acara — gunakan field dari event type (non-wedding)
                return (
                    <GenericFieldTab
                        fields={eventType.fields}
                        values={fieldValues}
                        onChange={handleFieldChange}
                    />
                );
            case 'host':
                return (
                    <GenericFieldTab
                        fields={eventType.fields.filter((f) =>
                            ['host_name', 'host_photo', 'occasion', 'opening_message'].includes(f.field_key),
                        )}
                        values={fieldValues}
                        onChange={handleFieldChange}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Acara" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Detail Acara</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Lengkapi informasi untuk undangan <span className="font-medium text-foreground">{eventType.label}</span>.
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
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            <Check className="size-3" />
                        </div>
                        Tema & Paket
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            3
                        </div>
                        Detail Acara
                    </div>
                </div>

                {/* Summary: tema + paket terpilih */}
                <SummaryBar theme={theme} pkg={pkg} />

                {/* Tab nav */}
                <div className="flex gap-1 border-b border-border overflow-x-auto">
                    {tabKeys.map((key) => {
                        const tab = TAB_DEFINITIONS[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                                    activeTab === key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="min-h-[300px]">
                    {renderTabContent()}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    {isFirstTab ? (
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                            Kembali
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={goToPrevTab}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                            {TAB_DEFINITIONS[tabKeys[currentTabIndex - 1]].label}
                        </button>
                    )}

                    {isLastTab ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Simpan & Buat Undangan
                            <ChevronRight className="size-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={goToNextTab}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            {TAB_DEFINITIONS[tabKeys[currentTabIndex + 1]].label}
                            <ChevronRight className="size-4" />
                        </button>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
