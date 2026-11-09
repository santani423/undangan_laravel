/* =====================================================================
   Wedding Theme 13 — Pangantén Sunda (undangan pernikahan 3D)
   Taman Sunda yang dijelajahi sambil menggulir: jalan batu → uleman di tiang jati →
   lukisan pangantén → sasak carita asih → pendopo julang ngapak.
   Port React dari src/ (index.html, ui.js, musik.js, adegan.js).
   ===================================================================== */
import GuestQrCode from '@/components/invitation/GuestQrCode';
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import BukuTamu from './components/BukuTamu';
import DokNavigasi, { type ItemDok } from './components/DokNavigasi';
import FormRsvp from './components/FormRsvp';
import HitungMundur from './components/HitungMundur';
import { Ikon, Ornamen, SpriteIkon } from './components/Ikon';
import Lightbox from './components/Lightbox';
import Pemuat from './components/Pemuat';
import TandaKasih from './components/TandaKasih';
import { buatAdegan, type Adegan, type DataAdegan } from './lib/adegan';
import { bangunData, ILUSTRASI_PANGANTEN, KISAH_CONTOH, MAKS_BINGKAI_KISAH, rentangJam, TEKS } from './lib/data';
import { muatThree, webglOk } from './lib/muatThree';
import { useMusikLatar } from './lib/musik';
import './wedding-theme-13.css';

interface WeddingTheme13Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

type SumberBuka = 'awal' | 'tombol' | 'gulir';

const FONT_ID = 'wt13-font';
const FONT_URL =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap';

/** Pasang lembar gaya Google Fonts tema. `siap` selesai saat termuat (atau gagal / 4 detik). */
function pasangFont(): { siap: Promise<void>; lepas: () => void } {
    const ada = document.getElementById(FONT_ID) as HTMLLinkElement | null;
    const link = ada ?? document.createElement('link');
    if (!ada) {
        link.id = FONT_ID;
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        document.head.appendChild(link);
    }
    const siap = new Promise<void>((resolve) => {
        if (ada?.sheet) return resolve();
        const batas = window.setTimeout(resolve, 4000);
        const selesai = () => {
            window.clearTimeout(batas);
            resolve();
        };
        link.addEventListener('load', selesai, { once: true });
        link.addEventListener('error', selesai, { once: true });
    });
    return { siap, lepas: () => !ada && link.remove() };
}

const NAV: ItemDok[] = [
    { id: 'sumping', ikon: 'rumah', label: 'Sumping' },
    { id: 'uleman', ikon: 'surat', label: 'Uleman' },
    { id: 'panganten', ikon: 'hati', label: 'Mempelai' },
    { id: 'carita', ikon: 'buku', label: 'Kisah' },
    { id: 'mapag', ikon: 'kalender', label: 'Acara' },
    { id: 'panineungan', ikon: 'hadiah', label: 'Hadiah' },
];

/** Panel gading tembus pandang. `tunda` terisi saat panel memasuki layar (animasi naik bertahap). */
function Panel({
    kunci,
    tunda,
    lekat = false,
    className = '',
    children,
}: {
    kunci: string;
    tunda?: number;
    lekat?: boolean;
    className?: string;
    children: ReactNode;
}) {
    const kelas = ['wt13-panel', lekat && 'wt13-lekat', tunda !== undefined && 'wt13-tampil', className].filter(Boolean).join(' ');
    return (
        <div data-panel={kunci} className={kelas} style={tunda ? { animationDelay: `${tunda}s` } : undefined}>
            {children}
        </div>
    );
}

export default function WeddingTheme13({ invitation, visitor, greeting }: WeddingTheme13Props) {
    const data = useMemo(() => bangunData(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const fitur = invitation.features ?? {};
    const aktif = (k: string) => fitur[k] !== false;

    const tampilProfil = aktif('couple_profile');
    const tampilHitung = aktif('countdown') && !!data.hitungMundur;
    const tampilKisah = aktif('love_story') && data.kisah.length > 0;
    const tampilGaleri = aktif('gallery') && data.galeri.length > 0;
    const tampilVideo = aktif('video') && !!data.video;
    const tampilAcara = aktif('event_detail') && data.acara.length > 0;
    const tampilLokasi = aktif('location') && !!(data.lokasi.nama || data.lokasi.alamat || data.lokasi.peta);
    const tampilKalender = aktif('add_to_calendar') && !!data.kalender;
    const tampilRsvp = aktif('rsvp');
    const tampilHadiah = aktif('digital_envelope') && (data.rekening.length > 0 || data.dompet.length > 0);
    const tampilUcapan = aktif('wishes');
    const tampilMusik = aktif('music');
    const tampilTamu = aktif('greeting');

    const bagian: Record<string, boolean> = {
        sumping: true,
        uleman: true,
        panganten: tampilProfil || tampilHitung,
        carita: tampilKisah || tampilGaleri || tampilVideo,
        mapag: tampilAcara || tampilLokasi || tampilRsvp,
        panineungan: true,
    };
    const navItem = NAV.filter((n) => bagian[n.id]);
    const navKunci = navItem.map((n) => n.id).join(',');

    // Kisah yang dipasang sebagai bingkai foto di sepanjang sasak pada adegan 3D.
    const jumlahBingkai = tampilKisah ? Math.min(data.kisah.length, MAKS_BINGKAI_KISAH) : 0;
    const dataAdegan = useMemo<DataAdegan>(
        () => ({
            pria: data.pria,
            wanita: data.wanita,
            monogram: data.monogram,
            semboyan: TEKS.semboyan,
            tanggalKartu: data.tanggalKartu,
            lokasiNama: data.lokasi.nama,
            kisah: data.kisah.slice(0, jumlahBingkai).map((k, i) => ({
                tahun: k.tahun,
                judul: k.judul,
                foto: k.foto,
                fotoCadangan: KISAH_CONTOH[i % KISAH_CONTOH.length],
            })),
        }),
        [data, jumlahBingkai],
    );

    const rootRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const adeganRef = useRef<Adegan | null>(null);
    const fontRef = useRef<Promise<void>>(Promise.resolve());
    const sumberRef = useRef<SumberBuka>('awal');

    const [kurangiGerak, setKurangiGerak] = useState(false);
    const [tanpa3d, setTanpa3d] = useState(false);
    const [progres, setProgres] = useState(0);
    const [pemuatSelesai, setPemuatSelesai] = useState(false);
    const [pemuatHilang, setPemuatHilang] = useState(false);
    const [masuk, setMasuk] = useState(false);
    const [adeganSiap, setAdeganSiap] = useState(false);
    // Fitur "cover" nonaktif: uleman langsung terbuka tanpa menunggu tombol.
    const [terbuka, setTerbuka] = useState(() => invitation.features?.cover === false);
    const terbukaRef = useRef(terbuka);
    const [liniAktif, setLiniAktif] = useState(0);
    const [bagianAktif, setBagianAktif] = useState('sumping');
    const [tampil, setTampil] = useState<Record<string, number>>({});
    const [lightbox, setLightbox] = useState<number | null>(null);

    const musik = useMusikLatar(data.musik?.url ?? '', data.musik?.loop ?? true);
    // Musik unggahan mengikuti setelan autoplay undangan; musik bawaan tema diputar saat undangan dibuka.
    const putarSaatDibuka = data.musik ? data.musik.autoplay : true;

    const bukaUndangan = useCallback((sumber: SumberBuka) => {
        if (terbukaRef.current) return;
        terbukaRef.current = true;
        sumberRef.current = sumber;
        setTerbuka(true);
    }, []);

    const klikBuka = () => {
        // dipanggil langsung di dalam klik agar browser mengizinkan audio berbunyi
        if (tampilMusik && putarSaatDibuka && !musik.main) musik.putar();
        bukaUndangan('tombol');
    };

    const tutupLightbox = useCallback(() => setLightbox(null), []);
    const taburMelati = useCallback(() => adeganRef.current?.taburMelati(), []);

    useEffect(() => {
        const font = pasangFont();
        fontRef.current = font.siap;
        return font.lepas;
    }, []);

    useEffect(() => {
        setKurangiGerak(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    /* ---------- adegan 3D ---------- */
    useEffect(() => {
        const kanvas = canvasRef.current;
        if (!kanvas) return;
        let batal = false;
        let adegan: Adegan | null = null;
        const tutupPemuat = () => {
            if (!batal) setPemuatSelesai(true);
        };
        const darurat = window.setTimeout(tutupPemuat, 14000);
        const nonaktif = (err?: unknown) => {
            if (batal) return;
            if (err) console.warn('Adegan 3D dinonaktifkan:', err);
            setTanpa3d(true);
            tutupPemuat();
        };

        if (!webglOk()) nonaktif();
        else
            muatThree().then(() => {
                if (batal) return;
                try {
                    adegan = buatAdegan({
                        canvas: kanvas,
                        data: dataAdegan,
                        kurangiGerak: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                        bagian: (id) => document.getElementById(id),
                        fontSiap: fontRef.current,
                        onProgres: (p) => !batal && setProgres(p),
                        onSiap: () => {
                            if (batal) return;
                            setProgres(1);
                            setAdeganSiap(true);
                            tutupPemuat();
                        },
                        onKisah: (i) => !batal && setLiniAktif(i),
                    });
                    adeganRef.current = adegan;
                } catch (err) {
                    nonaktif(err);
                }
            }, nonaktif);

        return () => {
            batal = true;
            window.clearTimeout(darurat);
            adegan?.hancurkan();
            adeganRef.current = null;
            setAdeganSiap(false);
        };
    }, [dataAdegan]);

    // amplop di tiang uleman dibuka begitu adegan siap & undangan dibuka
    useEffect(() => {
        if (terbuka && adeganSiap) adeganRef.current?.buka(sumberRef.current === 'awal');
    }, [terbuka, adeganSiap]);

    /* ---------- pemuat ---------- */
    useEffect(() => {
        if (!pemuatSelesai) return;
        setProgres(1);
        if (!kurangiGerak) setMasuk(true);
        adeganRef.current?.hitungUlang();
        const t = window.setTimeout(() => setPemuatHilang(true), 1100);
        return () => window.clearTimeout(t);
    }, [pemuatSelesai, kurangiGerak]);

    /* ---------- gulir melewati 62% bagian uleman membuka undangan dengan sendirinya ---------- */
    useEffect(() => {
        if (terbuka) return;
        const el = document.getElementById('uleman');
        if (!el) return;
        const cek = () => {
            const r = el.getBoundingClientRect();
            const jarak = el.offsetHeight - window.innerHeight;
            const prog = jarak > 0 ? -r.top / jarak : r.top <= 0 ? 1 : 0;
            if (prog > 0.62) bukaUndangan('gulir');
        };
        cek();
        window.addEventListener('scroll', cek, { passive: true });
        return () => window.removeEventListener('scroll', cek);
    }, [terbuka, bukaUndangan]);

    /* ---------- jangkar bidikan kamera mengikuti perubahan tinggi konten ---------- */
    useEffect(() => {
        const main = mainRef.current;
        if (!main || typeof ResizeObserver === 'undefined') return;
        let raf = 0;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => adeganRef.current?.hitungUlang());
        });
        ro.observe(main);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, []);

    /* ---------- dok navigasi: tandai bagian aktif ---------- */
    useEffect(() => {
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((en) => {
                    if (en.isIntersecting) setBagianAktif(en.target.id);
                }),
            { rootMargin: '-45% 0px -45% 0px' },
        );
        navKunci.split(',').forEach((id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, [navKunci]);

    /* ---------- panel naik bertahap saat memasuki layar (hanya bersama adegan 3D) ---------- */
    useEffect(() => {
        const root = rootRef.current;
        if (!adeganSiap || kurangiGerak || !root) return;
        const io = new IntersectionObserver(
            (es) => {
                const baru = es.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
                if (!baru.length) return;
                baru.forEach((el) => io.unobserve(el));
                setTampil((t) => {
                    const n = { ...t };
                    baru.forEach((el, i) => {
                        const k = el.dataset.panel;
                        if (k && !(k in n)) n[k] = i * 0.12;
                    });
                    return n;
                });
            },
            { rootMargin: '0px 0px -8% 0px' },
        );
        root.querySelectorAll<HTMLElement>('[data-panel]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [adeganSiap, kurangiGerak]);

    const kelasRoot = ['wt13-root', !pemuatSelesai && 'wt13-memuat', tanpa3d && 'wt13-tanpa3d'].filter(Boolean).join(' ');

    return (
        <div ref={rootRef} className={kelasRoot}>
            <SpriteIkon />
            <canvas ref={canvasRef} className="wt13-scene" aria-hidden="true" />

            {!pemuatHilang && <Pemuat nama={`${data.pria} & ${data.wanita}`} progres={progres} selesai={pemuatSelesai} />}

            {tampilMusik && (
                <button
                    className="wt13-musik-btn"
                    type="button"
                    aria-pressed={musik.main}
                    aria-label={musik.main ? 'Hentikan musik latar' : 'Putar musik latar'}
                    onClick={musik.alih}
                >
                    <Ikon nama="musik" />
                </button>
            )}

            <DokNavigasi item={navItem} aktif={bagianAktif} />

            <main ref={mainRef} className="wt13-main">
                {/* Adegan 1 — Wilujeng Sumping */}
                <section id="sumping" className="wt13-bagian wt13-sumping wt13-wrap" aria-label="Wilujeng Sumping">
                    <div className={masuk ? 'wt13-sambut wt13-masuk' : 'wt13-sambut'}>
                        <p className="wt13-salam">Wilujeng Sumping</p>
                        <h1>
                            {data.pria} <span className="wt13-amp">&amp;</span> {data.wanita}
                        </h1>
                        <p className="wt13-semboyan">{TEKS.semboyan}</p>
                        {data.tanggalTampil && <p className="wt13-tgl">{data.tanggalTampil}</p>}
                        {tampilTamu && (
                            <div className="wt13-tamu">
                                <small>{data.salamTamu}</small>
                                <b>{data.tamu || data.labelTamu}</b>
                            </div>
                        )}
                        {invitation.guestQrData && (
                            <div className="wt13-qr-tamu">
                                <GuestQrCode data={invitation.guestQrData} size={96} />
                                <small>QR Check-in Tamu</small>
                            </div>
                        )}
                        <p className="wt13-petunjuk">Gulir untuk memasuki taman</p>
                        <div className="wt13-bingkai-statis">
                            <img
                                src={ILUSTRASI_PANGANTEN}
                                alt="Ilustrasi pengantin Sunda: pria berbendo dan berjas gading, wanita bersiger dengan roncean melati"
                            />
                        </div>
                    </div>
                </section>

                {/* Adegan 2 — Uleman */}
                <section id="uleman" className="wt13-bagian wt13-uleman wt13-wrap wt13-kanan" aria-label="Undangan">
                    <Panel kunci="uleman" tunda={tampil.uleman} lekat className={terbuka ? 'wt13-terbuka' : ''}>
                        <p className="wt13-eyebrow">Uleman</p>
                        <div className="wt13-uleman-tertutup">
                            <h2>
                                Sapucuk surat <em>kanggo anjeun.</em>
                            </h2>
                            <p className="wt13-lead">Sepucuk undangan telah menanti di atas tiang kayu jati. Buka segelnya untuk membaca isinya.</p>
                            <div className="wt13-baris-btn">
                                <button className="wt13-btn wt13-btn-utama" type="button" onClick={klikBuka}>
                                    <Ikon nama="surat" />
                                    {data.tombolBuka}
                                </button>
                            </div>
                            <p className="wt13-kecil">Atau terus gulir, undangan akan terbuka dengan sendirinya.</p>
                        </div>
                        <div className="wt13-uleman-dibuka" aria-live="polite">
                            <h2>
                                Kalayan <em>hormat,</em>
                            </h2>
                            <p className="wt13-lead">{data.pembuka}</p>
                            <Ornamen kiri />
                            <p className="wt13-lead">
                                Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
                            </p>
                            {data.kutipan && <blockquote className="wt13-kutipan">{data.kutipan}</blockquote>}
                        </div>
                    </Panel>
                </section>

                {/* Adegan 3 — Pangantén */}
                {bagian.panganten && (
                    <section id="panganten" className="wt13-bagian wt13-wrap wt13-kiri" aria-label="Mempelai">
                        <Panel kunci="panganten" tunda={tampil.panganten}>
                            <p className="wt13-eyebrow">Pangantén</p>
                            <Ornamen kiri />
                            {tampilProfil && (
                                <div className="wt13-pasangan">
                                    <div>
                                        <p className="wt13-nama">{data.pria}</p>
                                        {data.priaLengkap && <p className="wt13-lengkap">{data.priaLengkap}</p>}
                                        {data.priaKet && <p>{data.priaKet}</p>}
                                        {data.priaOrtu && <p>{data.priaOrtu}</p>}
                                    </div>
                                    <span className="wt13-dan" aria-hidden="true">
                                        &amp;
                                    </span>
                                    <div>
                                        <p className="wt13-nama">{data.wanita}</p>
                                        {data.wanitaLengkap && <p className="wt13-lengkap">{data.wanitaLengkap}</p>}
                                        {data.wanitaKet && <p>{data.wanitaKet}</p>}
                                        {data.wanitaOrtu && <p>{data.wanitaOrtu}</p>}
                                    </div>
                                </div>
                            )}
                            {tampilHitung && (
                                <>
                                    <p className="wt13-kecil" style={{ textAlign: 'center' }}>
                                        Menuju hari bahagia
                                    </p>
                                    <HitungMundur target={data.hitungMundur} />
                                </>
                            )}
                        </Panel>
                    </section>
                )}

                {/* Adegan 4 — Carita Asih */}
                {bagian.carita && (
                    <section
                        id="carita"
                        className="wt13-bagian wt13-carita wt13-wrap wt13-kanan"
                        aria-label="Kisah cinta"
                        style={{ minHeight: `${Math.max(150, 85 * jumlahBingkai)}vh` }}
                    >
                        <Panel kunci="carita" tunda={tampil.carita} lekat>
                            <p className="wt13-eyebrow">Carita Asih</p>
                            <h2>
                                Lalakon <em>urang duaan.</em>
                            </h2>
                            {tampilKisah && (
                                <ol className="wt13-lini">
                                    {data.kisah.map((k, i) => (
                                        <li key={i} className={i === liniAktif ? 'wt13-aktif' : undefined}>
                                            {k.tahun && <time>{k.tahun}</time>}
                                            <b>{k.judul}</b>
                                            {k.teks && <p>{k.teks}</p>}
                                        </li>
                                    ))}
                                </ol>
                            )}
                            {tampilGaleri && (
                                <div>
                                    <p className="wt13-kecil" style={{ marginBottom: 8 }}>
                                        Galeri {data.galeriContoh && <span className="wt13-label-contoh">foto contoh</span>}
                                    </p>
                                    <div className="wt13-galeri">
                                        {data.galeri.map((src, i) => (
                                            <button key={i} type="button" aria-label={`Buka foto ${i + 1}`} onClick={() => setLightbox(i)}>
                                                <img src={src} alt={`Foto galeri ${i + 1}`} loading="lazy" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {tampilVideo && (
                                <div className="wt13-video">
                                    <iframe
                                        src={data.video}
                                        title="Video mempelai"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </Panel>
                    </section>
                )}

                {/* Adegan 5 — Mapag Pangantén */}
                {bagian.mapag && (
                    <section id="mapag" className="wt13-bagian wt13-mapag wt13-wrap wt13-kiri" aria-label="Acara dan RSVP">
                        <Panel kunci="mapag" tunda={tampil.mapag}>
                            <p className="wt13-eyebrow">Mapag Pangantén</p>
                            <h2>
                                Rangkaian <em>acara.</em>
                            </h2>
                            {data.tanggalTampil && <p className="wt13-lead">{data.tanggalTampil}</p>}
                            {tampilAcara && (
                                <div className="wt13-jadwal">
                                    {data.acara.map((a, i) => (
                                        <article key={i}>
                                            <span className="wt13-ikon">
                                                <Ikon nama="kalender" />
                                            </span>
                                            <div>
                                                <h3>{a.nama}</h3>
                                                <p className="wt13-jam">
                                                    {data.acaraBedaTanggal && a.tanggalTampil ? `${a.tanggalTampil} · ` : ''}
                                                    {rentangJam(a)}
                                                </p>
                                                {a.tempat && <p className="wt13-kecil">{a.tempat}</p>}
                                                {a.alamat && a.alamat !== data.lokasi.alamat && <p className="wt13-kecil">{a.alamat}</p>}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                            {tampilLokasi && (data.lokasi.nama || data.lokasi.alamat) && (
                                <div className="wt13-alamat">
                                    <span className="wt13-ikon">
                                        <Ikon nama="lokasi" />
                                    </span>
                                    <div>
                                        <h3>{data.lokasi.nama}</h3>
                                        <p className="wt13-kecil">{data.lokasi.alamat}</p>
                                    </div>
                                </div>
                            )}
                            {((tampilLokasi && data.lokasi.peta) || tampilKalender) && (
                                <div className="wt13-baris-btn">
                                    {tampilLokasi && data.lokasi.peta && (
                                        <a className="wt13-btn wt13-btn-utama wt13-btn-kecil" href={data.lokasi.peta} target="_blank" rel="noopener">
                                            <Ikon nama="lokasi" />
                                            Buka Google Maps
                                        </a>
                                    )}
                                    {tampilKalender && (
                                        <a className="wt13-btn wt13-btn-garis wt13-btn-kecil" href={data.kalender} target="_blank" rel="noopener">
                                            <Ikon nama="kalender" />
                                            Simpan ke Kalender
                                        </a>
                                    )}
                                </div>
                            )}
                            {data.dressCode.length > 0 && (
                                <p className="wt13-kecil">
                                    Dress code:
                                    {data.dressCode.map((d, i) => (
                                        <span key={i}>
                                            {i > 0 && ','}
                                            {d.hex && <i className="wt13-warna" style={{ background: d.hex }} aria-hidden="true" />}
                                            {!d.hex && ' '}
                                            {d.nama}
                                        </span>
                                    ))}
                                </p>
                            )}
                            {tampilRsvp && (
                                <>
                                    <Ornamen />
                                    <FormRsvp
                                        endpoint={invitation.rsvpEndpoint ?? ''}
                                        guestSlug={invitation.guestSlug}
                                        namaAwal={data.tamu}
                                        pria={data.pria}
                                        wanita={data.wanita}
                                        tanggalTampil={data.tanggalTampil}
                                        batas={data.batasRsvp}
                                    />
                                </>
                            )}
                        </Panel>
                    </section>
                )}

                {/* Adegan 6 — Doa & Panineungan */}
                <section id="panineungan" className="wt13-bagian wt13-panineungan wt13-wrap wt13-kanan" aria-label="Hadiah, buku tamu, dan penutup">
                    <Panel kunci="panineungan" tunda={tampil.panineungan}>
                        <p className="wt13-eyebrow">Doa &amp; Panineungan</p>
                        {tampilHadiah && (
                            <>
                                <TandaKasih rekening={data.rekening} dompet={data.dompet} />
                                <Ornamen />
                            </>
                        )}
                        {tampilUcapan && (
                            <>
                                <BukuTamu
                                    endpoint={invitation.wishesEndpoint ?? ''}
                                    bolehTulis={invitation.allowComments !== false}
                                    kunciLokal={`wt13-ucapan-${invitation.code || invitation.slug}`}
                                    onTerkirim={taburMelati}
                                />
                                <Ornamen />
                            </>
                        )}
                        <div className="wt13-penutup">
                            <p className="wt13-salam">{TEKS.penutup}</p>
                            <p className="wt13-nama">
                                {data.pria} <em>&amp;</em> {data.wanita}
                            </p>
                        </div>
                    </Panel>
                </section>
            </main>

            {aktif('footer') && (
                <footer className="wt13-footer wt13-wrap">
                    Undangan digital oleh{' '}
                    <a href="/" target="_blank" rel="noopener">
                        Undesia
                    </a>
                </footer>
            )}

            {lightbox !== null && data.galeri.length > 0 && (
                <Lightbox foto={data.galeri} indeks={lightbox} onTutup={tutupLightbox} onPindah={setLightbox} />
            )}
        </div>
    );
}
