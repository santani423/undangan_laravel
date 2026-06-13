import ImageCropUpload, { compressImage } from '@/components/image-crop-upload';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
    Link2,
    Loader2,
    MapPin,
    Navigation,
    Save,
    Search,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

interface PackageItem {
    id: number;
    name: string;
    label: string;
    price: string;
    currency: string;
    billing_period: string;
    max_gallery_uploads: number | null;
}

interface InvitationMeta {
    id: number;
    slug: string;
    title: string;
    status: 'draft' | 'active' | 'expired' | 'archived';
}

interface GalleryItemData {
    dbId?: number;
    preview: string;
    caption: string;
}

interface LoveStoryData {
    dbId?: number;
    year: string;
    title: string;
    story: string;
    photo: string;
}

interface AcaraEventData {
    id?: number;
    name: string;
    date: string;
    time_start: string;
    time_end: string;
    location_name: string;
    location_address: string;
    maps_embed: string;
    maps_url: string;
    maps_lat: string;
    maps_lng: string;
    maps_full_address: string;
}

interface Props {
    invitation:   InvitationMeta;
    eventType:    EventType;
    theme:        Theme;
    package:      PackageItem;
    fieldValues:  Record<string, string>;
    acaraEvents:  AcaraEventData[];
    galleryItems: GalleryItemData[];
    loveStory:    LoveStoryData[];
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'couple' | 'acara' | 'gallery' | 'love_story' | 'info' | 'host';

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
}

const TAB_DEFINITIONS: Record<TabKey, TabDef> = {
    couple:     { key: 'couple',     label: 'Couple',        icon: <Heart className="size-4" /> },
    acara:      { key: 'acara',      label: 'Acara',         icon: <CalendarDays className="size-4" /> },
    gallery:    { key: 'gallery',    label: 'Gallery',       icon: <Image className="size-4" /> },
    love_story: { key: 'love_story', label: 'Love Story',    icon: <BookOpen className="size-4" /> },
    info:       { key: 'info',       label: 'Info Acara',    icon: <CalendarDays className="size-4" /> },
    host:       { key: 'host',       label: 'Penyelenggara', icon: <Users className="size-4" /> },
};

const EVENT_TYPE_TABS: Record<string, TabKey[]> = {
    wedding:       ['couple', 'acara', 'gallery', 'love_story'],
    birthday:      ['info', 'gallery'],
    khitanan:      ['info', 'gallery'],
    aqiqah:        ['info', 'gallery'],
    gender_reveal: ['info', 'gallery'],
    syukuran:      ['host', 'info', 'gallery'],
};

const DEFAULT_TABS: TabKey[] = ['info', 'gallery'];

const WEDDING_TAB_FIELDS: Record<string, string[]> = {
    couple: [
        'groom_name', 'groom_nickname', 'groom_photo', 'groom_father', 'groom_mother', 'groom_instagram',
        'bride_name', 'bride_nickname', 'bride_photo', 'bride_father', 'bride_mother', 'bride_instagram',
        'couple_photo', 'opening_quote',
    ],
    acara: [],
    gallery: [],
    love_story: [],
};

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_OPTS = [
    { value: 'draft',    label: 'Draft',       desc: 'Undangan belum dipublikasikan' },
    { value: 'active',   label: 'Aktif',       desc: 'Undangan dapat diakses tamu' },
    { value: 'archived', label: 'Diarsipkan',  desc: 'Undangan tidak aktif' },
] as const;

const STATUS_COLOR: Record<string, string> = {
    draft:    'bg-muted text-muted-foreground',
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
    expired:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

// ─── Location Picker ──────────────────────────────────────────────────────────

interface LocationResult {
    embedUrl: string;
    mapsUrl: string;
    lat: string;
    lng: string;
    address: string;
}

interface NominatimResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
}

function loadLeafletScript(cb: () => void) {
    if ((window as any).L) { cb(); return; }
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
    if (document.getElementById('leaflet-js')) {
        const check = setInterval(() => { if ((window as any).L) { clearInterval(check); cb(); } }, 100);
        return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = cb;
    document.head.appendChild(script);
}

function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    return null;
}

function LocationPickerModal({ open, onClose, onConfirm }: {
    open: boolean; onClose: () => void; onConfirm: (r: LocationResult) => void;
}) {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState('');
    const [addressLoading, setAddressLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [linkInput, setLinkInput] = useState('');
    const [linkMsg, setLinkMsg] = useState('');
    const [linkIsError, setLinkIsError] = useState(false);
    const mapDivRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const externalMoveRef = useRef(false);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        loadLeafletScript(() => {
            if (cancelled || !mapDivRef.current || leafletMapRef.current) return;
            const L = (window as any).L;
            const map = L.map(mapDivRef.current, { zoomControl: true }).setView([-2.5, 118], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);
            map.on('click', (e: any) => {
                const lat = parseFloat(e.latlng.lat.toFixed(6));
                const lng = parseFloat(e.latlng.lng.toFixed(6));
                externalMoveRef.current = false;
                setCoords({ lat, lng });
            });
            leafletMapRef.current = map;
        });
        return () => { cancelled = true; };
    }, [open]);

    useEffect(() => {
        if (!open) { leafletMapRef.current?.remove(); leafletMapRef.current = null; markerRef.current = null; }
    }, [open]);

    useEffect(() => {
        if (!leafletMapRef.current || !coords) return;
        const L = (window as any).L;
        if (markerRef.current) {
            markerRef.current.setLatLng([coords.lat, coords.lng]);
        } else {
            const m = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(leafletMapRef.current);
            m.on('dragend', (e: any) => {
                const pos = e.target.getLatLng();
                externalMoveRef.current = false;
                setCoords({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) });
            });
            markerRef.current = m;
        }
        if (externalMoveRef.current) { leafletMapRef.current.setView([coords.lat, coords.lng], 15); externalMoveRef.current = false; }
    }, [coords]);

    useEffect(() => {
        if (!coords) return;
        setAddressLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`, { headers: { 'Accept-Language': 'id' } });
                const data = await res.json();
                setAddress(data.display_name ?? '');
            } catch { setAddress(''); } finally { setAddressLoading(false); }
        }, 700);
        return () => clearTimeout(timer);
    }, [coords]);

    async function handleSearch() {
        if (!searchQuery.trim()) return;
        setSearchLoading(true); setShowResults(true); setSearchResults([]);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`, { headers: { 'Accept-Language': 'id' } });
            setSearchResults(await res.json());
        } catch { setSearchResults([]); } finally { setSearchLoading(false); }
    }

    function selectSearchResult(r: NominatimResult) {
        externalMoveRef.current = true;
        setCoords({ lat: parseFloat(parseFloat(r.lat).toFixed(6)), lng: parseFloat(parseFloat(r.lon).toFixed(6)) });
        setSearchQuery(r.display_name.split(',')[0]); setShowResults(false);
    }

    function handleCurrentLocation() {
        if (!navigator.geolocation) { setGeoError('Geolocation tidak didukung.'); return; }
        setGeoLoading(true); setGeoError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => { externalMoveRef.current = true; setCoords({ lat: parseFloat(pos.coords.latitude.toFixed(6)), lng: parseFloat(pos.coords.longitude.toFixed(6)) }); setGeoLoading(false); },
            (err) => { setGeoError('Gagal: ' + err.message); setGeoLoading(false); },
        );
    }

    function handleLinkProcess() {
        setLinkMsg(''); setLinkIsError(false);
        const url = linkInput.trim();
        if (!url) return;
        if (url.includes('maps.app.goo.gl')) { setLinkMsg('Link pendek terdeteksi. Gunakan kolom pencarian.'); setLinkIsError(true); return; }
        const parsed = parseGoogleMapsUrl(url);
        if (parsed) { externalMoveRef.current = true; setCoords({ lat: parsed.lat, lng: parsed.lng }); setLinkMsg('Koordinat berhasil diekstrak.'); }
        else { setLinkMsg('Koordinat tidak ditemukan. Gunakan link Google Maps lengkap.'); setLinkIsError(true); }
    }

    function handleConfirm() {
        if (!coords) return;
        onConfirm({ embedUrl: `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&output=embed`, mapsUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}`, lat: String(coords.lat), lng: String(coords.lng), address });
        onClose();
    }

    if (!open) return null;
    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-background rounded-2xl border border-border shadow-xl flex flex-col max-h-[92vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><MapPin className="size-4" /></div>
                        <div><h3 className="font-semibold text-foreground text-sm">Pilih Lokasi</h3><p className="text-xs text-muted-foreground">Cari, klik peta, atau gunakan lokasi saat ini</p></div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground"><X className="size-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="px-5 pt-5 pb-3 flex flex-col gap-3">
                        <div className="relative">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value) setShowResults(false); }} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Cari nama tempat..." className={`${inputCls} pl-9`} />
                                </div>
                                <button type="button" onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()} className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center gap-1.5">
                                    {searchLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                    <span className="hidden sm:inline">Cari</span>
                                </button>
                            </div>
                            {showResults && (searchLoading || searchResults.length > 0) && (
                                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                                    {searchLoading && <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Mencari...</div>}
                                    {!searchLoading && searchResults.map((r) => (
                                        <button key={r.place_id} type="button" onClick={() => selectSearchResult(r)} className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0">
                                            <p className="font-medium line-clamp-1">{r.display_name.split(',')[0]}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.display_name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={handleCurrentLocation} disabled={geoLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted hover:border-primary/40 disabled:opacity-60 transition-colors w-full sm:w-auto">
                            {geoLoading ? <><Loader2 className="size-4 animate-spin text-primary" /> Mengambil lokasi...</> : <><Navigation className="size-4 text-primary" /> Gunakan Lokasi Saat Ini</>}
                        </button>
                        {geoError && <p className="text-xs text-destructive">{geoError}</p>}
                    </div>
                    <div className="px-5 pb-3">
                        <div ref={mapDivRef} className="w-full rounded-2xl overflow-hidden border border-border" style={{ height: 300 }} />
                        <p className="text-xs text-muted-foreground mt-2 text-center">Klik peta untuk memilih titik atau geser marker.</p>
                    </div>
                    <div className="px-5 pb-3">
                        <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2"><Link2 className="size-4 text-primary shrink-0" /><span className="text-sm font-medium">Input Link Google Maps</span></div>
                            <div className="flex gap-2">
                                <input type="text" value={linkInput} onChange={(e) => { setLinkInput(e.target.value); setLinkMsg(''); }} onKeyDown={(e) => e.key === 'Enter' && handleLinkProcess()} placeholder="Tempel link Google Maps..." className={inputCls} />
                                <button type="button" onClick={handleLinkProcess} disabled={!linkInput.trim()} className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60 transition-colors">Proses</button>
                            </div>
                            {linkMsg && <p className={`text-xs ${linkIsError ? 'text-amber-600' : 'text-emerald-600'}`}>{linkMsg}</p>}
                        </div>
                    </div>
                    <div className="px-5 pb-5">
                        <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${coords ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40'}`}>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lokasi Terpilih</p>
                            {coords ? (
                                <>
                                    <div className="flex items-start gap-2"><MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">{addressLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Mengambil alamat...</div> : <p className="text-sm text-foreground">{address || 'Alamat tidak tersedia'}</p>}</div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1 border-t border-border/50 font-mono text-xs text-muted-foreground">
                                        <span>Lat: <span className="text-foreground font-semibold">{coords.lat}</span></span>
                                        <span>Lng: <span className="text-foreground font-semibold">{coords.lng}</span></span>
                                    </div>
                                </>
                            ) : <p className="text-sm text-muted-foreground">Belum ada lokasi dipilih.</p>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border shrink-0">
                    <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
                    <button type="button" onClick={handleConfirm} disabled={!coords || addressLoading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        <Check className="size-4" /> Konfirmasi Lokasi
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SummaryBar ───────────────────────────────────────────────────────────────

function SummaryBar({ theme, pkg }: { theme: Theme; pkg: PackageItem }) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 shrink-0">
                {theme.thumbnail_url ? (
                    <img src={theme.thumbnail_url} alt={theme.name} className="size-10 rounded-lg object-cover border border-border" />
                ) : (
                    <div className="size-10 rounded-lg border border-border" style={{ background: theme.color_primary ? `linear-gradient(135deg, ${theme.color_primary}55, ${theme.color_secondary ?? theme.color_primary}77)` : '#e5e7eb' }} />
                )}
                <div>
                    <p className="font-medium text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {theme.is_exclusive ? <span className="inline-flex items-center gap-1"><Gem className="size-3" /> Eksklusif</span>
                            : theme.is_premium ? <span className="inline-flex items-center gap-1"><Crown className="size-3" /> Premium</span>
                            : 'Gratis'}
                    </p>
                </div>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
                <p className="font-medium text-foreground">{pkg.label}</p>
                <p className="text-xs text-muted-foreground">
                    {parseFloat(pkg.price) === 0 ? 'Gratis' : `Rp ${parseFloat(pkg.price).toLocaleString('id-ID')}/${pkg.billing_period === 'month' ? 'bln' : 'thn'}`}
                </p>
            </div>
        </div>
    );
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

function FieldInput({ field, value, onChange }: { field: EventTypeField; value: string; onChange: (val: string) => void }) {
    const base = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    if (field.field_type === 'textarea') {
        return <textarea rows={3} placeholder={field.placeholder ?? ''} value={value} onChange={(e) => onChange(e.target.value)} className={`${base} resize-none`} />;
    }
    if (field.field_type === 'select' && field.options) {
        return (
            <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
                <option value="">— Pilih —</option>
                {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
    return <input type={field.field_type === 'date' ? 'date' : 'text'} placeholder={field.placeholder ?? ''} value={value} onChange={(e) => onChange(e.target.value)} className={base} />;
}

function FieldGroup({ fields, values, onChange }: { fields: EventTypeField[]; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
    if (fields.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">Tidak ada field untuk tab ini.</p>;
    return (
        <div className="flex flex-col gap-5">
            {fields.map((f) => (
                <div key={f.id} className="flex flex-col gap-1.5">
                    {f.field_type !== 'file' && (
                        <label className="text-sm font-medium text-foreground">{f.field_label}{f.is_required && <span className="ml-1 text-destructive">*</span>}</label>
                    )}
                    <FieldInput field={f} value={values[f.field_key] ?? ''} onChange={(val) => onChange(f.field_key, val)} />
                    {f.field_type !== 'file' && f.help_text && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                </div>
            ))}
        </div>
    );
}

// ─── Couple Tab ───────────────────────────────────────────────────────────────

function CoupleTab({ fields, values, onChange }: { fields: EventTypeField[]; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
    const coupleFields = fields.filter((f) => WEDDING_TAB_FIELDS.couple.includes(f.field_key));
    const groomFields  = coupleFields.filter((f) => f.field_key.startsWith('groom'));
    const brideFields  = coupleFields.filter((f) => f.field_key.startsWith('bride'));
    const sharedFields = coupleFields.filter((f) => !f.field_key.startsWith('groom') && !f.field_key.startsWith('bride'));

    return (
        <div className="flex flex-col gap-8">
            <section>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">♂</span>
                    Pengantin Pria
                </h3>
                <FieldGroup fields={groomFields} values={values} onChange={onChange} />
            </section>
            <div className="border-t border-border" />
            <section>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="size-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">♀</span>
                    Pengantin Wanita
                </h3>
                <FieldGroup fields={brideFields} values={values} onChange={onChange} />
            </section>
            {sharedFields.length > 0 && (
                <><div className="border-t border-border" />
                    <section><h3 className="font-semibold text-foreground mb-4">Lainnya</h3><FieldGroup fields={sharedFields} values={values} onChange={onChange} /></section>
                </>
            )}
        </div>
    );
}

// ─── Acara Tab ────────────────────────────────────────────────────────────────

interface AcaraEvent {
    id: number;
    name: string; date: string; time_start: string; time_end: string;
    location_name: string; location_address: string;
    maps_embed: string; maps_url: string; maps_lat: string; maps_lng: string; maps_full_address: string;
}

const EMPTY_ACARA_LOCATION = { maps_embed: '', maps_url: '', maps_lat: '', maps_lng: '', maps_full_address: '' };

function AcaraTab({ events, setEvents }: { events: AcaraEvent[]; setEvents: React.Dispatch<React.SetStateAction<AcaraEvent[]>> }) {
    const [locationPickerId, setLocationPickerId] = useState<number | null>(null);
    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    function addEvent() {
        setEvents((prev) => [...prev, { id: Date.now(), name: '', date: '', time_start: '', time_end: '', location_name: '', location_address: '', ...EMPTY_ACARA_LOCATION }]);
    }
    function updateEvent<K extends keyof AcaraEvent>(id: number, key: K, val: AcaraEvent[K]) {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, [key]: val } : e));
    }
    function applyLocation(id: number, result: LocationResult) {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, maps_embed: result.embedUrl, maps_url: result.mapsUrl, maps_lat: result.lat, maps_lng: result.lng, maps_full_address: result.address, location_address: e.location_address || result.address } : e));
    }
    function removeEvent(id: number) { setEvents((prev) => prev.filter((e) => e.id !== id)); }

    return (
        <div className="flex flex-col gap-6">
            {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Belum ada jadwal. Klik tombol di bawah untuk menambahkan.</p>}
            {events.map((ev, idx) => (
                <div key={ev.id} className="rounded-2xl border border-border p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">Acara {idx + 1}</p>
                        <button type="button" onClick={() => removeEvent(ev.id)} className="text-xs text-destructive hover:underline">Hapus</button>
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
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">Nama Lokasi <span className="text-destructive">*</span></label>
                            <input type="text" placeholder="cth. Masjid Al-Ikhlas" value={ev.location_name} onChange={(e) => updateEvent(ev.id, 'location_name', e.target.value)} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">Alamat Lengkap</label>
                            <textarea rows={2} placeholder="Jl. ..." value={ev.location_address} onChange={(e) => updateEvent(ev.id, 'location_address', e.target.value)} className={`${inputCls} resize-none`} />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">Lokasi di Peta</label>
                            {ev.maps_embed ? (
                                <div className="flex flex-col gap-2">
                                    <div className="relative rounded-2xl overflow-hidden border border-border">
                                        <iframe src={ev.maps_embed} className="w-full" style={{ height: 200 }} loading="lazy" title="Peta" />
                                        <button type="button" onClick={() => setLocationPickerId(ev.id)} className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-background/95 border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors shadow-sm">
                                            <MapPin className="size-3 text-primary" /> Ubah Lokasi
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                        <span className="font-mono">{ev.maps_lat}, {ev.maps_lng}</span>
                                        {ev.maps_url && <a href={ev.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Link2 className="size-3" /> Buka Maps</a>}
                                        <button type="button" onClick={() => setEvents((prev) => prev.map((e) => e.id === ev.id ? { ...e, ...EMPTY_ACARA_LOCATION, location_address: e.location_address } : e))} className="ml-auto text-destructive hover:underline">Hapus</button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setLocationPickerId(ev.id)} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                    <MapPin className="size-4" /> Pilih Lokasi di Peta
                                </button>
                            )}
                        </div>
                    </div>
                    <LocationPickerModal
                        key={locationPickerId === ev.id ? `open-${ev.id}` : `closed-${ev.id}`}
                        open={locationPickerId === ev.id}
                        onClose={() => setLocationPickerId(null)}
                        onConfirm={(result) => applyLocation(ev.id, result)}
                    />
                </div>
            ))}
            <button type="button" onClick={addEvent} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                + Tambah Jadwal Acara
            </button>
        </div>
    );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

interface GalleryItem {
    id: number;
    dbId?: number;
    preview: string;
    caption: string;
    isNew: boolean;
}

function GalleryTab({ items, setItems, maxUploads }: { items: GalleryItem[]; setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>; maxUploads: number | null }) {
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const remaining = maxUploads ? maxUploads - items.length : Infinity;
        files.slice(0, remaining).forEach((file) => {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const compressed = await compressImage(ev.target?.result as string);
                setItems((prev) => [...prev, { id: Date.now() + Math.random(), preview: compressed, caption: '', isNew: true }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }
    function removeItem(id: number) { setItems((prev) => prev.filter((i) => i.id !== id)); }
    function updateCaption(id: number, val: string) { setItems((prev) => prev.map((i) => i.id === id ? { ...i, caption: val } : i)); }
    const atLimit = maxUploads !== null && items.length >= maxUploads;

    return (
        <div className="flex flex-col gap-5">
            {maxUploads && (
                <p className="text-xs text-muted-foreground">
                    Maksimal <span className="font-medium text-foreground">{maxUploads} foto</span>. ({items.length}/{maxUploads} digunakan)
                </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border">
                        <img src={item.preview} alt="" className="w-full aspect-square object-cover" />
                        {item.isNew && <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-md">Baru</span>}
                        <button type="button" onClick={() => removeItem(item.id)} className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        <input type="text" placeholder="Caption..." value={item.caption} onChange={(e) => updateCaption(item.id, e.target.value)} className="absolute inset-x-0 bottom-0 bg-black/50 text-white placeholder:text-white/60 text-xs px-2 py-1 outline-none" />
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

// ─── Love Story Tab ───────────────────────────────────────────────────────────

interface LoveStoryEntry {
    id: number;
    dbId?: number;
    year: string;
    title: string;
    story: string;
    photo: string;
}

function LoveStoryTab({ entries, setEntries }: { entries: LoveStoryEntry[]; setEntries: React.Dispatch<React.SetStateAction<LoveStoryEntry[]>> }) {
    function addEntry() { setEntries((prev) => [...prev, { id: Date.now(), year: '', title: '', story: '', photo: '' }]); }
    function updateEntry(id: number, key: keyof LoveStoryEntry, val: string) { setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [key]: val } : e)); }
    function removeEntry(id: number) { setEntries((prev) => prev.filter((e) => e.id !== id)); }
    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    return (
        <div className="flex flex-col gap-6">
            {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Belum ada cerita. Klik tombol di bawah untuk menambahkan.</p>}
            <div className="relative">
                {entries.length > 0 && <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />}
                <div className="flex flex-col gap-6">
                    {entries.map((entry, idx) => (
                        <div key={entry.id} className="relative pl-10">
                            <div className="absolute left-0 size-8 rounded-full bg-primary/10 text-primary border-2 border-primary flex items-center justify-center text-xs font-bold">{idx + 1}</div>
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
                                        {entry.photo ? (
                                            <div className="relative w-28 group">
                                                <img src={entry.photo} alt="foto momen" className="w-28 h-28 rounded-xl object-cover border border-border" />
                                                <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="size-7 rounded-full bg-white/90 text-foreground flex items-center justify-center hover:bg-white transition-colors shadow cursor-pointer" title="Ganti foto">
                                                        <Upload className="size-3.5" />
                                                        <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                                                            const file = e.target.files?.[0]; if (!file) return;
                                                            const reader = new FileReader();
                                                            reader.onload = async (ev) => { const c = await compressImage(ev.target?.result as string); updateEntry(entry.id, 'photo', c); };
                                                            reader.readAsDataURL(file); e.target.value = '';
                                                        }} />
                                                    </label>
                                                    <button type="button" onClick={() => updateEntry(entry.id, 'photo', '')} title="Hapus foto" className="size-7 rounded-full bg-white/90 text-destructive flex items-center justify-center hover:bg-white transition-colors shadow"><X className="size-3.5" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center gap-1.5 w-28 h-28 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer">
                                                <Image className="size-5" /><span className="text-xs font-medium">Upload Foto</span>
                                                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                                                    const file = e.target.files?.[0]; if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onload = async (ev) => { const c = await compressImage(ev.target?.result as string); updateEntry(entry.id, 'photo', c); };
                                                    reader.readAsDataURL(file); e.target.value = '';
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button type="button" onClick={addEntry} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                + Tambah Momen
            </button>
        </div>
    );
}

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-xl">
            <Check className="size-5 shrink-0" />
            <span className="text-sm font-medium">{message}</span>
            <button type="button" onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X className="size-4" /></button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationsEdit({
    invitation,
    eventType,
    theme,
    package: pkg,
    fieldValues: initFieldValues,
    acaraEvents: initAcaraEvents,
    galleryItems: initGallery,
    loveStory: initLoveStory,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan Saya', href: '/customer/invitations' },
        { title: invitation.title, href: '#' },
    ];

    const tabKeys: TabKey[] = EVENT_TYPE_TABS[eventType.name] ?? DEFAULT_TABS;
    const [activeTab, setActiveTab] = useState<TabKey>(tabKeys[0]);
    const currentTabIndex = tabKeys.indexOf(activeTab);

    // ── State ─────────────────────────────────────────────────────────────────
    const [fieldValues,      setFieldValues]      = useState<Record<string, string>>(initFieldValues ?? {});
    const [status,           setStatus]           = useState<string>(invitation.status);
    const [submitting,       setSubmitting]       = useState(false);
    const [showSuccess,      setShowSuccess]      = useState(false);

    // Acara events — convert from props (no local id yet)
    const [acaraEvents, setAcaraEvents] = useState<AcaraEvent[]>(() =>
        (initAcaraEvents ?? []).map((ev) => ({
            id: ev.id ?? Date.now() + Math.random(),
            name:             ev.name,
            date:             ev.date,
            time_start:       ev.time_start,
            time_end:         ev.time_end,
            location_name:    ev.location_name,
            location_address: ev.location_address,
            maps_embed:       ev.maps_embed,
            maps_url:         ev.maps_url,
            maps_lat:         ev.maps_lat,
            maps_lng:         ev.maps_lng,
            maps_full_address: ev.maps_full_address,
        }))
    );

    // Gallery items
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
        (initGallery ?? []).map((item) => ({
            id:      item.dbId ?? Date.now() + Math.random(),
            dbId:    item.dbId,
            preview: item.preview,
            caption: item.caption,
            isNew:   false,
        }))
    );

    // Love story entries
    const [loveStoryEntries, setLoveStoryEntries] = useState<LoveStoryEntry[]>(() =>
        (initLoveStory ?? []).map((entry) => ({
            id:    entry.dbId ?? Date.now() + Math.random(),
            dbId:  entry.dbId,
            year:  entry.year,
            title: entry.title,
            story: entry.story,
            photo: entry.photo,
        }))
    );

    function handleFieldChange(key: string, val: string) {
        setFieldValues((prev) => ({ ...prev, [key]: val }));
    }

    function handleSubmit() {
        setSubmitting(true);
        router.patch(`/customer/invitations/${invitation.id}`, {
            status,
            field_values:  fieldValues,
            acara_events:  acaraEvents.map((ev) => ({
                name:             ev.name,
                date:             ev.date,
                time_start:       ev.time_start,
                time_end:         ev.time_end,
                location_name:    ev.location_name,
                location_address: ev.location_address,
                maps_embed:       ev.maps_embed,
                maps_url:         ev.maps_url,
                maps_lat:         ev.maps_lat,
                maps_lng:         ev.maps_lng,
            })),
            gallery_items: galleryItems.map((item) => ({
                ...(item.dbId ? { dbId: item.dbId } : {}),
                preview: item.isNew ? item.preview : undefined,
                caption: item.caption,
            })),
            love_story: loveStoryEntries.map((entry) => ({
                year:  entry.year,
                title: entry.title,
                story: entry.story,
                photo: entry.photo,
            })),
        }, {
            onSuccess: () => { setShowSuccess(true); },
            onFinish:  () => setSubmitting(false),
        });
    }

    // ── Tab content ───────────────────────────────────────────────────────────
    function renderTabContent() {
        switch (activeTab) {
            case 'couple':
                return <CoupleTab fields={eventType.fields} values={fieldValues} onChange={handleFieldChange} />;
            case 'acara':
                return <AcaraTab events={acaraEvents} setEvents={setAcaraEvents} />;
            case 'gallery':
                return <GalleryTab items={galleryItems} setItems={setGalleryItems} maxUploads={pkg.max_gallery_uploads} />;
            case 'love_story':
                return <LoveStoryTab entries={loveStoryEntries} setEntries={setLoveStoryEntries} />;
            case 'info':
                return <FieldGroup fields={eventType.fields} values={fieldValues} onChange={handleFieldChange} />;
            case 'host':
                return <FieldGroup fields={eventType.fields.filter((f) => ['host_name', 'host_photo', 'occasion', 'opening_message'].includes(f.field_key))} values={fieldValues} onChange={handleFieldChange} />;
            default:
                return null;
        }
    }

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit — ${invitation.title}`} />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/customer/invitations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <ChevronLeft className="size-4" /> Undangan Saya
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">{invitation.title}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {eventType.label} · Tema <span className="text-foreground font-medium">{theme.name}</span>
                        </p>
                    </div>

                    {/* Status selector */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">Status Undangan</label>
                        <div className="flex gap-2">
                            {STATUS_OPTS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    title={opt.desc}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                                        status === opt.value
                                            ? `${STATUS_COLOR[opt.value]} border-current`
                                            : 'border-border text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
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
                                    activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="min-h-[300px]">
                    {renderTabContent()}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4 gap-3">
                    <div className="flex gap-2">
                        {currentTabIndex > 0 && (
                            <button type="button" onClick={() => setActiveTab(tabKeys[currentTabIndex - 1])} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                                <ChevronLeft className="size-4" /> {TAB_DEFINITIONS[tabKeys[currentTabIndex - 1]].label}
                            </button>
                        )}
                        {currentTabIndex < tabKeys.length - 1 && (
                            <button type="button" onClick={() => setActiveTab(tabKeys[currentTabIndex + 1])} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                                {TAB_DEFINITIONS[tabKeys[currentTabIndex + 1]].label} <ChevronRight className="size-4" />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                        {submitting ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : <><Save className="size-4" /> Simpan Perubahan</>}
                    </button>
                </div>
            </div>

            {showSuccess && (
                <SuccessToast message="Undangan berhasil diperbarui!" onClose={() => setShowSuccess(false)} />
            )}
        </CustomerLayout>
    );
}
