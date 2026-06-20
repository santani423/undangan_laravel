import ImageCropUpload, { compressImage } from '@/components/image-crop-upload';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    CalendarDays,
    Check,
    CheckSquare,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Copy,
    Crown,
    ExternalLink,
    Eye,
    EyeOff,
    Flag,
    Gem,
    Globe,
    Heart,
    Image,
    Key,
    Link2,
    Loader2,
    MapPin,
    MessageSquare,
    Music2,
    Navigation,
    Paintbrush,
    Pause,
    Play,
    Plus,
    Save,
    Search,
    Settings,
    Sliders,
    Trash2,
    Upload,
    UserCheck,
    Users,
    Volume2,
    VolumeX,
    Wallet,
    X,
    ZoomIn,
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
    max_music_upload_mb: number | null;
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
    is_countdown?: boolean;
}

// ─── Theme item type ──────────────────────────────────────────────────────────

interface ThemeItem {
    id: number;
    name: string;
    slug: string;
    category: string | null;
    description: string | null;
    thumbnail_url: string | null;
    preview_image_url: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
    price: number;
    usage_count: number;
}

// ─── Guest & Comment types ────────────────────────────────────────────────────

interface GuestData {
    id: number;
    name: string;
    email: string | null;
    phone_number: string | null;
    gender: 'male' | 'female' | null;
    category: string | null;
    rsvp_status: 'pending' | 'attending' | 'not_attending' | 'maybe';
    rsvp_headcount: number | null;
    rsvp_notes: string | null;
    checked_in_at: string | null;
    notes: string | null;
}

interface GuestStats {
    total: number;
    attending: number;
    notAttending: number;
    maybe: number;
    pending: number;
    checkedIn: number;
    totalHeads: number;
}

interface CommentData {
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

interface CommentStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    flagged: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface DigitalWalletItem {
    id:             number;
    provider:       string;
    provider_label: string;
    account_number: string;
    account_name:   string;
    logo_url:       string | null;
    qris_qr_url:    string | null;
    is_linked:      boolean;
    is_displayed:   boolean;
    display_order:  number;
}

interface Props {
    invitation:          InvitationMeta;
    eventType:           EventType;
    theme:               Theme;
    package:             PackageItem;
    fieldValues:         Record<string, string>;
    acaraEvents:         AcaraEventData[];
    galleryItems:        GalleryItemData[];
    loveStory:           LoveStoryData[];
    availableThemes:     ThemeItem[];
    guests:              PaginatedData<GuestData>;
    guestStats:          GuestStats;
    guestFilters:        { guestSearch: string; guestStatus: string; guestCheckedIn: string };
    comments:            PaginatedData<CommentData>;
    commentStats:        CommentStats;
    commentFilters:      { commentSearch: string; commentStatus: string; commentFlagged: string };
    invitationSettings:  InvitationSettingsData | null;
    availableMusic:      MusicTrack[];
    digitalWallets:      DigitalWalletItem[];
}

// ─── Settings types & constants ───────────────────────────────────────────────

interface MusicTrack {
    id: string;
    name: string;
    artist: string;
    genre: string;
    preview_url: string;
}

interface InvitationSettingsData {
    music_enabled: boolean;
    music_autoplay: boolean;
    music_loop: boolean;
    music_url: string;
    music_source: 'library' | 'upload' | '';
    music_library_id: string;
    features: Record<string, boolean>;
    greeting_title: string;
    greeting_message: string;
    greeting_guest_label: string;
    greeting_button_text: string;
    greeting_cover_image: string;
    invitation_code: string;
}

const INVITATION_FEATURES = [
    { key: 'cover',             label: 'Cover',                  desc: 'Halaman sampul utama undangan' },
    { key: 'greeting',          label: 'Salam Pembuka',          desc: 'Pesan pembuka sebelum masuk undangan' },
    { key: 'couple_profile',    label: 'Profil Mempelai / Anak', desc: 'Foto dan biodata mempelai atau anak' },
    { key: 'event_detail',      label: 'Detail Acara',           desc: 'Jadwal dan informasi acara lengkap' },
    { key: 'countdown',         label: 'Countdown',              desc: 'Hitung mundur menuju hari H' },
    { key: 'location',          label: 'Lokasi & Maps',          desc: 'Peta dan alamat lokasi acara' },
    { key: 'gallery',           label: 'Galeri Foto',            desc: 'Koleksi foto undangan' },
    { key: 'video',             label: 'Video',                  desc: 'Video highlight atau cinematic' },
    { key: 'love_story',        label: 'Love Story / Perjalanan',desc: 'Kisah perjalanan hidup atau cinta' },
    { key: 'rsvp',              label: 'RSVP',                   desc: 'Formulir konfirmasi kehadiran tamu' },
    { key: 'guestbook',         label: 'Buku Tamu',              desc: 'Daftar nama tamu undangan' },
    { key: 'wishes',            label: 'Ucapan & Doa',           desc: 'Pesan dan doa dari para tamu' },
    { key: 'digital_envelope',  label: 'Amplop Digital',         desc: 'Nomor rekening dan transfer hadiah' },
    { key: 'gift_wishlist',     label: 'Wishlist Hadiah',        desc: 'Daftar hadiah yang diinginkan' },
    { key: 'add_to_calendar',   label: 'Tambah ke Kalender',     desc: 'Tombol simpan acara ke kalender' },
    { key: 'music',             label: 'Musik Latar',            desc: 'Kontrol musik latar pada undangan' },
    { key: 'confetti',          label: 'Efek Confetti / Balon',  desc: 'Animasi efek konfeti atau balon' },
    { key: 'footer',            label: 'Footer',                 desc: 'Bagian bawah halaman undangan' },
] as const;

const DEFAULT_FEATURES: Record<string, boolean> = Object.fromEntries(
    INVITATION_FEATURES.map((f) => [
        f.key,
        !['video', 'digital_envelope', 'gift_wishlist', 'confetti'].includes(f.key),
    ]),
);

const BUILTIN_MUSIC_LIBRARY: MusicTrack[] = [
    { id: 'canon-d',        name: 'Canon in D',          artist: 'Pachelbel',       genre: 'Klasik',       preview_url: '' },
    { id: 'thousand-years', name: 'A Thousand Years',    artist: 'Christina Perri', genre: 'Pop Romantis', preview_url: '' },
    { id: 'perfect',        name: 'Perfect',             artist: 'Ed Sheeran',      genre: 'Pop',          preview_url: '' },
    { id: 'all-of-me',      name: 'All of Me',           artist: 'John Legend',     genre: 'Pop',          preview_url: '' },
    { id: 'thinking-out',   name: 'Thinking Out Loud',   artist: 'Ed Sheeran',      genre: 'Pop',          preview_url: '' },
    { id: 'marry-me',       name: 'Marry Me',            artist: 'Train',           genre: 'Pop',          preview_url: '' },
    { id: 'at-last',        name: 'At Last',             artist: 'Etta James',      genre: 'Soul',         preview_url: '' },
    { id: 'lucky',          name: 'Lucky',               artist: 'Jason Mraz',      genre: 'Pop',          preview_url: '' },
];

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'couple' | 'acara' | 'gallery' | 'love_story' | 'info' | 'host' | 'theme' | 'guests' | 'comments' | 'digital_envelope' | 'settings';

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
    theme:            { key: 'theme',            label: 'Ganti Tema',     icon: <Paintbrush className="size-4" /> },
    guests:           { key: 'guests',           label: 'Buku Tamu',      icon: <UserCheck className="size-4" /> },
    comments:         { key: 'comments',         label: 'Komentar',       icon: <MessageSquare className="size-4" /> },
    digital_envelope: { key: 'digital_envelope', label: 'Amplop Digital', icon: <Wallet className="size-4" /> },
    settings:         { key: 'settings',         label: 'Pengaturan',     icon: <Settings className="size-4" /> },
};

// Management tabs always appended to every event type
const MANAGEMENT_TABS: TabKey[] = ['theme', 'guests', 'comments', 'digital_envelope', 'settings'];

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
    is_countdown: boolean;
}

const EMPTY_ACARA_LOCATION = { maps_embed: '', maps_url: '', maps_lat: '', maps_lng: '', maps_full_address: '' };

function AcaraTab({ events, setEvents }: { events: AcaraEvent[]; setEvents: React.Dispatch<React.SetStateAction<AcaraEvent[]>> }) {
    const [locationPickerId, setLocationPickerId] = useState<number | null>(null);
    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    function addEvent() {
        setEvents((prev) => [...prev, { id: Date.now(), name: '', date: '', time_start: '', time_end: '', location_name: '', location_address: '', ...EMPTY_ACARA_LOCATION, is_countdown: prev.length === 0 }]);
    }
    function updateEvent<K extends keyof AcaraEvent>(id: number, key: K, val: AcaraEvent[K]) {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, [key]: val } : e));
    }
    function setCountdownEvent(id: number) {
        setEvents((prev) => prev.map((e) => ({ ...e, is_countdown: e.id === id })));
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
                    {/* Countdown selector */}
                    <div
                        onClick={() => setCountdownEvent(ev.id)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors select-none ${ev.is_countdown ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                    >
                        <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${ev.is_countdown ? 'border-primary' : 'border-border'}`}>
                            {ev.is_countdown && <div className="size-2 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${ev.is_countdown ? 'text-primary' : 'text-foreground'}`}>Jadikan Countdown</p>
                            <p className="text-xs text-muted-foreground">Countdown di undangan akan menghitung mundur ke acara ini</p>
                        </div>
                        {ev.is_countdown && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                                <Check className="size-2.5" /> Terpilih
                            </span>
                        )}
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

// ─── Theme Tab ────────────────────────────────────────────────────────────────

function ThemePreviewModal({ theme, onClose }: { theme: ThemeItem; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <div>
                        <p className="font-semibold text-foreground">{theme.name}</p>
                        <p className="text-xs text-muted-foreground">{theme.category}</p>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                        <X className="size-4 text-muted-foreground" />
                    </button>
                </div>
                {theme.preview_image_url ? (
                    <img src={theme.preview_image_url} alt={theme.name} className="w-full max-h-[70vh] object-contain bg-muted" />
                ) : (
                    <div className="flex items-center justify-center h-64 bg-muted">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl mx-auto mb-3 border border-border/60"
                                style={{ background: `linear-gradient(135deg, ${theme.color_primary ?? '#e5e7eb'}, ${theme.color_secondary ?? theme.color_primary ?? '#d1d5db'})` }} />
                            <p className="text-sm text-muted-foreground">Preview tidak tersedia</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ThemeCard({
    theme,
    isActive,
    isPending,
    onSelect,
    onPreview,
}: {
    theme: ThemeItem;
    isActive: boolean;
    isPending: boolean;
    onSelect: () => void;
    onPreview: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                isPending  ? 'border-primary shadow-lg shadow-primary/20 scale-[1.01]' :
                isActive   ? 'border-emerald-500 shadow-md' :
                             'border-border hover:border-primary/50 hover:shadow-md'
            }`}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                {theme.thumbnail_url ? (
                    <img src={theme.thumbnail_url} alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${theme.color_primary ?? '#e5e7eb'} 0%, ${theme.color_secondary ?? theme.color_primary ?? '#d1d5db'} 100%)` }} />
                )}

                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                            <Check className="size-2.5" /> Aktif
                        </span>
                    )}
                    {isPending && !isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
                            <Check className="size-2.5" /> Dipilih
                        </span>
                    )}
                    {theme.is_exclusive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[10px] font-semibold">
                            <Gem className="size-2.5" /> Eksklusif
                        </span>
                    )}
                    {!theme.is_exclusive && theme.is_premium && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-semibold">
                            <Crown className="size-2.5" /> Premium
                        </span>
                    )}
                </div>

                {/* Preview button */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onPreview(); }}
                    className="absolute bottom-2 right-2 size-8 rounded-xl bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    title="Lihat preview"
                >
                    <ZoomIn className="size-3.5" />
                </button>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="font-semibold text-foreground text-sm leading-tight line-clamp-1">{theme.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                    {/* Color swatches */}
                    <div className="flex gap-1">
                        <div className="size-3.5 rounded-full border border-white/50 shadow-sm ring-1 ring-border/40"
                            style={{ background: theme.color_primary ?? '#e5e7eb' }} />
                        <div className="size-3.5 rounded-full border border-white/50 shadow-sm ring-1 ring-border/40"
                            style={{ background: theme.color_secondary ?? theme.color_primary ?? '#d1d5db' }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        {theme.price > 0
                            ? `Rp ${theme.price.toLocaleString('id-ID')}`
                            : 'Gratis'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ThemeTab({
    currentTheme,
    availableThemes,
    slug,
}: {
    currentTheme: Theme;
    availableThemes: ThemeItem[];
    slug: string;
}) {
    const [pendingId,   setPendingId]   = useState<number>(currentTheme.id);
    const [categoryFilter, setCategory] = useState('');
    const [search,      setSearch]      = useState('');
    const [saving,      setSaving]      = useState(false);
    const [previewTheme, setPreview]    = useState<ThemeItem | null>(null);

    const categories = [...new Set(availableThemes.map((t) => t.category).filter(Boolean))] as string[];

    const filtered = availableThemes.filter((t) => {
        if (categoryFilter && t.category !== categoryFilter) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const pendingTheme = availableThemes.find((t) => t.id === pendingId);
    const hasChanged   = pendingId !== currentTheme.id;

    function handleSave() {
        if (!hasChanged || saving) return;
        setSaving(true);
        router.patch(
            `/customer/invitations/${slug}/theme`,
            { theme_id: pendingId },
            { onFinish: () => setSaving(false) },
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {previewTheme && <ThemePreviewModal theme={previewTheme} onClose={() => setPreview(null)} />}

            {/* Current theme banner */}
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                <div className="relative shrink-0">
                    {currentTheme.thumbnail_url ? (
                        <img src={currentTheme.thumbnail_url} alt={currentTheme.name}
                            className="w-16 h-20 rounded-xl object-cover border border-border" />
                    ) : (
                        <div className="w-16 h-20 rounded-xl border border-border"
                            style={{ background: `linear-gradient(135deg, ${currentTheme.color_primary ?? '#e5e7eb'}, ${currentTheme.color_secondary ?? currentTheme.color_primary ?? '#d1d5db'})` }} />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Check className="size-3 text-white" />
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Tema Saat Ini</p>
                    <p className="font-bold text-foreground">{currentTheme.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex gap-1">
                            <div className="size-3 rounded-full" style={{ background: currentTheme.color_primary ?? '#e5e7eb' }} />
                            <div className="size-3 rounded-full" style={{ background: currentTheme.color_secondary ?? currentTheme.color_primary ?? '#d1d5db' }} />
                        </div>
                        {currentTheme.is_exclusive && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-600"><Gem className="size-2.5" /> Eksklusif</span>}
                        {!currentTheme.is_exclusive && currentTheme.is_premium && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600"><Crown className="size-2.5" /> Premium</span>}
                    </div>
                </div>
            </div>

            {/* Pending selection preview bar */}
            {hasChanged && pendingTheme && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-3">
                    <div className="shrink-0">
                        {pendingTheme.thumbnail_url ? (
                            <img src={pendingTheme.thumbnail_url} alt={pendingTheme.name}
                                className="w-10 h-12 rounded-lg object-cover border border-border" />
                        ) : (
                            <div className="w-10 h-12 rounded-lg border border-border"
                                style={{ background: `linear-gradient(135deg, ${pendingTheme.color_primary ?? '#e5e7eb'}, ${pendingTheme.color_secondary ?? '#d1d5db'})` }} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Akan diganti ke:</p>
                        <p className="font-semibold text-foreground text-sm">{pendingTheme.name}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setPendingId(currentTheme.id)}
                            className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? <><Loader2 className="size-3 animate-spin" /> Menyimpan…</> : <><Paintbrush className="size-3" /> Ganti Tema</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-44 flex items-center gap-2 bg-background border border-border rounded-xl px-3">
                    <Search className="size-4 text-muted-foreground shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama tema…"
                        className="flex-1 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                    />
                    {search && (
                        <button onClick={() => setSearch('')}><X className="size-3.5 text-muted-foreground" /></button>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex gap-1.5 flex-wrap">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${!categoryFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}
                    >
                        Semua
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat === categoryFilter ? '' : cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Count info */}
            <p className="text-xs text-muted-foreground">
                Menampilkan <span className="font-medium text-foreground">{filtered.length}</span> dari {availableThemes.length} tema tersedia
            </p>

            {/* Theme grid */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-border p-10 text-center">
                    <Paintbrush className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada tema ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filtered.map((t) => (
                        <ThemeCard
                            key={t.id}
                            theme={t}
                            isActive={t.id === currentTheme.id}
                            isPending={t.id === pendingId && t.id !== currentTheme.id}
                            onSelect={() => setPendingId(t.id)}
                            onPreview={() => setPreview(t)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Guests Tab ───────────────────────────────────────────────────────────────

const RSVP_LABEL: Record<string, string> = {
    pending: 'Belum Konfirmasi', attending: 'Hadir',
    not_attending: 'Tidak Hadir', maybe: 'Masih Ragu',
};
const RSVP_CLASS: Record<string, string> = {
    pending:       'bg-muted text-muted-foreground',
    attending:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    not_attending: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    maybe:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
};

function GuestsTab({
    slug,
    guests,
    guestStats,
    guestFilters,
}: {
    slug: string;
    guests: PaginatedData<GuestData>;
    guestStats: GuestStats;
    guestFilters: { guestSearch: string; guestStatus: string; guestCheckedIn: string };
}) {
    const [search,      setSearch]      = useState(guestFilters.guestSearch);
    const [showAdd,     setShowAdd]     = useState(false);
    const [addForm,     setAddForm]     = useState({ name: '', slug: '', email: '', phone_number: '', gender: '', category: '', notes: '' });
    const [addSlugManual, setAddSlugManual] = useState(false);
    const [addSlugStatus, setAddSlugStatus] = useState<'idle'|'checking'|'available'|'taken'>('idle');
    const addSlugDebounce = useRef<ReturnType<typeof setTimeout>|null>(null);
    const [addSaving,   setAddSaving]   = useState(false);

    const reload = useCallback((extra: Record<string, string>) => {
        router.get(
            window.location.pathname,
            { guest_search: search, guest_status: guestFilters.guestStatus, guest_checked_in: guestFilters.guestCheckedIn, ...extra },
            { only: ['guests', 'guestStats', 'guestFilters'], preserveState: true, preserveScroll: true },
        );
    }, [search, guestFilters]);

    const guestToSlug = (text: string) =>
        text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

    const setAdd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        setAddForm((f) => {
            const next = { ...f, [k]: val };
            if (k === 'name' && !addSlugManual) {
                next.slug = guestToSlug(val);
            }
            return next;
        });
    };

    const handleAddSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = guestToSlug(e.target.value);
        setAddSlugManual(true);
        setAddForm((f) => ({ ...f, slug: val }));
        setAddSlugStatus('idle');

        if (addSlugDebounce.current) clearTimeout(addSlugDebounce.current);
        if (!val) { setAddSlugStatus('idle'); return; }
        setAddSlugStatus('checking');
        addSlugDebounce.current = setTimeout(async () => {
            try {
                const res = await fetch(`/customer/invitations/${slug}/guests/check-slug?slug=${encodeURIComponent(val)}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                const json = await res.json();
                setAddSlugStatus(json.available ? 'available' : 'taken');
            } catch { setAddSlugStatus('idle'); }
        }, 400);
    };

    useEffect(() => {
        const val = addForm.slug;
        if (!val || addSlugManual) return;
        if (addSlugDebounce.current) clearTimeout(addSlugDebounce.current);
        if (!val) { setAddSlugStatus('idle'); return; }
        setAddSlugStatus('checking');
        addSlugDebounce.current = setTimeout(async () => {
            try {
                const res = await fetch(`/customer/invitations/${slug}/guests/check-slug?slug=${encodeURIComponent(val)}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                const json = await res.json();
                setAddSlugStatus(json.available ? 'available' : 'taken');
            } catch { setAddSlugStatus('idle'); }
        }, 400);
    }, [addForm.slug]);

    function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (addSlugStatus === 'taken') return;
        setAddSaving(true);
        router.post(`/customer/invitations/${slug}/guests`, addForm, {
            only: ['guests', 'guestStats', 'guestFilters'],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setShowAdd(false); setAddForm({ name: '', slug: '', email: '', phone_number: '', gender: '', category: '', notes: '' }); setAddSlugManual(false); setAddSlugStatus('idle'); },
            onFinish: () => setAddSaving(false),
        });
    }

    function handleCheckIn(g: GuestData) {
        router.patch(`/customer/invitations/${slug}/guests/${g.id}/checkin`, {}, {
            only: ['guests', 'guestStats'],
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleDelete(g: GuestData) {
        if (!confirm(`Hapus tamu "${g.name}"?`)) return;
        router.delete(`/customer/invitations/${slug}/guests/${g.id}`, {
            only: ['guests', 'guestStats'],
            preserveState: true,
            preserveScroll: true,
        });
    }

    const inputCls = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition';

    return (
        <div className="flex flex-col gap-5">
            {/* Stats mini cards */}
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                {[
                    { label: 'Total',      value: guestStats.total,        color: 'text-blue-500' },
                    { label: 'Hadir',      value: guestStats.attending,    color: 'text-emerald-500' },
                    { label: 'Tdk Hadir',  value: guestStats.notAttending, color: 'text-red-500' },
                    { label: 'Ragu',       value: guestStats.maybe,        color: 'text-amber-500' },
                    { label: 'Pending',    value: guestStats.pending,      color: 'text-muted-foreground' },
                    { label: 'Check-in',   value: guestStats.checkedIn,    color: 'text-violet-500' },
                    { label: 'Jml Kepala', value: guestStats.totalHeads,   color: 'text-sky-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/40 rounded-xl border border-border p-3 flex flex-col items-center gap-0.5">
                        <span className={`text-lg font-bold ${color}`}>{value}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(e) => { e.preventDefault(); reload({ guest_search: search }); }}
                    className="flex-1 min-w-44 flex items-center gap-2 bg-background border border-border rounded-xl px-3"
                >
                    <Search className="size-4 text-muted-foreground shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, email, no HP…"
                        className="flex-1 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); reload({ guest_search: '' }); }}>
                            <X className="size-3.5 text-muted-foreground" />
                        </button>
                    )}
                </form>
                <select
                    value={guestFilters.guestStatus}
                    onChange={(e) => reload({ guest_status: e.target.value })}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="">Semua Status</option>
                    <option value="attending">Hadir</option>
                    <option value="not_attending">Tidak Hadir</option>
                    <option value="maybe">Masih Ragu</option>
                    <option value="pending">Belum Konfirmasi</option>
                </select>
                <select
                    value={guestFilters.guestCheckedIn}
                    onChange={(e) => reload({ guest_checked_in: e.target.value })}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="">Semua Check-in</option>
                    <option value="yes">Sudah Check-in</option>
                    <option value="no">Belum Check-in</option>
                </select>
                <a
                    href={`/customer/invitations/${slug}/guests/export/csv`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                    Export CSV
                </a>
                <button
                    onClick={() => setShowAdd((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="size-4" /> Tambah Tamu
                </button>
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="font-medium text-sm text-foreground mb-3">Tambah Tamu Baru</p>
                    <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-foreground">Nama *</label>
                            <input required value={addForm.name} onChange={setAdd('name')} className={`mt-1 ${inputCls}`} placeholder="Nama tamu" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-foreground">Slug</label>
                            <input
                                value={addForm.slug}
                                onChange={handleAddSlugChange}
                                placeholder="otomatis dari nama"
                                className={`mt-1 ${inputCls} ${addSlugStatus === 'taken' ? 'border-red-400 focus:ring-red-400' : addSlugStatus === 'available' ? 'border-emerald-400 focus:ring-emerald-400' : ''}`}
                            />
                            {addSlugStatus === 'checking' && <p className="mt-0.5 text-[11px] text-muted-foreground">Memeriksa…</p>}
                            {addSlugStatus === 'taken'    && <p className="mt-0.5 text-[11px] text-red-500">Slug sudah digunakan.</p>}
                            {addSlugStatus === 'available'&& <p className="mt-0.5 text-[11px] text-emerald-600">Slug tersedia.</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-foreground">Email</label>
                            <input type="email" value={addForm.email} onChange={setAdd('email')} className={`mt-1 ${inputCls}`} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-foreground">No HP</label>
                            <input value={addForm.phone_number} onChange={setAdd('phone_number')} className={`mt-1 ${inputCls}`} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-foreground">Jenis Kelamin</label>
                            <select value={addForm.gender} onChange={setAdd('gender')} className={`mt-1 ${inputCls}`}>
                                <option value="">—</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-foreground">Kategori</label>
                            <input value={addForm.category} onChange={setAdd('category')} placeholder="Keluarga, Rekan…" className={`mt-1 ${inputCls}`} />
                        </div>
                        <div className="sm:col-span-2 flex gap-2">
                            <button type="submit" disabled={addSaving || addSlugStatus === 'taken'} className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {addSaving ? 'Menyimpan…' : 'Simpan'}
                            </button>
                            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-border overflow-hidden">
                {guests.data.length === 0 ? (
                    <div className="p-10 text-center">
                        <Users className="size-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada tamu.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kategori</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Jml</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Check-in</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {guests.data.map((g) => (
                                    <tr key={g.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-foreground">{g.name}</p>
                                            {g.email && <p className="text-xs text-muted-foreground">{g.email}</p>}
                                            {g.phone_number && <p className="text-xs text-muted-foreground">{g.phone_number}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{g.category ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${RSVP_CLASS[g.rsvp_status]}`}>
                                                {RSVP_LABEL[g.rsvp_status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">{g.rsvp_headcount ?? 1}</td>
                                        <td className="px-4 py-3">
                                            {g.checked_in_at ? (
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckSquare className="size-3.5" />
                                                    {new Date(g.checked_in_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    title={g.checked_in_at ? 'Batalkan Check-in' : 'Check-in'}
                                                    onClick={() => handleCheckIn(g)}
                                                    className={`p-1.5 rounded-lg transition-colors ${g.checked_in_at ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-muted-foreground hover:bg-muted'}`}
                                                >
                                                    <CheckSquare className="size-4" />
                                                </button>
                                                <button
                                                    title="Hapus"
                                                    onClick={() => handleDelete(g)}
                                                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/5 transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {guests.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">Total {guests.total} tamu</p>
                        <div className="flex gap-1">
                            {guests.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-muted'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground opacity-40" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────

const COMMENT_STATUS_LABEL: Record<string, string> = {
    pending: 'Menunggu', approved: 'Ditampilkan', rejected: 'Disembunyikan',
};
const COMMENT_STATUS_CLASS: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-muted text-muted-foreground',
};

function CommentsTab({
    slug,
    comments,
    commentStats,
    commentFilters,
}: {
    slug: string;
    comments: PaginatedData<CommentData>;
    commentStats: CommentStats;
    commentFilters: { commentSearch: string; commentStatus: string; commentFlagged: string };
}) {
    const [search, setSearch] = useState(commentFilters.commentSearch);
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    const reload = useCallback((extra: Record<string, string>) => {
        router.get(
            window.location.pathname,
            { comment_search: search, comment_status: commentFilters.commentStatus, comment_flagged: commentFilters.commentFlagged, ...extra },
            { only: ['comments', 'commentStats', 'commentFilters'], preserveState: true, preserveScroll: true },
        );
    }, [search, commentFilters]);

    function act(comment: CommentData, action: 'approve' | 'reject') {
        const url = `/customer/invitations/${slug}/comments/${comment.id}/${action}`;
        router.patch(url, {}, { only: ['comments', 'commentStats'], preserveState: true, preserveScroll: true });
    }

    function handleFlag(comment: CommentData) {
        router.patch(`/customer/invitations/${slug}/comments/${comment.id}/flag`, {}, {
            only: ['comments', 'commentStats'], preserveState: true, preserveScroll: true,
        });
    }

    function handleDelete(comment: CommentData) {
        if (!confirm('Hapus komentar ini?')) return;
        router.delete(`/customer/invitations/${slug}/comments/${comment.id}`, {
            only: ['comments', 'commentStats'], preserveState: true, preserveScroll: true,
        });
    }

    function handleBulk() {
        if (!bulkAction || selected.length === 0) return;
        if (bulkAction === 'delete' && !confirm(`Hapus ${selected.length} komentar?`)) return;
        router.post(`/customer/invitations/${slug}/comments/bulk`, { action: bulkAction, ids: selected }, {
            only: ['comments', 'commentStats'],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setSelected([]); setBulkAction(''); },
        });
    }

    const toggleSelect = (id: number) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    return (
        <div className="flex flex-col gap-5">
            {/* Stats mini cards */}
            <div className="grid grid-cols-5 gap-3">
                {[
                    { label: 'Total',         value: commentStats.total,    color: 'text-blue-500' },
                    { label: 'Ditampilkan',   value: commentStats.approved, color: 'text-emerald-500' },
                    { label: 'Menunggu',      value: commentStats.pending,  color: 'text-amber-500' },
                    { label: 'Disembunyikan', value: commentStats.rejected, color: 'text-muted-foreground' },
                    { label: 'Ditandai',      value: commentStats.flagged,  color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/40 rounded-xl border border-border p-3 flex flex-col items-center gap-0.5">
                        <span className={`text-lg font-bold ${color}`}>{value}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(e) => { e.preventDefault(); reload({ comment_search: search }); }}
                    className="flex-1 min-w-44 flex items-center gap-2 bg-background border border-border rounded-xl px-3"
                >
                    <Search className="size-4 text-muted-foreground shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau isi komentar…"
                        className="flex-1 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                    />
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); reload({ comment_search: '' }); }}>
                            <X className="size-3.5 text-muted-foreground" />
                        </button>
                    )}
                </form>
                <select
                    value={commentFilters.commentStatus}
                    onChange={(e) => reload({ comment_status: e.target.value })}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Ditampilkan</option>
                    <option value="rejected">Disembunyikan</option>
                </select>
                <select
                    value={commentFilters.commentFlagged}
                    onChange={(e) => reload({ comment_flagged: e.target.value })}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="">Semua</option>
                    <option value="yes">Hanya Ditandai</option>
                </select>
            </div>

            {/* Bulk action bar */}
            {selected.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <span className="text-sm font-medium text-foreground">{selected.length} dipilih</span>
                    <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="rounded-xl border border-border bg-background px-2 py-1.5 text-sm focus:outline-none">
                        <option value="">Pilih aksi…</option>
                        <option value="approve">Tampilkan semua</option>
                        <option value="reject">Sembunyikan semua</option>
                        <option value="delete">Hapus semua</option>
                    </select>
                    <button onClick={handleBulk} disabled={!bulkAction} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors">
                        Terapkan
                    </button>
                    <button onClick={() => setSelected([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Batal</button>
                </div>
            )}

            {/* Select all */}
            {comments.data.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.length === comments.data.length}
                        onChange={() => setSelected(selected.length === comments.data.length ? [] : comments.data.map((c) => c.id))}
                        className="h-4 w-4 rounded border-border text-primary"
                    />
                    <span className="text-xs text-muted-foreground">Pilih semua di halaman ini</span>
                </label>
            )}

            {/* Comment list */}
            {comments.data.length === 0 ? (
                <div className="rounded-2xl border border-border p-10 text-center">
                    <MessageSquare className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {comments.data.map((c) => (
                        <div key={c.id} className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition-colors ${c.is_flagged ? 'border-red-300 dark:border-red-800' : 'border-border'} ${selected.includes(c.id) ? 'ring-2 ring-primary' : ''}`}>
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(c.id)}
                                    onChange={() => toggleSelect(c.id)}
                                    className="mt-0.5 h-4 w-4 rounded border-border text-primary cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-foreground text-sm">{c.guest_name}</span>
                                        {c.guest_email && <span className="text-xs text-muted-foreground">{c.guest_email}</span>}
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COMMENT_STATUS_CLASS[c.status]}`}>
                                            {COMMENT_STATUS_LABEL[c.status]}
                                        </span>
                                        {c.is_flagged && (
                                            <span className="inline-flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400">
                                                <Flag className="size-3" /> Ditandai
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(c.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Comment text */}
                            <p className="text-sm text-foreground leading-relaxed pl-7">{c.comment_text}</p>

                            {/* Preview bubble */}
                            <div className="pl-7">
                                <div className="bg-muted/50 rounded-xl px-4 py-3 border border-border/60 max-w-xs">
                                    <p className="text-xs font-semibold text-foreground mb-0.5">{c.guest_name}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{c.comment_text}</p>
                                </div>
                            </div>

                            {c.is_flagged && c.flag_reason && (
                                <div className="pl-7 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                                    <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                                    <span>{c.flag_reason}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pl-7 flex-wrap">
                                {c.status !== 'approved' && (
                                    <button onClick={() => act(c, 'approve')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
                                        <Eye className="size-3.5" /> Tampilkan
                                    </button>
                                )}
                                {c.status !== 'rejected' && (
                                    <button onClick={() => act(c, 'reject')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                                        <EyeOff className="size-3.5" /> Sembunyikan
                                    </button>
                                )}
                                <button onClick={() => handleFlag(c)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${c.is_flagged ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                                    <Flag className="size-3.5" /> {c.is_flagged ? 'Hapus Tanda' : 'Tandai'}
                                </button>
                                <button onClick={() => handleDelete(c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/40 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                                    <Trash2 className="size-3.5" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {comments.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Total {comments.total} komentar</p>
                    <div className="flex gap-1">
                        {comments.links.map((link, i) => (
                            link.url ? (
                                <Link key={i} href={link.url} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-muted'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground opacity-40" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-border'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({
    slug,
    initSettings,
    availableMusic,
    maxMusicMb,
}: {
    slug: string;
    initSettings: InvitationSettingsData | null;
    availableMusic: MusicTrack[];
    maxMusicMb: number;
}) {
    const inputCls = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground';

    // ── Greeting ─────────────────────────────────────────────────────────────
    const [greetingTitle,      setGreetingTitle]      = useState(initSettings?.greeting_title      ?? 'Kepada Yth.');
    const [greetingMessage,    setGreetingMessage]    = useState(initSettings?.greeting_message    ?? 'Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara kami.');
    const [greetingGuestLabel, setGreetingGuestLabel] = useState(initSettings?.greeting_guest_label ?? 'Tamu Undangan');
    const [greetingButtonText, setGreetingButtonText] = useState(initSettings?.greeting_button_text ?? 'Buka Undangan');

    // ── Invitation code ───────────────────────────────────────────────────────
    const [code,          setCode]          = useState(initSettings?.invitation_code ?? slug);
    const [codeEditing,   setCodeEditing]   = useState(false);
    const [codeDraft,     setCodeDraft]     = useState(initSettings?.invitation_code ?? slug);
    const [codeCopied,    setCodeCopied]    = useState(false);

    // ── Music ─────────────────────────────────────────────────────────────────
    const [musicEnabled,   setMusicEnabled]   = useState(initSettings?.music_enabled   ?? false);
    const [musicAutoplay,  setMusicAutoplay]  = useState(initSettings?.music_autoplay  ?? true);
    const [musicLoop,      setMusicLoop]      = useState(initSettings?.music_loop      ?? true);
    const [musicSource,    setMusicSource]    = useState<'library' | 'upload' | ''>(initSettings?.music_source ?? '');
    const [musicLibraryId, setMusicLibraryId] = useState(initSettings?.music_library_id ?? '');
    const [musicUploadUrl, setMusicUploadUrl] = useState(initSettings?.music_url ?? '');
    const [musicUploading, setMusicUploading] = useState(false);
    const [musicUploadError, setMusicUploadError] = useState('');
    const [previewingId,   setPreviewingId]   = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ── Features ──────────────────────────────────────────────────────────────
    const [features, setFeatures] = useState<Record<string, boolean>>({
        ...DEFAULT_FEATURES,
        ...(initSettings?.features ?? {}),
    });

    // ── Save ──────────────────────────────────────────────────────────────────
    const [saving,       setSaving]       = useState(false);
    const [saveSuccess,  setSaveSuccess]  = useState(false);

    // ─ Helpers ────────────────────────────────────────────────────────────────

    const musicLibrary = [...BUILTIN_MUSIC_LIBRARY, ...availableMusic];

    function handleMusicPreview(track: MusicTrack) {
        if (previewingId === track.id) {
            audioRef.current?.pause();
            setPreviewingId(null);
            return;
        }
        audioRef.current?.pause();
        if (track.preview_url) {
            const audio = new Audio(track.preview_url);
            audioRef.current = audio;
            audio.play().catch(() => {});
            audio.onended = () => setPreviewingId(null);
            setPreviewingId(track.id);
        }
    }

    function handleCopyCode() {
        navigator.clipboard.writeText(code).then(() => {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        });
    }

    function handleCodeSave() {
        setCode(codeDraft.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'));
        setCodeEditing(false);
    }

    function handleMusicFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (file.size > maxMusicMb * 1024 * 1024) {
            setMusicUploadError(`Ukuran file terlalu besar. Maksimal ${maxMusicMb} MB.`);
            return;
        }

        const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
        if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac)$/i)) {
            setMusicUploadError('Format file tidak didukung. Gunakan MP3, WAV, OGG, atau AAC.');
            return;
        }

        setMusicUploadError('');
        const formData = new FormData();
        formData.append('music_file', file);

        setMusicUploading(true);
        const rawCookie = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') ?? '';
        const xsrfToken = rawCookie ? decodeURIComponent(rawCookie) : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');
        fetch(`/customer/invitations/${slug}/upload-music`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'application/json',
            },
            body: formData,
        })
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok) {
                    setMusicUploadError(data.message ?? 'Gagal mengupload file musik.');
                } else if (data.url) {
                    setMusicUploadUrl(data.url);
                    setMusicSource('upload');
                    setMusicEnabled(true);
                }
            })
            .catch(() => setMusicUploadError('Gagal mengupload file musik. Coba lagi.'))
            .finally(() => setMusicUploading(false));
    }

    function handleSave() {
        setSaving(true);
        router.patch(`/customer/invitations/${slug}/settings`, {
            greeting_title:       greetingTitle,
            greeting_message:     greetingMessage,
            greeting_guest_label: greetingGuestLabel,
            greeting_button_text: greetingButtonText,
            invitation_code:      code,
            music_enabled:        musicEnabled,
            music_autoplay:       musicAutoplay,
            music_loop:           musicLoop,
            music_source:         musicSource,
            music_library_id:     musicLibraryId,
            music_url:            musicUploadUrl,
            features,
        }, {
            onSuccess: () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); },
            onFinish:  () => setSaving(false),
        });
    }

    const selectedLibraryTrack = musicLibrary.find((t) => t.id === musicLibraryId);
    const previewUrl = `${window.location.origin}/${code}`;

    return (
        <div className="flex flex-col gap-6">

            {/* ── 1. Salam Pembuka ─────────────────────────────────────────── */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Volume2 className="size-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">Salam Pembuka Undangan</h3>
                        <p className="text-xs text-muted-foreground">Pesan yang tampil saat tamu membuka link undangan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Judul Salam <span className="text-destructive">*</span></label>
                        <input type="text" value={greetingTitle} onChange={(e) => setGreetingTitle(e.target.value)} placeholder="cth. Kepada Yth." className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Label Nama Tamu</label>
                        <input type="text" value={greetingGuestLabel} onChange={(e) => setGreetingGuestLabel(e.target.value)} placeholder="cth. Tamu Undangan" className={inputCls} />
                        <p className="text-[11px] text-muted-foreground">Tampil di bawah nama tamu pada cover pembuka</p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-foreground">Isi Salam Pembuka</label>
                        <textarea rows={3} value={greetingMessage} onChange={(e) => setGreetingMessage(e.target.value)} placeholder="Tanpa mengurangi rasa hormat..." className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Teks Tombol</label>
                        <input type="text" value={greetingButtonText} onChange={(e) => setGreetingButtonText(e.target.value)} placeholder="cth. Buka Undangan" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-foreground">
                            Musik Latar Undangan <span className="text-muted-foreground">(MP3, opsional)</span>
                        </label>
                        {musicUploadUrl ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                                    <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                                        <Music2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 truncate">File musik siap digunakan</p>
                                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500">Akan diputar saat tamu membuka undangan</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setMusicUploadUrl(''); setMusicSource(''); setMusicEnabled(false); }}
                                        className="shrink-0 text-xs text-destructive hover:underline flex items-center gap-1"
                                    >
                                        <X className="size-3" /> Hapus
                                    </button>
                                </div>
                                <audio controls src={musicUploadUrl} className="w-full h-9 rounded-xl" />
                                <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-2">
                                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                                        <input type="checkbox" checked={musicAutoplay} onChange={(e) => setMusicAutoplay(e.target.checked)} className="rounded" />
                                        Autoplay
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                                        <input type="checkbox" checked={musicLoop} onChange={(e) => setMusicLoop(e.target.checked)} className="rounded" />
                                        Putar Ulang (Loop)
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                                        <input type="checkbox" checked={musicEnabled} onChange={(e) => setMusicEnabled(e.target.checked)} className="rounded" />
                                        Aktifkan Musik
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className={`group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 transition-colors text-muted-foreground ${musicUploading ? 'border-primary/40 bg-primary/5 cursor-wait' : 'border-border cursor-pointer hover:border-primary hover:bg-primary/5 hover:text-primary'}`}>
                                <div className={`size-12 rounded-xl border bg-muted/40 flex items-center justify-center transition-colors ${musicUploading ? 'border-primary/50 bg-primary/10' : 'border-border group-hover:border-primary/50 group-hover:bg-primary/10'}`}>
                                    {musicUploading ? <Loader2 className="size-6 animate-spin text-primary" /> : <Music2 className="size-6" />}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">{musicUploading ? 'Mengupload musik...' : 'Klik untuk upload musik latar'}</p>
                                    <p className="text-xs mt-0.5">Format MP3, AAC, OGG — maks. {maxMusicMb} MB</p>
                                </div>
                                {musicUploadError && <p className="text-xs text-destructive">{musicUploadError}</p>}
                                <input
                                    type="file"
                                    accept="audio/mp3,audio/mpeg,audio/ogg,audio/aac,audio/*"
                                    className="sr-only"
                                    disabled={musicUploading}
                                    onChange={handleMusicFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Preview card */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Preview Salam Pembuka</p>
                    <p className="text-xs text-muted-foreground">{greetingTitle}</p>
                    <p className="text-base font-semibold text-foreground">{greetingGuestLabel}</p>
                    <p className="text-xs text-muted-foreground max-w-sm">{greetingMessage}</p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
                        {greetingButtonText}
                    </span>
                </div>
            </section>

            {/* ── 2. Kode Undangan ──────────────────────────────────────────── */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Key className="size-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">Kode Undangan</h3>
                        <p className="text-xs text-muted-foreground">Kode unik yang digunakan sebagai alamat URL undangan</p>
                    </div>
                </div>

                {/* Current code display */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-foreground">Kode Saat Ini</label>
                    {codeEditing ? (
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={codeDraft}
                                onChange={(e) => setCodeDraft(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                className={`flex-1 ${inputCls}`}
                                placeholder="kode-unik-anda"
                            />
                            <button type="button" onClick={handleCodeSave} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                <Check className="size-3.5" /> Terapkan
                            </button>
                            <button type="button" onClick={() => { setCodeDraft(code); setCodeEditing(false); }} className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors">
                                Batal
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                                <Globe className="size-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-mono font-semibold text-foreground flex-1">{code}</span>
                            </div>
                            <button type="button" onClick={() => { setCodeDraft(code); setCodeEditing(true); }} className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-xs font-medium hover:bg-muted transition-colors">
                                Edit
                            </button>
                            <button type="button" onClick={handleCopyCode} title="Salin kode" className="shrink-0 size-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                {codeCopied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                            </button>
                        </div>
                    )}

                    {/* URL Preview */}
                    <div className="flex items-center gap-2 rounded-xl bg-muted/40 border border-border/60 px-4 py-2.5">
                        <ExternalLink className="size-3.5 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground font-mono flex-1 truncate">{previewUrl}</span>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-primary hover:underline">
                            Buka
                        </a>
                    </div>

                </div>
            </section>

            {/* ── 3. Musik Latar ────────────────────────────────────────────── */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Music2 className="size-4" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">Musik Latar</h3>
                        <p className="text-xs text-muted-foreground">Musik yang diputar saat tamu membuka undangan</p>
                    </div>
                    <ToggleSwitch enabled={musicEnabled} onChange={setMusicEnabled} />
                </div>

                {musicEnabled && (
                    <div className="flex flex-col gap-4 pt-1">
                        {/* Music options */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between py-2.5 border-t border-border/50">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Autoplay</p>
                                    <p className="text-xs text-muted-foreground">Putar otomatis saat undangan dibuka</p>
                                </div>
                                <ToggleSwitch enabled={musicAutoplay} onChange={setMusicAutoplay} />
                            </div>
                            <div className="flex items-center justify-between py-2.5 border-t border-border/50">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Loop (Ulang)</p>
                                    <p className="text-xs text-muted-foreground">Putar ulang musik dari awal setelah selesai</p>
                                </div>
                                <ToggleSwitch enabled={musicLoop} onChange={setMusicLoop} />
                            </div>
                        </div>

                        {/* Source selector */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-foreground">Sumber Musik</label>
                            <div className="grid grid-cols-2 gap-2">
                                {([['library', 'Pilih dari Daftar'], ['upload', 'Upload File']] as const).map(([val, lbl]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setMusicSource(val)}
                                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${musicSource === val ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Library */}
                        {musicSource === 'library' && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-foreground">Pilih Lagu</p>
                                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
                                    {musicLibrary.map((track) => (
                                        <div
                                            key={track.id}
                                            onClick={() => setMusicLibraryId(track.id)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${musicLibraryId === track.id ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                                        >
                                            <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${musicLibraryId === track.id ? 'border-primary' : 'border-border'}`}>
                                                {musicLibraryId === track.id && <div className="size-2 rounded-full bg-primary" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
                                                <p className="text-xs text-muted-foreground">{track.artist} · {track.genre}</p>
                                            </div>
                                            {track.preview_url && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleMusicPreview(track); }}
                                                    className="shrink-0 size-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Preview"
                                                >
                                                    {previewingId === track.id ? <Pause className="size-3" /> : <Play className="size-3" />}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {selectedLibraryTrack && (
                                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5">
                                        <Music2 className="size-4 text-primary shrink-0" />
                                        <span className="text-xs text-foreground font-medium">{selectedLibraryTrack.name}</span>
                                        <span className="text-xs text-muted-foreground">— {selectedLibraryTrack.artist}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upload */}
                        {musicSource === 'upload' && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-foreground">Upload File Musik</p>
                                {musicUploading ? (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground">
                                        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                                        <span className="text-sm font-medium">Mengupload...</span>
                                    </div>
                                ) : musicUploadUrl ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                                            <Music2 className="size-4 text-primary shrink-0" />
                                            <span className="text-sm text-foreground flex-1 truncate">File musik telah diunggah</span>
                                            <button type="button" onClick={() => { setMusicUploadUrl(''); setMusicUploadError(''); }} className="shrink-0 text-xs text-destructive hover:underline flex items-center gap-1">
                                                <X className="size-3" /> Hapus
                                            </button>
                                        </div>
                                        <audio controls src={musicUploadUrl} className="w-full h-9 rounded-xl" />
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-colors text-muted-foreground ${musicUploadError ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}>
                                        <Upload className={`size-5 ${musicUploadError ? 'text-destructive' : ''}`} />
                                        <span className="text-sm font-medium">Klik untuk upload</span>
                                        <span className="text-xs">MP3, WAV, OGG, AAC — maks. {maxMusicMb} MB</span>
                                        <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,.mp3,.wav,.ogg,.aac" className="sr-only" onChange={handleMusicFileChange} />
                                    </label>
                                )}
                                {musicUploadError && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                        <X className="size-3 shrink-0" />{musicUploadError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ── 4. Fitur & Halaman ────────────────────────────────────────── */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Sliders className="size-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">Fitur & Halaman Undangan</h3>
                        <p className="text-xs text-muted-foreground">Aktifkan atau nonaktifkan bagian yang ditampilkan di undangan</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {Object.values(features).filter(Boolean).length}/{INVITATION_FEATURES.length} aktif
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-border/60">
                    {INVITATION_FEATURES.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between gap-4 py-3">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{feature.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-medium ${features[feature.key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                    {features[feature.key] ? 'Tampil' : 'Sembunyi'}
                                </span>
                                <ToggleSwitch
                                    enabled={features[feature.key] ?? false}
                                    onChange={(v) => setFeatures((prev) => ({ ...prev, [feature.key]: v }))}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bulk actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex-1">Aktifkan / nonaktifkan semua sekaligus:</span>
                    <button
                        type="button"
                        onClick={() => setFeatures(Object.fromEntries(INVITATION_FEATURES.map((f) => [f.key, true])))}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                        Tampilkan Semua
                    </button>
                    <button
                        type="button"
                        onClick={() => setFeatures(Object.fromEntries(INVITATION_FEATURES.map((f) => [f.key, false])))}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                        Sembunyikan Semua
                    </button>
                </div>
            </section>

            {/* ── Save button ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4 gap-3">
                {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                        <Check className="size-4" /> Pengaturan berhasil disimpan
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                    {saving ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : <><Save className="size-4" /> Simpan Pengaturan</>}
                </button>
            </div>
        </div>
    );
}

// ─── Digital Envelope Tab ─────────────────────────────────────────────────────

const WALLET_PROVIDERS: { value: string; label: string }[] = [
    { value: 'dana',      label: 'DANA' },
    { value: 'ovo',       label: 'OVO' },
    { value: 'gopay',     label: 'GoPay' },
    { value: 'shopeepay', label: 'ShopeePay' },
    { value: 'linkaja',   label: 'LinkAja' },
    { value: 'jeniuspay', label: 'Jenius Pay' },
    { value: 'other',     label: 'Lainnya' },
];

const PROVIDER_COLORS: Record<string, string> = {
    dana:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ovo:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gopay:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    shopeepay:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    linkaja:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    jeniuspay:  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    other:      'bg-muted text-muted-foreground',
};

function WalletProviderBadge({ provider, providerLabel, logoUrl }: { provider: string; providerLabel: string; logoUrl: string | null }) {
    if (logoUrl) {
        return <img src={logoUrl} alt={providerLabel} className="size-9 rounded-lg object-contain bg-muted" />;
    }
    const colorCls = PROVIDER_COLORS[provider] ?? PROVIDER_COLORS.other;
    return (
        <div className={`size-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${colorCls}`}>
            {providerLabel.slice(0, 2).toUpperCase()}
        </div>
    );
}

function QrisPreviewModal({
    url,
    providerLabel,
    accountName,
    accountNumber,
    onClose,
}: {
    url: string;
    providerLabel: string;
    accountName: string;
    accountNumber: string;
    onClose: () => void;
}) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                {/* Card */}
                <div className="w-full rounded-2xl bg-white dark:bg-card border border-border shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <div>
                            <p className="text-sm font-semibold text-foreground">{providerLabel}</p>
                            <p className="text-xs text-muted-foreground">{accountNumber} · {accountName}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    {/* QR Image */}
                    <div className="p-6 flex items-center justify-center bg-white">
                        <img
                            src={url}
                            alt={`QRIS ${providerLabel}`}
                            className="w-full max-w-[240px] object-contain"
                        />
                    </div>
                    <div className="px-5 py-3 bg-muted/40 text-center">
                        <p className="text-xs text-muted-foreground">Scan QR Code untuk transfer</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}

function getCsrfToken(): string {
    const match = document.cookie.split(';').find((c) => c.trim().startsWith('XSRF-TOKEN='));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

interface CreateWalletForm {
    provider:       string;
    provider_label: string;
    account_number: string;
    account_name:   string;
}

type CreateWalletErrors = Partial<Record<keyof CreateWalletForm | 'qris_qr' | 'general', string>>;

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function AddWalletModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (wallet: Omit<DigitalWalletItem, 'is_linked' | 'is_displayed' | 'display_order'>) => void;
}) {
    const inputCls = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground';

    const [form, setForm]           = useState<CreateWalletForm>({
        provider:       'dana',
        provider_label: 'DANA',
        account_number: '',
        account_name:   '',
    });
    const [qrisPreview, setQrisPreview] = useState<string | null>(null);
    const [qrisBase64,  setQrisBase64]  = useState<string | null>(null);
    const [submitting,  setSubmitting]  = useState(false);
    const [errors,      setErrors]      = useState<CreateWalletErrors>({});
    const qrisInputRef = useRef<HTMLInputElement>(null);

    function handleProviderChange(value: string) {
        const found = WALLET_PROVIDERS.find((p) => p.value === value);
        setForm((prev) => ({ ...prev, provider: value, provider_label: found?.label ?? '' }));
        setErrors((prev) => ({ ...prev, provider: undefined }));
    }

    function handleField(key: keyof CreateWalletForm, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    async function handleQrisFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setErrors((prev) => ({ ...prev, qris_qr: 'Format file harus PNG atau JPG.' }));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, qris_qr: 'Ukuran file maksimal 2 MB.' }));
            return;
        }
        const b64 = await fileToBase64(file);
        setQrisBase64(b64);
        setQrisPreview(b64);
        setErrors((prev) => ({ ...prev, qris_qr: undefined }));
    }

    function removeQris() {
        setQrisBase64(null);
        setQrisPreview(null);
        if (qrisInputRef.current) qrisInputRef.current.value = '';
    }

    function validate(): boolean {
        const e: CreateWalletErrors = {};
        if (!form.provider)       e.provider       = 'Pilih penyedia dompet digital.';
        if (!form.provider_label) e.provider_label = 'Nama penyedia wajib diisi.';
        if (!form.account_number) e.account_number = 'Nomor akun wajib diisi.';
        if (!form.account_name)   e.account_name   = 'Nama pemilik akun wajib diisi.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit() {
        if (!validate() || submitting) return;
        setSubmitting(true);
        setErrors({});
        try {
            const res = await fetch('/customer/digital-wallets', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    provider:       form.provider,
                    provider_label: form.provider_label,
                    account_number: form.account_number,
                    account_name:   form.account_name,
                    is_active:      true,
                    ...(qrisBase64 ? { qris_qr: qrisBase64 } : {}),
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                if (body.errors) {
                    const mapped: CreateWalletErrors = {};
                    for (const [k, v] of Object.entries(body.errors as Record<string, string[]>)) {
                        mapped[k as keyof CreateWalletErrors] = (v as string[])[0];
                    }
                    setErrors(mapped);
                } else {
                    setErrors({ general: body.message ?? 'Terjadi kesalahan. Coba lagi.' });
                }
                setSubmitting(false);
                return;
            }

            const created = await res.json();
            // Call parent handlers before any state update to avoid unmount issues
            onCreated({ ...created, qris_qr_url: created.qris_qr_url ?? null });
            onClose();
            // Do NOT call setSubmitting after this — component unmounts
        } catch {
            setErrors({ general: 'Gagal terhubung ke server. Periksa koneksi dan coba lagi.' });
            setSubmitting(false);
        }
    }

    function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget && !submitting) onClose();
    }

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, submitting]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <Wallet className="size-4 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">Tambah Dompet Digital</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => !submitting && onClose()}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                        disabled={submitting}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
                    {errors.general && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                            <AlertTriangle className="size-4 shrink-0" />
                            {errors.general}
                        </div>
                    )}

                    {/* Provider */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Penyedia <span className="text-red-500">*</span></label>
                        <select
                            value={form.provider}
                            onChange={(e) => handleProviderChange(e.target.value)}
                            className={inputCls}
                        >
                            {WALLET_PROVIDERS.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        {errors.provider && <p className="text-xs text-red-500">{errors.provider}</p>}
                    </div>

                    {/* Custom provider label — only for "other" */}
                    {form.provider === 'other' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Nama Penyedia <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.provider_label}
                                onChange={(e) => handleField('provider_label', e.target.value)}
                                placeholder="Contoh: Bank BCA, Transfer Tunai..."
                                className={inputCls}
                            />
                            {errors.provider_label && <p className="text-xs text-red-500">{errors.provider_label}</p>}
                        </div>
                    )}

                    {/* Account number */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Nomor Akun / HP <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.account_number}
                            onChange={(e) => handleField('account_number', e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className={inputCls}
                        />
                        {errors.account_number && <p className="text-xs text-red-500">{errors.account_number}</p>}
                    </div>

                    {/* Account name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Nama Pemilik <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.account_name}
                            onChange={(e) => handleField('account_name', e.target.value)}
                            placeholder="Nama sesuai akun"
                            className={inputCls}
                        />
                        {errors.account_name && <p className="text-xs text-red-500">{errors.account_name}</p>}
                    </div>

                    {/* QRIS upload */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">QR Code / QRIS <span className="text-muted-foreground/60 font-normal">(opsional)</span></label>
                        {qrisPreview ? (
                            <div className="relative w-full rounded-xl border border-border overflow-hidden bg-muted/30">
                                <img
                                    src={qrisPreview}
                                    alt="QRIS Preview"
                                    className="w-full max-h-48 object-contain p-4"
                                />
                                <button
                                    type="button"
                                    onClick={removeQris}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-6 cursor-pointer hover:bg-muted/50 transition-colors">
                                <Upload className="size-5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground text-center">
                                    Klik untuk upload gambar QRIS<br />
                                    <span className="text-[10px]">PNG / JPG · Maks 2 MB</span>
                                </span>
                                <input
                                    ref={qrisInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleQrisFile}
                                    className="sr-only"
                                />
                            </label>
                        )}
                        {errors.qris_qr && <p className="text-xs text-red-500">{errors.qris_qr}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
                    <button
                        type="button"
                        onClick={() => !submitting && onClose()}
                        disabled={submitting}
                        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                        {submitting
                            ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</>
                            : <><Plus className="size-4" /> Tambah Dompet</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DigitalEnvelopeTab({
    invitationSlug,
    initWallets,
}: {
    invitationSlug: string;
    initWallets: DigitalWalletItem[];
}) {
    const [wallets, setWallets] = useState<DigitalWalletItem[]>(() =>
        [...initWallets].sort((a, b) => (a.is_linked ? a.display_order : 99) - (b.is_linked ? b.display_order : 99))
    );
    const [saving,      setSaving]      = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError,   setSaveError]   = useState(false);
    const [showModal,   setShowModal]   = useState(false);
    const [previewQris, setPreviewQris] = useState<DigitalWalletItem | null>(null);

    const linkedWallets   = wallets.filter((w) => w.is_linked);
    const unlinkedWallets = wallets.filter((w) => !w.is_linked);

    // ── Sync helpers ─────────────────────────────────────────────────────────

    function syncToServer(nextWallets: DigitalWalletItem[]) {
        setSaving(true);
        setSaveSuccess(false);
        const syncWallets = nextWallets
            .filter((w) => w.is_linked)
            .sort((a, b) => a.display_order - b.display_order)
            .map((w, i) => ({ id: w.id, is_displayed: w.is_displayed, display_order: i }));
        router.post(
            `/customer/invitations/${invitationSlug}/digital-wallets/sync`,
            { wallets: syncWallets },
            {
                preserveState:  true,
                preserveScroll: true,
                only:           ['digitalWallets'],
                onSuccess: () => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2500); },
                onError:   () => { setSaveError(true);   setTimeout(() => setSaveError(false),   4000); },
                onFinish:  () => setSaving(false),
            },
        );
    }

    function toggleLinked(id: number) {
        setWallets((prev) => {
            const linked = prev.filter((w) => w.is_linked);
            const next = prev.map((w) => {
                if (w.id !== id) return w;
                if (w.is_linked) return { ...w, is_linked: false, display_order: 99 };
                return { ...w, is_linked: true, is_displayed: true, display_order: linked.length };
            });
            syncToServer(next);
            return next;
        });
    }

    function toggleDisplayed(id: number) {
        setWallets((prev) => {
            const next = prev.map((w) => w.id === id ? { ...w, is_displayed: !w.is_displayed } : w);
            syncToServer(next);
            return next;
        });
    }

    function moveUp(id: number) {
        setWallets((prev) => {
            const sorted = prev.filter((w) => w.is_linked).sort((a, b) => a.display_order - b.display_order);
            const idx = sorted.findIndex((w) => w.id === id);
            if (idx <= 0) return prev;
            [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
            const reordered = sorted.map((w, i) => ({ ...w, display_order: i }));
            const next = [...prev.filter((w) => !w.is_linked), ...reordered];
            syncToServer(next);
            return next;
        });
    }

    function moveDown(id: number) {
        setWallets((prev) => {
            const sorted = prev.filter((w) => w.is_linked).sort((a, b) => a.display_order - b.display_order);
            const idx = sorted.findIndex((w) => w.id === id);
            if (idx >= sorted.length - 1) return prev;
            [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
            const reordered = sorted.map((w, i) => ({ ...w, display_order: i }));
            const next = [...prev.filter((w) => !w.is_linked), ...reordered];
            syncToServer(next);
            return next;
        });
    }

    function handleWalletCreated(created: Omit<DigitalWalletItem, 'is_linked' | 'is_displayed' | 'display_order'>) {
        setWallets((prev) => {
            if (prev.some((w) => w.id === created.id)) return prev;
            return [...prev, { ...created, is_linked: false, is_displayed: false, display_order: 99 }];
        });
    }

    function handleSave() {
        syncToServer(wallets);
    }

    return (
        <>
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">Amplop Digital</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Pilih dompet digital yang ditampilkan pada undangan dan atur urutannya.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="size-3.5" /> Tambah Dompet
                </button>
            </div>

            {wallets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                        <Wallet className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Belum ada dompet digital</p>
                        <p className="text-xs text-muted-foreground mt-1">Tambahkan dompet digital untuk ditampilkan di undangan.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" /> Tambah Dompet Digital
                    </button>
                </div>
            ) : (
                <>
                    {/* Aktif di Undangan */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Aktif di Undangan</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {linkedWallets.length === 0 ? 'Belum ada dompet yang ditambahkan.' : `${linkedWallets.length} dompet dipilih`}
                                </p>
                            </div>
                            {linkedWallets.length > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                    {linkedWallets.length}
                                </span>
                            )}
                        </div>

                        {linkedWallets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                <p className="text-sm text-muted-foreground">Pilih dompet di bawah untuk ditampilkan di undangan.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {linkedWallets
                                    .sort((a, b) => a.display_order - b.display_order)
                                    .map((w, idx) => (
                                        <li key={w.id} className="flex items-center gap-3 px-5 py-3.5">
                                            {/* Order buttons */}
                                            <div className="flex flex-col gap-0.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => moveUp(w.id)}
                                                    disabled={idx === 0}
                                                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronUp className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveDown(w.id)}
                                                    disabled={idx === linkedWallets.length - 1}
                                                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronDown className="size-3.5" />
                                                </button>
                                            </div>

                                            {/* Logo */}
                                            <WalletProviderBadge provider={w.provider} providerLabel={w.provider_label} logoUrl={w.logo_url} />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{w.provider_label}</p>
                                                <p className="text-xs text-muted-foreground truncate">{w.account_number} · {w.account_name}</p>
                                                {w.qris_qr_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewQris(w)}
                                                        className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2 transition-colors"
                                                    >
                                                        <ZoomIn className="size-3" /> Lihat QRIS
                                                    </button>
                                                )}
                                            </div>

                                            {/* Tampilkan toggle */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-muted-foreground hidden sm:inline">Tampilkan</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDisplayed(w.id)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                                                        w.is_displayed ? 'bg-primary' : 'bg-muted'
                                                    }`}
                                                >
                                                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg transition-transform ${w.is_displayed ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* Unlink button */}
                                            <button
                                                type="button"
                                                onClick={() => toggleLinked(w.id)}
                                                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Hapus dari undangan"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    {/* Dompet tersedia */}
                    {unlinkedWallets.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <p className="text-sm font-semibold text-foreground">Dompet Tersedia</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Klik tombol + untuk menambahkan ke undangan.</p>
                            </div>
                            <ul className="divide-y divide-border">
                                {unlinkedWallets.map((w) => (
                                    <li key={w.id} className="flex items-center gap-3 px-5 py-3.5 opacity-60 hover:opacity-100 transition-opacity">
                                        <WalletProviderBadge provider={w.provider} providerLabel={w.provider_label} logoUrl={w.logo_url} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{w.provider_label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{w.account_number} · {w.account_name}</p>
                                            {w.qris_qr_url && (
                                                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                    <Check className="size-3" /> QRIS tersedia
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleLinked(w.id)}
                                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <Plus className="size-3.5" /> Tambahkan
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {/* Save status bar */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4 min-h-[44px]">
                <div className="flex items-center gap-2">
                    {saving && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" /> Menyimpan...
                        </span>
                    )}
                    {!saving && saveSuccess && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            <Check className="size-4" /> Tersimpan
                        </span>
                    )}
                    {!saving && saveError && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
                            <AlertTriangle className="size-4" /> Gagal menyimpan —
                            <button type="button" onClick={handleSave} className="underline underline-offset-2 hover:opacity-80">
                                coba lagi
                            </button>
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                >
                    <Save className="size-3.5" /> Simpan Manual
                </button>
            </div>
        </div>

        {showModal && (
            <AddWalletModal
                onClose={() => setShowModal(false)}
                onCreated={handleWalletCreated}
            />
        )}

        {previewQris?.qris_qr_url && (
            <QrisPreviewModal
                url={previewQris.qris_qr_url}
                providerLabel={previewQris.provider_label}
                accountName={previewQris.account_name}
                accountNumber={previewQris.account_number}
                onClose={() => setPreviewQris(null)}
            />
        )}
        </>
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
    availableThemes,
    guests,
    guestStats,
    guestFilters,
    comments,
    commentStats,
    commentFilters,
    invitationSettings,
    availableMusic,
    digitalWallets,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan Saya', href: '/customer/invitations' },
        { title: invitation.title, href: '#' },
    ];

    const { url } = usePage();
    const contentTabKeys: TabKey[] = EVENT_TYPE_TABS[eventType.name] ?? DEFAULT_TABS;
    const tabKeys: TabKey[] = [...contentTabKeys, ...MANAGEMENT_TABS];
    const initialTab: TabKey = url.endsWith('/settings') ? 'settings' : tabKeys[0];
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

    const isManagementTab = MANAGEMENT_TABS.includes(activeTab);
    const currentTabIndex = tabKeys.indexOf(activeTab);

    // ── State ─────────────────────────────────────────────────────────────────
    const [fieldValues,      setFieldValues]      = useState<Record<string, string>>(initFieldValues ?? {});
    const [status,           setStatus]           = useState<string>(invitation.status);
    const [submitting,       setSubmitting]       = useState(false);
    const [showSuccess,      setShowSuccess]      = useState(false);

    // Acara events — convert from props (no local id yet)
    const [acaraEvents, setAcaraEvents] = useState<AcaraEvent[]>(() => {
        const evs = (initAcaraEvents ?? []).map((ev, idx) => ({
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
            is_countdown:     ev.is_countdown ?? idx === 0,
        }));
        // ensure exactly one countdown is set when none is marked
        const hasCountdown = evs.some((e) => e.is_countdown);
        if (!hasCountdown && evs.length > 0) evs[0].is_countdown = true;
        return evs;
    });

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
        router.patch(`/customer/invitations/${invitation.slug}`, {
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
                is_countdown:     ev.is_countdown,
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
            case 'theme':
                return <ThemeTab currentTheme={theme} availableThemes={availableThemes} slug={invitation.slug} />;
            case 'guests':
                return <GuestsTab slug={invitation.slug} guests={guests} guestStats={guestStats} guestFilters={guestFilters} />;
            case 'comments':
                return <CommentsTab slug={invitation.slug} comments={comments} commentStats={commentStats} commentFilters={commentFilters} />;
            case 'digital_envelope':
                return <DigitalEnvelopeTab invitationSlug={invitation.slug} initWallets={digitalWallets} />;
            case 'settings':
                return <SettingsTab slug={invitation.slug} initSettings={invitationSettings} availableMusic={availableMusic ?? []} maxMusicMb={pkg.max_music_upload_mb ?? 10} />;
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
                        const isFirstManagement = key === MANAGEMENT_TABS[0];
                        return (
                            <div key={key} className="flex items-center">
                                {/* Separator before management tabs */}
                                {isFirstManagement && (
                                    <div className="h-5 w-px bg-border mx-1 self-center shrink-0" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                                        activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                    {/* Badge untuk jumlah */}
                                    {key === 'guests' && guestStats.total > 0 && (
                                        <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                            {guestStats.total}
                                        </span>
                                    )}
                                    {key === 'comments' && commentStats.pending > 0 && (
                                        <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                                            {commentStats.pending}
                                        </span>
                                    )}
                                </button>
                            </div>
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

                    {!isManagementTab && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        >
                            {submitting ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : <><Save className="size-4" /> Simpan Perubahan</>}
                        </button>
                    )}
                </div>
            </div>

            {showSuccess && (
                <SuccessToast message="Undangan berhasil diperbarui!" onClose={() => setShowSuccess(false)} />
            )}
        </CustomerLayout>
    );
}
