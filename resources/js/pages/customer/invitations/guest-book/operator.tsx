import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Camera, CheckCircle2, Download, QrCode, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface InvitationInfo {
    id: number;
    slug: string;
    title: string;
}

interface Stats {
    total: number;
    checkedIn: number;
    totalHeads: number;
}

interface DailyStat {
    date: string;
    label: string;
    count: number;
    heads: number;
}

interface GuestRow {
    id: number;
    name: string;
    slug: string | null;
    phone_number: string | null;
    category: string | null;
    rsvp_status: string;
    rsvp_headcount: number;
    checked_in_at: string | null;
    qr_code_data: string | null;
    notes: string | null;
}

interface DisplaySettings {
    background_image: string;
    background_color: string;
    overlay_color: string;
    overlay_opacity: number;
}

interface SliderImage {
    id: number;
    url: string;
}

interface Props {
    invitation: InvitationInfo;
    stats: Stats;
    dailyStats: DailyStat[];
    guests: GuestRow[];
    recentScans: GuestRow[];
    displaySettings: DisplaySettings;
    sliderImages: SliderImage[];
    filters: { status?: string };
}

type ScanStatus = 'idle' | 'success' | 'warning' | 'error';

function formatDateTime(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function csrfHeaders(): HeadersInit {
    const rawCookie = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') ?? '';
    const token = rawCookie ? decodeURIComponent(rawCookie) : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': token,
        'X-Requested-With': 'XMLHttpRequest',
    };
}

export default function GuestBookOperator({ invitation, stats: initialStats, dailyStats, guests: initialGuests, recentScans, displaySettings, sliderImages, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan', href: '/customer/invitations' },
        { title: invitation.title, href: `/customer/invitations/${invitation.slug}/edit` },
        { title: 'Petugas Buku Tamu', href: '#' },
    ];

    const [stats, setStats] = useState(initialStats);
    const [guests, setGuests] = useState(initialGuests);
    const [recent, setRecent] = useState(recentScans);
    const [selectedGuest, setSelectedGuest] = useState<GuestRow | null>(null);
    const [notice, setNotice] = useState<{ status: ScanStatus; message: string }>({ status: 'idle', message: 'Siap melakukan scan QR.' });
    const [query, setQuery] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [startingScanner, setStartingScanner] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerControlsRef = useRef<IScannerControls | null>(null);
    const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const lastCodeRef = useRef('');

    const filteredGuests = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return guests;
        return guests.filter((g) => [g.name, g.phone_number, g.slug, g.qr_code_data].some((v) => String(v ?? '').toLowerCase().includes(q)));
    }, [guests, query]);

    useEffect(() => {
        if (!sliderImages.length) return;
        const id = window.setInterval(() => setSlideIndex((i) => (i + 1) % sliderImages.length), 5000);
        return () => window.clearInterval(id);
    }, [sliderImages.length]);

    useEffect(() => () => stopScanner(), []);

    function updateGuest(next: GuestRow) {
        setSelectedGuest(next);
        setGuests((prev) => prev.map((g) => (g.id === next.id ? next : g)));
        setRecent((prev) => [next, ...prev.filter((g) => g.id !== next.id)].slice(0, 10));
    }

    async function submitScan(code: string) {
        const trimmed = code.trim();
        if (!trimmed) return;
        if (trimmed === lastCodeRef.current) return;
        lastCodeRef.current = trimmed;

        try {
            const res = await fetch(`/customer/invitations/${invitation.slug}/guests/scan`, {
                method: 'POST',
                headers: csrfHeaders(),
                body: JSON.stringify({ code: trimmed }),
            });
            const json = await res.json();
            if (json.guest) updateGuest(json.guest);
            if (json.stats) setStats(json.stats);

            if (res.status === 409) {
                setNotice({ status: 'warning', message: json.message ?? 'Tamu sudah pernah check-in.' });
            } else if (!res.ok) {
                setNotice({ status: 'error', message: json.message ?? 'QR tidak dikenali.' });
            } else {
                setNotice({ status: 'success', message: json.message ?? 'Check-in berhasil.' });
            }
        } catch {
            setNotice({ status: 'error', message: 'Gagal memproses QR. Periksa koneksi lalu coba lagi.' });
        } finally {
            window.setTimeout(() => { lastCodeRef.current = ''; }, 1800);
        }
    }

    async function manualCheckIn(guest: GuestRow) {
        try {
            const res = await fetch(`/customer/invitations/${invitation.slug}/guests/${guest.id}/manual-checkin`, {
                method: 'POST',
                headers: csrfHeaders(),
            });
            const json = await res.json();
            if (json.guest) updateGuest(json.guest);
            if (json.stats) setStats(json.stats);
            setNotice({ status: res.status === 409 ? 'warning' : 'success', message: json.message ?? 'Check-in diproses.' });
        } catch {
            setNotice({ status: 'error', message: 'Gagal check-in manual.' });
        }
    }

    async function startScanner() {
        if (!navigator.mediaDevices?.getUserMedia) {
            setNotice({ status: 'warning', message: 'Browser ini belum mendukung akses kamera. Gunakan input manual atau pencarian.' });
            return;
        }
        if (!videoRef.current) {
            setNotice({ status: 'error', message: 'Area kamera belum siap. Muat ulang halaman lalu coba lagi.' });
            return;
        }

        try {
            stopScanner();
            setStartingScanner(true);
            setNotice({ status: 'idle', message: 'Mengaktifkan kamera...' });

            const reader = qrReaderRef.current ?? new BrowserQRCodeReader();
            qrReaderRef.current = reader;

            const onDecode = (result?: { getText: () => string }) => {
                const text = result?.getText();
                if (text) void submitScan(text);
            };

            const stream = await openCameraStream();
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            scannerControlsRef.current = await reader.decodeFromStream(stream, videoRef.current, onDecode);

            setScanning(true);
            setNotice({ status: 'idle', message: 'Kamera aktif. Arahkan QR Code ke area scan.' });
        } catch (error) {
            stopScanner();
            setNotice({ status: 'error', message: 'Kamera tidak dapat diakses. Pastikan izin kamera aktif dan halaman dibuka melalui HTTPS atau localhost.' });
        } finally {
            setStartingScanner(false);
        }
    }

    async function openCameraStream(): Promise<MediaStream> {
        const cameraOptions: MediaStreamConstraints[] = [
            {
                video: {
                    facingMode: { exact: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            },
            {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            },
            { video: true, audio: false },
        ];

        let lastError: unknown = null;
        for (const constraints of cameraOptions) {
            try {
                return await navigator.mediaDevices.getUserMedia(constraints);
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    function stopScanner() {
        setScanning(false);
        setStartingScanner(false);
        scannerControlsRef.current?.stop();
        scannerControlsRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current?.srcObject instanceof MediaStream) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    const backgroundStyle = {
        backgroundColor: displaySettings.background_color,
        backgroundImage: displaySettings.background_image ? `url(${displaySettings.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const activeSlide = sliderImages[slideIndex];

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Petugas Buku Tamu - ${invitation.title}`} />
            <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6" style={backgroundStyle}>
                <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: displaySettings.overlay_color, opacity: displaySettings.overlay_opacity }} />
                <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-3">
                            <Link href={`/customer/invitations/${invitation.slug}/guests`} className="flex size-10 items-center justify-center rounded-xl border border-border hover:bg-muted">
                                <ArrowLeft className="size-4" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Buku Tamu Petugas</h1>
                                <p className="text-sm text-muted-foreground">{invitation.title}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a href={`/customer/invitations/${invitation.slug}/guests/export/excel?status=${filters.status ?? ''}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                                <Download className="size-4" /> Excel
                            </a>
                            <a target="_blank" href={`/customer/invitations/${invitation.slug}/guests/export/pdf?status=${filters.status ?? ''}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                                <Download className="size-4" /> PDF
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs text-muted-foreground">Total Tamu</p>
                            <p className="mt-1 text-3xl font-bold text-foreground">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs text-muted-foreground">Total Hadir</p>
                            <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.checkedIn}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs text-muted-foreground">Belum Hadir</p>
                            <p className="mt-1 text-3xl font-bold text-amber-600">{Math.max(stats.total - stats.checkedIn, 0)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs text-muted-foreground">Estimasi Kepala</p>
                            <p className="mt-1 text-3xl font-bold text-sky-600">{stats.totalHeads}</p>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
                        <section className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-foreground">Scan QR Code</h2>
                                    <p className="text-xs text-muted-foreground">Scan QR dari undangan tamu untuk check-in otomatis.</p>
                                </div>
                                <QrCode className="size-5 text-muted-foreground" />
                            </div>
                            <div className="relative overflow-hidden rounded-2xl bg-black">
                                <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
                                {!scanning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/65 px-5 text-center text-sm font-medium text-white">
                                        {startingScanner ? 'Membuka kamera...' : 'Tekan Mulai Scan untuk membuka kamera'}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <button disabled={startingScanner} onClick={scanning ? stopScanner : startScanner} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                                    <Camera className="size-4" /> {startingScanner ? 'Membuka Kamera...' : scanning ? 'Stop Kamera' : 'Mulai Scan'}
                                </button>
                                <form onSubmit={(e) => { e.preventDefault(); void submitScan(manualCode); setManualCode(''); }} className="flex gap-2">
                                    <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Kode QR / slug" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                                    <button className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted">OK</button>
                                </form>
                            </div>
                            <div className={`mt-3 rounded-xl px-3 py-2 text-sm ${notice.status === 'success' ? 'bg-emerald-50 text-emerald-700' : notice.status === 'warning' ? 'bg-amber-50 text-amber-700' : notice.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                                {notice.message}
                            </div>
                            {selectedGuest && (
                                <div className="mt-4 rounded-2xl border border-border p-4">
                                    <p className="text-xs text-muted-foreground">Data tamu terakhir</p>
                                    <p className="mt-1 text-xl font-bold text-foreground">{selectedGuest.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedGuest.phone_number ?? '-'} · {selectedGuest.category ?? 'Tanpa kategori'}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div className="rounded-xl bg-muted p-3"><span className="block text-xs text-muted-foreground">Jumlah tamu</span>{selectedGuest.rsvp_headcount}</div>
                                        <div className="rounded-xl bg-muted p-3"><span className="block text-xs text-muted-foreground">Status</span>{selectedGuest.checked_in_at ? 'Sudah hadir' : 'Belum hadir'}</div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            {activeSlide && <img src={activeSlide.url} alt="" className="mb-4 aspect-[16/7] w-full rounded-2xl object-cover" />}
                            <h2 className="font-semibold text-foreground">Manajemen Kehadiran</h2>
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border px-3">
                                <Search className="size-4 text-muted-foreground" />
                                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, WhatsApp, atau kode undangan" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
                            </div>
                            <div className="mt-4 max-h-[470px] space-y-2 overflow-y-auto pr-1">
                                {filteredGuests.map((guest) => (
                                    <div key={guest.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{guest.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{guest.phone_number ?? '-'} · {guest.slug ?? guest.qr_code_data ?? '-'}</p>
                                            <p className="text-xs text-muted-foreground">Check-in: {formatDateTime(guest.checked_in_at)}</p>
                                        </div>
                                        {guest.checked_in_at ? (
                                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="size-3" /> Hadir</span>
                                        ) : (
                                            <button onClick={() => void manualCheckIn(guest)} className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Check-in</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <h2 className="font-semibold text-foreground">Statistik Kehadiran per Hari</h2>
                            <div className="mt-3 space-y-2">
                                {dailyStats.length ? dailyStats.map((day) => (
                                    <div key={day.date} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                                        <span>{day.label}</span>
                                        <span className="font-semibold">{day.count} tamu · {day.heads} kepala</span>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">Belum ada check-in.</p>}
                            </div>
                        </section>
                        <section className="rounded-2xl border border-white/20 bg-background/95 p-4 shadow-sm backdrop-blur">
                            <h2 className="font-semibold text-foreground">Riwayat Scan Terbaru</h2>
                            <div className="mt-3 space-y-2">
                                {recent.length ? recent.map((guest) => (
                                    <div key={guest.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                                        <span className="font-medium">{guest.name}</span>
                                        <span className="text-muted-foreground">{formatDateTime(guest.checked_in_at)}</span>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">Belum ada riwayat scan.</p>}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
