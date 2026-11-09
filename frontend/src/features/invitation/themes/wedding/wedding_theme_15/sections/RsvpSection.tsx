import { useId, useRef, useState, type FormEvent } from 'react';
import { IconAlert, IconCheck } from '../components/Icons';
import { DemoBadge, Reveal, SectionHeading, Spinner } from '../components/ui';
import { useTheme } from '../lib/context';
import { LIMITS, validateRsvp, type Errors } from '../lib/rsvp';
import { getApp, setApp } from '../lib/store';
import type { Attendance, RsvpSubmission } from '../lib/types';

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; sample: boolean } | { kind: 'error'; message: string };

const CHOICES = [
    ['yes', 'Ya, saya akan hadir', '🌿'],
    ['no', 'Maaf, tidak bisa hadir', '🌙'],
] as const;

/** Scene 7: RSVP in the lantern-lit gazebo. */
export function RsvpSection() {
    const { wedding, rsvp } = useTheme();
    const { maxGuests, allowComments, deadlineLabel } = wedding.rsvp;
    const uid = useId();
    const form = useRef<HTMLFormElement>(null);
    const [name, setName] = useState(wedding.guest.name);
    const [attendance, setAttendance] = useState<Attendance | ''>('');
    const [guests, setGuests] = useState(1);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<Status>({ kind: 'idle' });

    const onSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        if (status.kind === 'submitting') return;
        const payload: RsvpSubmission = {
            name: name.trim(),
            attendance: attendance || 'yes',
            guests: attendance === 'yes' ? guests : 0,
            message: message.trim(),
        };
        const errs = validateRsvp({ ...payload, attendance: attendance || undefined }, maxGuests);
        setErrors(errs);
        if (Object.keys(errs).length) {
            requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }
        setStatus({ kind: 'submitting' });
        try {
            const { sample } = await rsvp.submit(payload);
            setStatus({ kind: 'success', sample });
            // The server files the message as a wish too: refresh the wishing tree.
            if (rsvp.mode === 'remote' && payload.message && allowComments && !sample) setApp({ wishesVersion: getApp().wishesVersion + 1 });
        } catch (err) {
            setStatus({
                kind: 'error',
                message: err instanceof Error ? err.message : 'Konfirmasi gagal terkirim. Periksa koneksi internet lalu coba lagi.',
            });
        }
    };

    const err = (k: keyof Errors) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${uid}-${k}-err` } : {});

    return (
        <section id="rsvp" data-scene className="wt15-section wt15-section--right wt15-section--tall" aria-labelledby="wt15-rsvp-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-rsvp-title"
                    eyebrow="RSVP"
                    title={
                        <>
                            Akankah kamu <em>hadir?</em>
                        </>
                    }
                />
                <Reveal as="p" className="wt15-lead" delay={0.1}>
                    {deadlineLabel}. Kehadiran dan doamu adalah hadiah terindah bagi kami.
                </Reveal>
                {rsvp.mode === 'local-demo' && (
                    <DemoBadge>Mode demo: RSVP belum terhubung ke server, jadi jawabanmu tidak dikirim ke mana pun.</DemoBadge>
                )}

                {status.kind === 'success' ? (
                    <div key="ok" className="wt15-result wt15-result--ok wt15-fade-in" role="status">
                        <IconCheck className="wt15-result__icon" />
                        {rsvp.mode === 'remote' && !status.sample && (
                            <p>
                                <strong>Terima kasih, {name.trim()}!</strong> Konfirmasimu sudah kami terima.
                            </p>
                        )}
                        {rsvp.mode === 'remote' && status.sample && (
                            <p>
                                <strong>Formulir terkirim ✓</strong> Ini undangan contoh, jadi konfirmasimu tidak disimpan.
                            </p>
                        )}
                        {rsvp.mode === 'local-demo' && (
                            <p>
                                <strong>Formulir valid ✓</strong> Ini mode demo — tidak ada data yang dikirim atau disimpan.
                            </p>
                        )}
                        <button type="button" className="wt15-link-btn" onClick={() => setStatus({ kind: 'idle' })}>
                            Ubah jawaban
                        </button>
                    </div>
                ) : (
                    <form key="form" ref={form} className="wt15-form wt15-fade-in" noValidate onSubmit={onSubmit}>
                        <div className="wt15-field">
                            <label htmlFor={`${uid}-name`}>Nama</label>
                            <input
                                id={`${uid}-name`}
                                name="name"
                                autoComplete="name"
                                value={name}
                                maxLength={LIMITS.nameMax}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama lengkap"
                                {...err('name')}
                            />
                            {errors.name && (
                                <p className="wt15-field__error" id={`${uid}-name-err`}>
                                    <IconAlert width={15} height={15} /> {errors.name}
                                </p>
                            )}
                        </div>

                        <fieldset className="wt15-field" {...(errors.attendance ? { 'aria-describedby': `${uid}-attendance-err` } : {})}>
                            <legend>Kehadiran</legend>
                            <div className="wt15-choice-row">
                                {CHOICES.map(([v, label, emoji]) => (
                                    <label key={v} className={`wt15-choice ${attendance === v ? 'is-checked' : ''}`}>
                                        <input
                                            type="radio"
                                            name="attendance"
                                            value={v}
                                            checked={attendance === v}
                                            onChange={() => setAttendance(v)}
                                            aria-invalid={errors.attendance ? true : undefined}
                                        />
                                        <span aria-hidden="true">{emoji}</span> {label}
                                    </label>
                                ))}
                            </div>
                            {errors.attendance && (
                                <p className="wt15-field__error" id={`${uid}-attendance-err`}>
                                    <IconAlert width={15} height={15} /> {errors.attendance}
                                </p>
                            )}
                        </fieldset>

                        {attendance === 'yes' && (
                            <div className="wt15-field">
                                <label htmlFor={`${uid}-guests`}>Jumlah tamu (termasuk kamu)</label>
                                <select id={`${uid}-guests`} value={guests} onChange={(e) => setGuests(Number(e.target.value))} {...err('guests')}>
                                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n} orang
                                        </option>
                                    ))}
                                </select>
                                {errors.guests && (
                                    <p className="wt15-field__error" id={`${uid}-guests-err`}>
                                        <IconAlert width={15} height={15} /> {errors.guests}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="wt15-field">
                            <label htmlFor={`${uid}-msg`}>
                                {allowComments ? 'Ucapan & doa' : 'Catatan'}{' '}
                                <span className="wt15-optional">
                                    {allowComments ? '(opsional — akan tampil di pohon harapan)' : '(opsional — misalnya kebutuhan makanan)'}
                                </span>
                            </label>
                            <textarea
                                id={`${uid}-msg`}
                                rows={3}
                                value={message}
                                maxLength={LIMITS.rsvpMessageMax}
                                onChange={(e) => setMessage(e.target.value)}
                                {...err('message')}
                            />
                            <p className="wt15-field__hint" aria-live="off">
                                {message.length}/{LIMITS.rsvpMessageMax}
                            </p>
                            {errors.message && (
                                <p className="wt15-field__error" id={`${uid}-message-err`}>
                                    <IconAlert width={15} height={15} /> {errors.message}
                                </p>
                            )}
                        </div>

                        {status.kind === 'error' && (
                            <p className="wt15-result wt15-result--error" role="alert">
                                <IconAlert className="wt15-result__icon" /> {status.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="wt15-btn wt15-btn--primary wt15-btn--block"
                            disabled={status.kind === 'submitting'}
                            aria-busy={status.kind === 'submitting'}
                        >
                            {status.kind === 'submitting' ? <Spinner label="Mengirim konfirmasi" /> : 'Kirim Konfirmasi'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
