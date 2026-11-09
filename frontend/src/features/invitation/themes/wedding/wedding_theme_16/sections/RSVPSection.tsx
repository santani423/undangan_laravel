import { CircleAlert, CircleCheck, Info, LoaderCircle, Pencil, Send } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData, useToast } from '../hooks/useAppContext';
import { formatLongDate, isPast } from '../lib/date';
import { LIMITS, hasErrors, validateRsvp, type Attendance, type FieldErrors, type RsvpFormValues } from '../lib/validation';
import { notifyGuestbookChanged } from '../services/guestbookService';
import { createRsvpService, type RsvpRecord } from '../services/rsvpService';

const ATTENDANCE: { value: Attendance; label: string }[] = [
    { value: 'hadir', label: 'Ya, saya akan hadir' },
    { value: 'tidak-hadir', label: 'Maaf, saya tidak dapat hadir' },
    { value: 'ragu', label: 'Masih ragu' },
];

const ATTENDANCE_SUMMARY: Record<Attendance, string> = {
    hadir: 'akan hadir',
    'tidak-hadir': 'tidak dapat hadir',
    ragu: 'masih ragu',
};

type ViewState = 'loading' | 'form' | 'submitting' | 'success';

/** Section G — RSVP form (invitation API, or a local demo mode without an endpoint). */
export function RSVPSection() {
    const { config } = useInvitationData();
    const { notify } = useToast();
    const { rsvpEndpoint, guestSlug } = config.backend;
    const service = useMemo(() => createRsvpService(rsvpEndpoint, config.meta.slug, guestSlug), [rsvpEndpoint, config.meta.slug, guestSlug]);
    const formId = useId();
    const field = (name: string) => `${formId}-${name}`;

    const [view, setView] = useState<ViewState>('loading');
    const [values, setValues] = useState<RsvpFormValues>({ guestName: config.greeting.recipientName, attendance: '', attendees: 1, message: '' });
    const [errors, setErrors] = useState<FieldErrors<RsvpFormValues>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [record, setRecord] = useState<RsvpRecord | null>(null);
    const [updated, setUpdated] = useState(false);
    const [sample, setSample] = useState(false);
    const inFlight = useRef(false);
    const closed = isPast(config.rsvp.deadline);
    const max = config.rsvp.maxAttendees;
    const deadline = formatLongDate(config.rsvp.deadline, config.weddingTimeZone);

    useEffect(() => {
        let active = true;
        service
            .getOwnResponse()
            .then((existing) => {
                if (!active) return;
                setRecord(existing);
                setView(existing ? 'success' : 'form');
            })
            .catch(() => active && setView('form'));
        return () => {
            active = false;
        };
    }, [service]);

    const update = <K extends keyof RsvpFormValues>(key: K, value: RsvpFormValues[K]) => {
        setValues((current) => ({ ...current, [key]: value }));
        if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (inFlight.current) return;
        const nextErrors = validateRsvp(values, max);
        setErrors(nextErrors);
        if (hasErrors(nextErrors)) {
            const first = (['guestName', 'attendance', 'attendees', 'message'] as const).find((key) => nextErrors[key]);
            document.getElementById(field(first === 'attendance' ? 'attendance-hadir' : (first ?? 'guestName')))?.focus();
            return;
        }
        if (
            record &&
            record.guestName === values.guestName.trim() &&
            record.attendance === values.attendance &&
            record.attendees === (values.attendance === 'hadir' ? values.attendees : 0) &&
            record.message === values.message.trim()
        ) {
            notify('Konfirmasi yang sama sudah tersimpan.', 'info');
            setView('success');
            return;
        }

        inFlight.current = true;
        setSubmitError(null);
        setView('submitting');
        try {
            const result = await service.submit({ ...values, attendance: values.attendance as Attendance });
            setRecord(result.record);
            setUpdated(result.updated);
            setSample(result.sample);
            setView('success');
            notify(result.updated ? 'Konfirmasi kehadiran diperbarui.' : 'Konfirmasi kehadiran tersimpan.');
            // The server files the RSVP message as a guestbook wish too.
            if (service.mode === 'remote' && result.record.message && !result.sample) notifyGuestbookChanged();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Konfirmasi gagal dikirim.');
            setView('form');
        } finally {
            inFlight.current = false;
        }
    };

    const edit = () => {
        if (record) {
            setValues({
                guestName: record.guestName,
                attendance: record.attendance,
                attendees: Math.max(1, record.attendees),
                message: record.message,
            });
        }
        setView('form');
    };

    const notice =
        service.mode === 'demo' ? (
            <p className="wt16-notice">
                <Info aria-hidden="true" size={16} />
                Mode demo: konfirmasi hanya tersimpan di perangkat ini dan belum terkirim ke server mempelai.
            </p>
        ) : sample ? (
            <p className="wt16-notice">
                <Info aria-hidden="true" size={16} />
                Ini undangan contoh, jadi konfirmasi Anda tidak disimpan.
            </p>
        ) : null;

    return (
        <SectionShell id="rsvp" eyebrow="Konfirmasi Kehadiran" title="RSVP" icon="calendar">
            <p className="wt16-body wt16-lead wt16-lead--sm">
                {config.rsvp.note}
                {deadline && !closed && (
                    <>
                        {' '}
                        Mohon konfirmasi sebelum <strong>{deadline}</strong>.
                    </>
                )}
            </p>

            {view === 'loading' && (
                <p className="wt16-status" role="status">
                    <LoaderCircle aria-hidden="true" size={16} className="wt16-spin" />
                    Memuat formulir…
                </p>
            )}

            {closed && view !== 'success' && view !== 'loading' && (
                <p className="wt16-sub wt16-closed">Batas waktu konfirmasi telah berakhir. Terima kasih atas perhatian Anda.</p>
            )}

            {view === 'success' && record && (
                <div className="wt16-sub wt16-success" role="status">
                    <CircleCheck aria-hidden="true" size={40} className="wt16-success__icon" />
                    <h3 className="wt16-success__title">Terima kasih, {record.guestName}!</h3>
                    <p className="wt16-body wt16-success__text">
                        {updated ? 'Konfirmasi Anda telah diperbarui: ' : 'Konfirmasi Anda: '}
                        <strong>{ATTENDANCE_SUMMARY[record.attendance]}</strong>
                        {record.attendance === 'hadir' && ` (${record.attendees} orang)`}.
                    </p>
                    {record.message && <p className="wt16-success__quote">“{record.message}”</p>}
                    {!closed && (
                        <button type="button" className="wt16-btn wt16-btn--secondary wt16-btn--sm" onClick={edit}>
                            <Pencil aria-hidden="true" size={16} />
                            Ubah Konfirmasi
                        </button>
                    )}
                    {notice}
                </div>
            )}

            {!closed && (view === 'form' || view === 'submitting') && (
                <form className="wt16-form" noValidate onSubmit={onSubmit} aria-busy={view === 'submitting'}>
                    {submitError && (
                        <p className="wt16-alert" role="alert">
                            <CircleAlert aria-hidden="true" size={16} />
                            {submitError} Silakan coba lagi.
                        </p>
                    )}

                    <div>
                        <label className="wt16-label" htmlFor={field('guestName')}>
                            Nama lengkap{' '}
                            <span aria-hidden="true" className="wt16-req">
                                *
                            </span>
                        </label>
                        <input
                            id={field('guestName')}
                            className="wt16-input"
                            type="text"
                            autoComplete="name"
                            maxLength={LIMITS.name}
                            required
                            value={values.guestName}
                            onChange={(e) => update('guestName', e.target.value)}
                            aria-invalid={Boolean(errors.guestName)}
                            aria-describedby={errors.guestName ? field('guestName-error') : undefined}
                        />
                        {errors.guestName && (
                            <p id={field('guestName-error')} className="wt16-error">
                                {errors.guestName}
                            </p>
                        )}
                    </div>

                    <fieldset className="wt16-fieldset" aria-describedby={errors.attendance ? field('attendance-error') : undefined}>
                        <legend className="wt16-label">
                            Kehadiran{' '}
                            <span aria-hidden="true" className="wt16-req">
                                *
                            </span>
                        </legend>
                        <div className="wt16-choices">
                            {ATTENDANCE.map((option) => (
                                <label key={option.value} className="wt16-choice">
                                    <input
                                        id={field(`attendance-${option.value}`)}
                                        type="radio"
                                        name={field('attendance')}
                                        value={option.value}
                                        checked={values.attendance === option.value}
                                        onChange={() => update('attendance', option.value)}
                                        aria-invalid={Boolean(errors.attendance)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        {errors.attendance && (
                            <p id={field('attendance-error')} className="wt16-error">
                                {errors.attendance}
                            </p>
                        )}
                    </fieldset>

                    {values.attendance === 'hadir' && (
                        <div>
                            <label className="wt16-label" htmlFor={field('attendees')}>
                                Jumlah tamu (termasuk Anda)
                            </label>
                            <select
                                id={field('attendees')}
                                className="wt16-input"
                                value={values.attendees}
                                onChange={(e) => update('attendees', Number(e.target.value))}
                                aria-invalid={Boolean(errors.attendees)}
                                aria-describedby={errors.attendees ? field('attendees-error') : undefined}
                            >
                                {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>
                                        {n} orang
                                    </option>
                                ))}
                            </select>
                            {errors.attendees && (
                                <p id={field('attendees-error')} className="wt16-error">
                                    {errors.attendees}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="wt16-label" htmlFor={field('message')}>
                            Pesan untuk mempelai <span className="wt16-optional">(opsional)</span>
                        </label>
                        <textarea
                            id={field('message')}
                            className="wt16-input wt16-textarea"
                            maxLength={LIMITS.rsvpMessage}
                            value={values.message}
                            onChange={(e) => update('message', e.target.value)}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={field('message-count')}
                        />
                        <p id={field('message-count')} className="wt16-counter">
                            {values.message.length}/{LIMITS.rsvpMessage}
                        </p>
                        {errors.message && <p className="wt16-error">{errors.message}</p>}
                    </div>

                    <button type="submit" className="wt16-btn wt16-btn--primary wt16-btn--block" disabled={view === 'submitting'}>
                        {view === 'submitting' ? (
                            <LoaderCircle aria-hidden="true" size={16} className="wt16-spin" />
                        ) : (
                            <Send aria-hidden="true" size={16} />
                        )}
                        {view === 'submitting' ? 'Mengirim…' : 'Kirim Konfirmasi'}
                    </button>
                    {notice}
                </form>
            )}
        </SectionShell>
    );
}
