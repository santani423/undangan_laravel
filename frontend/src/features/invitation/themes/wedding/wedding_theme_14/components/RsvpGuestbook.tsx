import { CheckCircle2, Info, Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { useTheme } from '../lib/context';
import { LIMITS, validateRsvp, validateWish, type ValidationErrors } from '../lib/rsvp';
import type { Attendance, RsvpRecord } from '../lib/types';
import { SectionHeading } from './Ornament';

const ATTENDANCE: { value: Attendance; label: string }[] = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'tidak', label: 'Berhalangan' },
    { value: 'ragu', label: 'Belum pasti' },
];

const relTime = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
/** ISO time → "2 jam yang lalu"; server labels (already humanised) are shown as they are. */
function ago(when: string) {
    const t = /^\d{4}-\d{2}-\d{2}T/.test(when) ? new Date(when).getTime() : NaN;
    if (Number.isNaN(t)) return when;
    const diff = (t - Date.now()) / 1000;
    const abs = Math.abs(diff);
    if (abs < 60) return relTime.format(Math.round(diff), 'second');
    if (abs < 3600) return relTime.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return relTime.format(Math.round(diff / 3600), 'hour');
    return relTime.format(Math.round(diff / 86400), 'day');
}

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; name: string } | { kind: 'error'; message: string };

function DemoNotice() {
    const { rsvp } = useTheme();
    if (rsvp.mode !== 'local-demo') return null;
    return (
        <p className="wt14-notice">
            <Info size={14} aria-hidden="true" />
            Mode demo: konfirmasi & ucapan hanya tersimpan di peramban perangkat ini dan tidak terkirim ke mempelai maupun terlihat oleh tamu lain.
        </p>
    );
}

function FieldError({ id, text }: { id?: string; text?: string }) {
    return text ? (
        <p id={id} className="wt14-field-error">
            {text}
        </p>
    ) : null;
}

export function RsvpGuestbook() {
    const { wedding: w, rsvp } = useTheme();
    const uid = useId();
    const showForm = w.sections.rsvp;
    const showBook = w.sections.wishes;
    // Wishes need comments to be allowed on the invitation; without the RSVP form they get their own form.
    const canWish = showBook && w.rsvp.allowComments;
    const [tab, setTab] = useState<'rsvp' | 'guestbook'>(showForm ? 'rsvp' : 'guestbook');
    const [name, setName] = useState(w.guest.name);
    const [attendance, setAttendance] = useState<Attendance | ''>('');
    const [guests, setGuests] = useState(1);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [status, setStatus] = useState<Status>({ kind: 'idle' });
    const [records, setRecords] = useState<RsvpRecord[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [loadingMore, setLoadingMore] = useState(false);

    const load = useCallback(
        async (p: number) => {
            const res = await rsvp.list(p);
            setHasMore(res.hasMore);
            setPage(p);
            return res.records;
        },
        [rsvp],
    );

    useEffect(() => {
        if (!showBook) return;
        let alive = true;
        load(1)
            .then((r) => {
                if (!alive) return;
                setRecords(r);
                setListState('ready');
            })
            .catch(() => alive && setListState('error'));
        return () => {
            alive = false;
        };
    }, [load, showBook]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const more = await load(page + 1);
            setRecords((r) => [...r, ...more]);
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    /** Shows a freshly sent wish at the top (the server list refreshes on the next visit). */
    const addRecord = (rec: RsvpRecord) => {
        if (rec.message && canWish) setRecords((r) => [rec, ...r.filter((x) => x.id !== rec.id)]);
    };

    const focusFirst = (v: ValidationErrors) => {
        const first = Object.keys(v)[0];
        document.getElementById(`${uid}-${first}`)?.focus({ preventScroll: true });
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const v = validateRsvp({ name, attendance: attendance || undefined, guests, message });
        setErrors(v);
        if (Object.keys(v).length) return focusFirst(v);
        setStatus({ kind: 'submitting' });
        try {
            const rec = await rsvp.submit({ name, attendance: attendance as Attendance, guests, message });
            setStatus({ kind: 'success', name: rec.name });
            setMessage('');
            addRecord(rec);
        } catch (err) {
            setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.' });
        }
    };

    const onWish = async (e: FormEvent) => {
        e.preventDefault();
        const v = validateWish(name, message);
        setErrors(v);
        if (Object.keys(v).length) return focusFirst(v);
        setStatus({ kind: 'submitting' });
        try {
            addRecord(await rsvp.submitWish(name, message));
            setMessage('');
            setStatus({ kind: 'idle' });
        } catch (err) {
            setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.' });
        }
    };

    const nameField = (
        <div>
            <label htmlFor={`${uid}-name`} className="wt14-label">
                Nama
            </label>
            <input
                id={`${uid}-name`}
                className="wt14-field"
                value={name}
                maxLength={LIMITS.nameMax}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            />
            <FieldError id={`${uid}-name-err`} text={errors.name} />
        </div>
    );

    const messageField = (optional: boolean) => (
        <div>
            <label htmlFor={`${uid}-message`} className="wt14-label">
                Ucapan & doa {optional && <span className="wt14-label-muted">(opsional)</span>}
            </label>
            <textarea
                id={`${uid}-message`}
                className="wt14-field wt14-textarea"
                value={message}
                maxLength={LIMITS.messageMax}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={`${uid}-msg-count`}
            />
            <p id={`${uid}-msg-count`} className="wt14-counter">
                {message.length}/{LIMITS.messageMax}
            </p>
            <FieldError text={errors.message} />
        </div>
    );

    const errorBox = status.kind === 'error' && (
        <p role="alert" className="wt14-alert">
            {status.message}
        </p>
    );

    const submitLabel = (idle: string) => (
        <>
            {status.kind === 'submitting' ? <Loader2 size={16} className="wt14-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
            {status.kind === 'submitting' ? 'Mengirim…' : idle}
        </>
    );

    const tabBtn = (id: 'rsvp' | 'guestbook', label: string) => (
        <button
            type="button"
            role="tab"
            id={`${uid}-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`${uid}-panel-${id}`}
            onClick={() => setTab(id)}
            className={`wt14-tab ${tab === id ? 'wt14-tab-active' : ''}`}
        >
            {label}
        </button>
    );

    const form = (
        <div role={showBook ? 'tabpanel' : undefined} id={`${uid}-panel-rsvp`} aria-labelledby={showBook ? `${uid}-tab-rsvp` : undefined}>
            {w.rsvp.deadline && <p className="wt14-note">Mohon konfirmasi sebelum {w.rsvp.deadline}.</p>}
            {status.kind === 'success' ? (
                <div className="wt14-success" role="status">
                    <CheckCircle2 size={36} aria-hidden="true" />
                    <p className="wt14-success-title">Matur nuwun, {status.name}!</p>
                    <p className="wt14-success-text">
                        {rsvp.mode === 'local-demo' ? 'Konfirmasi Anda tercatat di perangkat ini (mode demo).' : 'Konfirmasi Anda telah kami terima.'}
                    </p>
                    <div className="wt14-actions">
                        {showBook && (
                            <button type="button" className="wt14-btn" onClick={() => setTab('guestbook')}>
                                Lihat buku tamu
                            </button>
                        )}
                        <button type="button" className="wt14-btn-ghost" onClick={() => setStatus({ kind: 'idle' })}>
                            Ubah konfirmasi
                        </button>
                    </div>
                </div>
            ) : (
                <form className="wt14-form" onSubmit={onSubmit} noValidate>
                    {nameField}
                    <fieldset>
                        <legend className="wt14-label">Kehadiran</legend>
                        <div
                            id={`${uid}-attendance`}
                            tabIndex={-1}
                            className="wt14-choice"
                            aria-describedby={errors.attendance ? `${uid}-att-err` : undefined}
                        >
                            {ATTENDANCE.map((a) => (
                                <label key={a.value} className={attendance === a.value ? 'wt14-choice-on' : ''}>
                                    <input
                                        type="radio"
                                        name={`${uid}-att`}
                                        value={a.value}
                                        checked={attendance === a.value}
                                        onChange={() => setAttendance(a.value)}
                                        className="wt14-sr-only"
                                    />
                                    {a.label}
                                </label>
                            ))}
                        </div>
                        <FieldError id={`${uid}-att-err`} text={errors.attendance} />
                    </fieldset>
                    {attendance === 'hadir' && (
                        <div>
                            <label htmlFor={`${uid}-guests`} className="wt14-label">
                                Jumlah tamu
                            </label>
                            <select
                                id={`${uid}-guests`}
                                className="wt14-field"
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                                aria-invalid={!!errors.guests}
                            >
                                {Array.from({ length: LIMITS.guestsMax }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} orang
                                    </option>
                                ))}
                            </select>
                            <FieldError text={errors.guests} />
                        </div>
                    )}
                    {messageField(true)}
                    {errorBox}
                    <button type="submit" className="wt14-btn wt14-btn-block" disabled={status.kind === 'submitting'}>
                        {submitLabel('Kirim Konfirmasi')}
                    </button>
                </form>
            )}
            <DemoNotice />
        </div>
    );

    const book = (
        <div role={showForm ? 'tabpanel' : undefined} id={`${uid}-panel-guestbook`} aria-labelledby={showForm ? `${uid}-tab-guestbook` : undefined}>
            {!showForm && canWish && (
                <form className="wt14-form" onSubmit={onWish} noValidate>
                    {nameField}
                    {messageField(false)}
                    {errorBox}
                    <button type="submit" className="wt14-btn wt14-btn-block" disabled={status.kind === 'submitting'}>
                        {submitLabel('Kirim Ucapan')}
                    </button>
                </form>
            )}
            <div className="wt14-book">
                {listState === 'loading' && <p className="wt14-note">Memuat…</p>}
                {listState === 'error' && <p className="wt14-note wt14-error">Buku tamu tidak dapat dimuat.</p>}
                {listState === 'ready' && records.length === 0 && (
                    <p className="wt14-empty">Belum ada ucapan. Jadilah yang pertama memberi doa restu.</p>
                )}
                {records.length > 0 && (
                    <ul className="wt14-wishes" aria-live="polite">
                        {records.map((r) => (
                            <li key={r.id}>
                                <div className="wt14-wish-head">
                                    <p className="wt14-wish-name">{r.name}</p>
                                    {r.attendance && (
                                        <span className={`wt14-badge wt14-badge-${r.attendance}`}>
                                            {ATTENDANCE.find((a) => a.value === r.attendance)?.label}
                                            {r.attendance === 'hadir' && r.guests ? ` · ${r.guests}` : ''}
                                        </span>
                                    )}
                                </div>
                                {r.message && <p className="wt14-wish-text">{r.message}</p>}
                                <p className="wt14-wish-time">
                                    {ago(r.when)}
                                    {r.storage === 'local' && ' · tersimpan lokal'}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
                {hasMore && (
                    <div className="wt14-actions">
                        <button type="button" className="wt14-btn-ghost" onClick={loadMore} disabled={loadingMore}>
                            {loadingMore ? 'Memuat…' : 'Muat ucapan lainnya'}
                        </button>
                    </div>
                )}
            </div>
            {!showForm && <DemoNotice />}
        </div>
    );

    return (
        <div>
            <SectionHeading icon="heart" eyebrow="Among Tamu" title={showForm ? 'Konfirmasi & Ucapan' : 'Buku Tamu & Doa'} />
            {showForm && showBook && (
                <div role="tablist" aria-label="RSVP dan buku tamu" className="wt14-tabs">
                    {tabBtn('rsvp', 'Konfirmasi Kehadiran')}
                    {tabBtn('guestbook', `Buku Tamu${records.length ? ` (${records.length}${hasMore ? '+' : ''})` : ''}`)}
                </div>
            )}
            {showForm && (!showBook || tab === 'rsvp') ? form : book}
        </div>
    );
}
