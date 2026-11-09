import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Ikon } from './Ikon';

interface Ucapan {
    nama: string;
    isi: string;
    waktu: string;
}

interface BukuTamuProps {
    endpoint: string;
    bolehTulis: boolean;
    /** Kunci localStorage saat undangan tidak punya endpoint (ucapan hanya di perangkat tamu). */
    kunciLokal: string;
    onTerkirim: () => void;
}

const bacaLokal = (kunci: string): Ucapan[] => {
    try {
        return JSON.parse(localStorage.getItem(kunci) || '[]');
    } catch {
        return [];
    }
};
const simpanLokal = (kunci: string, data: Ucapan[]) => {
    try {
        localStorage.setItem(kunci, JSON.stringify(data));
    } catch {
        /* penyimpanan diblokir (mode privat) — ucapan tetap tampil selama sesi ini */
    }
};

/** Tanggal ISO → "19 Des"; teks dari server (mis. "2 jam yang lalu") ditampilkan apa adanya. */
function waktuTampil(w: string): string {
    if (!/^\d{4}-\d{2}-\d{2}/.test(w)) return w;
    const d = new Date(w.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? w : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* Buku tamu & doa. Setiap ucapan terkirim menaburkan melati pada adegan 3D. */
export default function BukuTamu({ endpoint, bolehTulis, kunciLokal, onTerkirim }: BukuTamuProps) {
    const [daftar, setDaftar] = useState<Ucapan[]>([]);
    const [halaman, setHalaman] = useState(1);
    const [adaLagi, setAdaLagi] = useState(false);
    const [memuat, setMemuat] = useState(false);
    const [nama, setNama] = useState('');
    const [isi, setIsi] = useState('');
    const [galat, setGalat] = useState('');
    const [mengirim, setMengirim] = useState(false);

    const muatServer = useCallback(
        async (hal: number): Promise<Ucapan[]> => {
            const r = await fetch(`${endpoint}?page=${hal}`, { headers: { Accept: 'application/json' } });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            const items: Ucapan[] = (d.wishes ?? []).map((w: { name?: string; message?: string; date?: string }) => ({
                nama: w.name ?? '',
                isi: w.message ?? '',
                waktu: w.date ?? '',
            }));
            setAdaLagi(d.last_page ? hal < d.last_page : items.length >= 10);
            return items;
        },
        [endpoint],
    );

    useEffect(() => {
        let batal = false;
        if (endpoint) {
            muatServer(1)
                .then((items) => {
                    if (!batal) setDaftar(items);
                })
                .catch(() => {});
        } else {
            setDaftar(bacaLokal(kunciLokal).slice().reverse());
        }
        return () => {
            batal = true;
        };
    }, [endpoint, kunciLokal, muatServer]);

    const muatLagi = async () => {
        setMemuat(true);
        try {
            const items = await muatServer(halaman + 1);
            setDaftar((d) => [...d, ...items]);
            setHalaman((h) => h + 1);
        } catch {
            setAdaLagi(false);
        } finally {
            setMemuat(false);
        }
    };

    const kirim = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const n = nama.trim(),
            u = isi.trim();
        if (!n || !u) {
            setGalat('Isi nama dan ucapan terlebih dahulu.');
            return;
        }
        setGalat('');
        const baru: Ucapan = { nama: n, isi: u, waktu: new Date().toISOString() };
        if (endpoint) {
            setMengirim(true);
            try {
                const r = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ name: n, message: u }),
                });
                if (!r.ok) {
                    const d = await r.json().catch(() => ({}));
                    setGalat(d?.message || 'Ucapan belum terkirim. Silakan coba lagi.');
                    return;
                }
            } catch {
                setGalat('Ucapan belum terkirim. Periksa koneksi internet Anda.');
                return;
            } finally {
                setMengirim(false);
            }
        } else {
            simpanLokal(kunciLokal, [...bacaLokal(kunciLokal), baru]);
        }
        setDaftar((d) => [baru, ...d]);
        setIsi('');
        onTerkirim();
    };

    return (
        <div>
            <h3 className="wt13-judul-ikon">
                <Ikon nama="buku" />
                Buku Tamu &amp; Doa
            </h3>
            {bolehTulis && (
                <form noValidate style={{ marginTop: 12 }} onSubmit={kirim}>
                    <div>
                        <label htmlFor="wt13-ucap-nama">Nama</label>
                        <input id="wt13-ucap-nama" autoComplete="name" required value={nama} onChange={(e) => setNama(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="wt13-ucap-isi">Ucapan &amp; doa</label>
                        <textarea id="wt13-ucap-isi" required maxLength={1000} value={isi} onChange={(e) => setIsi(e.target.value)} />
                    </div>
                    <p className="wt13-galat" role="alert" hidden={!galat}>
                        {galat}
                    </p>
                    <button className="wt13-btn wt13-btn-garis" type="submit" disabled={mengirim}>
                        {mengirim ? 'Mengirim…' : 'Kirim Ucapan'}
                    </button>
                    {!endpoint && <p className="wt13-kecil">Ucapan disimpan di perangkat ini. Agar terbaca mempelai, kirim juga lewat WhatsApp.</p>}
                </form>
            )}
            <div className="wt13-ucapan" style={{ marginTop: 14 }}>
                {!daftar.length && <p className="wt13-kecil">Belum ada ucapan. Jadilah yang pertama mendoakan.</p>}
                {daftar.map((u, i) => (
                    <article key={`${u.nama}-${u.waktu}-${i}`}>
                        <b>
                            {u.nama}
                            {u.waktu && <small>{waktuTampil(u.waktu)}</small>}
                        </b>
                        <p>{u.isi}</p>
                    </article>
                ))}
                {adaLagi && (
                    <div>
                        <button className="wt13-btn wt13-btn-garis wt13-btn-kecil" type="button" onClick={muatLagi} disabled={memuat}>
                            {memuat ? 'Memuat…' : 'Muat ucapan lainnya'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
