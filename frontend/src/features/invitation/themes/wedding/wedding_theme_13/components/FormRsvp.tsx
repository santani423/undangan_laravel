import { useRef, useState, type FormEvent } from 'react';
import { MAKS_TAMU, waUrl } from '../lib/data';
import { Ikon } from './Ikon';

interface FormRsvpProps {
    endpoint: string;
    guestSlug?: string;
    namaAwal: string;
    pria: string;
    wanita: string;
    tanggalTampil: string;
    batas: string;
}

interface Hasil {
    status: string;
    pesan: string;
}

/* Konfirmasi kehadiran: tersimpan ke server undangan, dan pesan siap dikirim lewat WhatsApp. */
export default function FormRsvp({ endpoint, guestSlug, namaAwal, pria, wanita, tanggalTampil, batas }: FormRsvpProps) {
    const [nama, setNama] = useState(namaAwal);
    const [jumlah, setJumlah] = useState('1');
    const [hadir, setHadir] = useState<'ya' | 'tidak'>('ya');
    const [galat, setGalat] = useState(false);
    const [mengirim, setMengirim] = useState(false);
    const [hasil, setHasil] = useState<Hasil | null>(null);
    const namaRef = useRef<HTMLInputElement>(null);

    const kirim = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const n = nama.trim();
        setGalat(!n);
        if (!n) {
            namaRef.current?.focus();
            return;
        }
        const ya = hadir === 'ya';
        const pesan = `Sampurasun, saya ${n}. ${ya ? `Insya Allah hadir (${jumlah} orang)` : 'Mohon maaf, saya berhalangan hadir'} di pernikahan ${pria} & ${wanita}${tanggalTampil ? `, ${tanggalTampil}` : ''}.`;
        let status = 'Konfirmasi belum terkirim. Tekan tombol di bawah untuk mengirimnya lewat WhatsApp.';
        if (endpoint) {
            setMengirim(true);
            try {
                const r = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({
                        name: n,
                        number_of_guests: Number(jumlah),
                        rsvp_status: ya ? 'attending' : 'not_attending',
                        guest_slug: guestSlug || undefined,
                    }),
                });
                status = r.ok
                    ? 'Konfirmasi tercatat. Terima kasih! Anda juga dapat mengabari lewat WhatsApp.'
                    : 'Server konfirmasi tidak merespons. Silakan kirim lewat WhatsApp.';
            } catch {
                status = 'Server konfirmasi tidak dapat dihubungi. Silakan kirim lewat WhatsApp.';
            } finally {
                setMengirim(false);
            }
        }
        setHasil({ status, pesan });
    };

    return (
        <div>
            <h3 className="wt13-judul-ikon">
                <Ikon nama="rsvp" />
                Konfirmasi Kehadiran
            </h3>
            {batas && (
                <p className="wt13-kecil" style={{ marginTop: 6 }}>
                    Mohon konfirmasi sebelum {batas}.
                </p>
            )}
            <form noValidate style={{ marginTop: 12 }} onSubmit={kirim}>
                <div className="wt13-dua">
                    <div>
                        <label htmlFor="wt13-rsvp-nama">Nama</label>
                        <input
                            ref={namaRef}
                            id="wt13-rsvp-nama"
                            name="nama"
                            autoComplete="name"
                            required
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            aria-invalid={galat || undefined}
                            aria-describedby={galat ? 'wt13-rsvp-galat' : undefined}
                        />
                    </div>
                    <div>
                        <label htmlFor="wt13-rsvp-jumlah">Jumlah</label>
                        <select id="wt13-rsvp-jumlah" name="jumlah" value={jumlah} onChange={(e) => setJumlah(e.target.value)}>
                            {Array.from({ length: MAKS_TAMU }, (_, i) => String(i + 1)).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <span id="wt13-lbl-hadir" className="wt13-label-kecil">
                        Kehadiran
                    </span>
                    <div className="wt13-pilihan" role="radiogroup" aria-labelledby="wt13-lbl-hadir">
                        <input type="radio" name="hadir" id="wt13-hadir-ya" value="ya" checked={hadir === 'ya'} onChange={() => setHadir('ya')} />
                        <label htmlFor="wt13-hadir-ya">Insya Allah hadir</label>
                        <input
                            type="radio"
                            name="hadir"
                            id="wt13-hadir-tidak"
                            value="tidak"
                            checked={hadir === 'tidak'}
                            onChange={() => setHadir('tidak')}
                        />
                        <label htmlFor="wt13-hadir-tidak">Berhalangan</label>
                    </div>
                </div>
                <p className="wt13-galat" id="wt13-rsvp-galat" hidden={!galat}>
                    Mohon isi nama terlebih dahulu.
                </p>
                <button className="wt13-btn wt13-btn-utama" type="submit" disabled={mengirim}>
                    {mengirim ? 'Mengirim…' : 'Kirim Konfirmasi'}
                </button>
            </form>
            {hasil && (
                <div className="wt13-hasil" aria-live="polite">
                    <p className="wt13-kecil">{hasil.status}</p>
                    <pre>{hasil.pesan}</pre>
                    <div className="wt13-baris-btn">
                        <a className="wt13-btn wt13-btn-utama wt13-btn-kecil" href={waUrl('', hasil.pesan)} target="_blank" rel="noopener">
                            <Ikon nama="wa" />
                            Kirim via WhatsApp
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
