import { FormEvent, useState } from 'react';

interface RSVPFormProps {
    rsvpEndpoint: string;
    guestName?: string;
    guestSlug?: string;
    onSuccess?: () => void;
    onToast?: (msg: string) => void;
    // Style props for theming
    styles: {
        form: string;
        label: string;
        input: string;
        select: string;
        textarea: string;
        radioGroup: string;
        radioLabel: string;
        errorText: string;
        submitBtn: string;
        successBox: string;
    };
    labels?: {
        name?: string;
        guests?: string;
        attendance?: string;
        attending?: string;
        notAttending?: string;
        maybe?: string;
        message?: string;
        submit?: string;
        successTitle?: string;
        successSub?: string;
    };
}

const DEFAULT_LABELS = {
    name: 'Nama Lengkap *',
    guests: 'Jumlah Tamu',
    attendance: 'Konfirmasi Kehadiran *',
    attending: '✓ Insya Allah Hadir',
    notAttending: '✗ Tidak Dapat Hadir',
    maybe: '? Masih Belum Pasti',
    message: 'Pesan / Doa',
    submit: 'Kirim Konfirmasi',
    successTitle: 'Terima kasih! Konfirmasi Anda telah kami terima.',
    successSub: 'Kami menantikan kehadiran Anda!',
};

export default function RSVPForm({ rsvpEndpoint, guestName, guestSlug, onToast, styles, labels = {} }: RSVPFormProps) {
    const L = { ...DEFAULT_LABELS, ...labels };
    const [name, setName] = useState(guestName ?? '');
    const [guests, setGuests] = useState('1');
    const [attendance, setAttendance] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ name?: string; attendance?: string }>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs: { name?: string; attendance?: string } = {};
        if (!name.trim()) errs.name = 'Nama harus diisi';
        if (!attendance) errs.attendance = 'Pilih salah satu konfirmasi';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        const rsvpStatusMap: Record<string, string> = {
            hadir: 'attending',
            tidak: 'not_attending',
            belum: 'maybe',
        };
        const payload: Record<string, string | number | undefined> = {
            name: name.trim(),
            number_of_guests: parseInt(guests) || 1,
            rsvp_status: rsvpStatusMap[attendance] ?? attendance,
            message,
            guest_slug: guestSlug,
        };
        try {
            await fetch(rsvpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });
        } catch {
            // Show success even on network error (graceful degradation)
        } finally {
            setLoading(false);
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className={styles.successBox}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
                <p>{L.successTitle}</p>
                <p style={{ marginTop: '10px', fontSize: '0.95rem', opacity: 0.7 }}>{L.successSub}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Name */}
            <div style={{ marginBottom: '25px' }}>
                <label className={styles.label}>{L.name}</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => !guestName && setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className={styles.input}
                    readOnly={!!guestName}
                    style={guestName ? { opacity: 0.75, cursor: 'not-allowed' } : undefined}
                />
                {errors.name && <p className={styles.errorText}>{errors.name}</p>}
            </div>

            {/* Guests */}
            <div style={{ marginBottom: '25px' }}>
                <label className={styles.label}>{L.guests}</label>
                <select value={guests} onChange={(e) => setGuests(e.target.value)} className={styles.select}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                            {n} orang
                        </option>
                    ))}
                </select>
            </div>

            {/* Attendance */}
            <div style={{ marginBottom: '25px' }}>
                <label className={styles.label}>{L.attendance}</label>
                <div className={styles.radioGroup}>
                    {[
                        { value: 'hadir', label: L.attending },
                        { value: 'tidak', label: L.notAttending },
                        { value: 'belum', label: L.maybe },
                    ].map((opt) => (
                        <label key={opt.value} className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="attendance"
                                value={opt.value}
                                checked={attendance === opt.value}
                                onChange={() => setAttendance(opt.value)}
                                style={{ accentColor: 'var(--green, #2D5016)', width: '18px', height: '18px' }}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
                {errors.attendance && <p className={styles.errorText}>{errors.attendance}</p>}
            </div>

            {/* Message */}
            <div style={{ marginBottom: '25px' }}>
                <label className={styles.label}>{L.message}</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan pesan atau doa untuk kedua mempelai..."
                    className={styles.textarea}
                />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Mengirim...' : L.submit}
            </button>
        </form>
    );
}
