import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type FormEvent } from 'react';
import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { domConfetti } from '../lib/domConfetti';
import { cx } from '../lib/helpers';
import { RSVP_FIELDS, validateRsvp, type RsvpDraft, type RsvpErrors, type RsvpField } from '../lib/rsvp';
import { SECTION_BY_KEY } from '../lib/sections';
import type { RsvpPayload, Wish } from '../lib/types';

export interface RsvpHandle {
    /** Brings keyboard focus to the first field (the mailbox / signboard on the island was tapped). */
    focusForm(): void;
}

interface Done {
    payload: RsvpPayload;
    note: string;
}

const EMPTY: RsvpDraft = { name: '', attendance: '', guests: 1, message: '' };

function summary(p: RsvpPayload, withAttendance: boolean, child: string) {
    const lines = [`Nama: ${p.name}`];
    if (withAttendance) {
        lines.push(`Kehadiran: ${p.attendance === 'yes' ? 'Ya, kami akan datang!' : 'Maaf, belum bisa datang.'}`);
        if (p.attendance === 'yes') lines.push(`Jumlah tamu: ${p.guests} orang`);
    }
    if (p.message) lines.push('', `Pesan untuk ${child}: ${p.message}`);
    return lines.join('\n');
}

const relative = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
function wishDate(w: Wish) {
    if (w.dateLabel) return w.dateLabel;
    if (!w.submittedAt) return '';
    const minutes = Math.round((Date.parse(w.submittedAt) - Date.now()) / 60000);
    if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    return Math.abs(hours) < 24 ? relative.format(hours, 'hour') : relative.format(Math.round(hours / 24), 'day');
}

/** 7 · RSVP — signboard and mailbox. Attendance form, wishes from other guests and the digital gift. */
export const RsvpSection = forwardRef<RsvpHandle, { onOpenGift: () => void }>(function RsvpSection({ onOpenGift }, ref) {
    const { config, rsvpService, audio, getWorld } = useSmile();
    const def = SECTION_BY_KEY.rsvp;
    const { features, rsvp, child } = config;
    const withAttendance = features.rsvp;
    const hasForm = features.rsvp || features.wishes;
    const rules = { maxGuests: rsvp.maxGuests, messageMaxLength: rsvp.messageMaxLength, withAttendance };

    const [draft, setDraft] = useState<RsvpDraft>(EMPTY);
    const [errors, setErrors] = useState<RsvpErrors>({});
    const [formStatus, setFormStatus] = useState('');
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState<Done | null>(null);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingWishes, setLoadingWishes] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const successRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const focusSuccess = useRef(false);

    useImperativeHandle(ref, () => ({
        focusForm: () => formRef.current?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true }),
    }));

    // A returning guest sees (and can edit) the answer sent from this device.
    useEffect(() => {
        if (!withAttendance) return;
        const own = rsvpService.getOwnSubmission();
        if (!own) return;
        setDraft({ name: own.name, attendance: own.attendance, guests: own.guests, message: own.message });
        setDone({ payload: own, note: 'Kamu sudah mengirim jawaban dari perangkat ini. Ingin mengubahnya? Tekan “Ubah jawaban”.' });
    }, [rsvpService, withAttendance]);

    const loadWishes = useCallback(
        async (next: number) => {
            if (!features.wishes) return;
            setLoadingWishes(true);
            const result = await rsvpService.listWishes(next);
            setWishes((list) => (next === 1 ? result.wishes : [...list, ...result.wishes]));
            setHasMore(result.hasMore);
            setPage(next);
            setLoadingWishes(false);
        },
        [features.wishes, rsvpService],
    );

    useEffect(() => {
        void loadWishes(1);
    }, [loadWishes]);

    useEffect(() => {
        if (done && focusSuccess.current) {
            focusSuccess.current = false;
            headingRef.current?.focus();
        }
    }, [done]);

    const update = <K extends keyof RsvpDraft>(key: K, value: RsvpDraft[K]) => {
        const next = { ...draft, [key]: value };
        setDraft(next);
        // Fields already flagged re-validate while the guest types.
        if (errors[key as RsvpField]) setErrors((e) => ({ ...e, [key]: validateRsvp(next, rules)[key as RsvpField] }));
        if (key === 'attendance') setErrors((e) => ({ ...e, attendance: undefined, guests: value === 'yes' ? e.guests : undefined }));
    };

    const validateField = (field: RsvpField) => {
        // The attendance error only shows after submit, not on blur of a single radio.
        if (field === 'attendance') return;
        setErrors((e) => ({ ...e, [field]: validateRsvp(draft, rules)[field] }));
    };

    const step = (delta: number) => update('guests', Math.min(rsvp.maxGuests, Math.max(1, (draft.guests || 1) + delta)));

    const focusField = (field: RsvpField) => {
        const form = formRef.current;
        const target =
            field === 'attendance'
                ? form?.querySelector<HTMLElement>('input[name="attendance"]')
                : form?.querySelector<HTMLElement>(`[name="${field}"]`);
        target?.focus();
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (sending) return;
        const found = validateRsvp(draft, rules);
        setErrors(found);
        const invalid = RSVP_FIELDS.filter((k) => found[k]);
        if (invalid.length) {
            setFormStatus(
                invalid.length === 1
                    ? 'Perbaiki kolom yang ditandai, lalu coba lagi.'
                    : `Perbaiki ${invalid.length} kolom yang ditandai, lalu coba lagi.`,
            );
            focusField(invalid[0]);
            return;
        }
        const payload: RsvpPayload = {
            name: draft.name.trim(),
            attendance: draft.attendance === 'no' ? 'no' : 'yes',
            guests: draft.attendance === 'yes' ? draft.guests : 0,
            message: draft.message.trim(),
            submittedAt: new Date().toISOString(),
        };
        setSending(true);
        setFormStatus('');
        const result = withAttendance ? await rsvpService.submit(payload) : await rsvpService.submitWish(payload.name, payload.message);
        setSending(false);
        if (!result.ok) {
            setFormStatus(result.error);
            return;
        }
        const note =
            result.mode === 'demo'
                ? 'Ini mode contoh: jawabanmu hanya disimpan di perangkat ini.'
                : result.sample
                  ? 'Ini undangan contoh, jadi jawabanmu tidak benar-benar disimpan.'
                  : `Jawabanmu sudah kami terima. Terima kasih, ${payload.name}!`;
        focusSuccess.current = true;
        setDone({ payload, note });
        audio.play('celebration');
        const world = getWorld();
        if (world) world.raiseMailboxFlag(true);
        else if (config.features.confetti) domConfetti(successRef.current, { amount: 60 });
        void loadWishes(1);
    };

    const edit = () => {
        setDone(null);
        getWorld()?.raiseMailboxFlag(false);
        requestAnimationFrame(() => focusField('name'));
    };

    const successTitle = !done
        ? ''
        : !withAttendance
          ? 'Terima kasih atas ucapannya!'
          : done.payload.attendance === 'yes'
            ? 'Hore, sampai jumpa di pesta!'
            : 'Terima kasih sudah memberi kabar';
    const errorId = (field: RsvpField) => (errors[field] ? `bt11-rsvp-${field}-error` : undefined);

    return (
        <SceneSection def={def} art={smileAssets.gift} artSize={[240, 240]}>
            <SectionHeading def={def} />
            <p data-reveal="">{hasForm ? config.copy.rsvpIntro : `Terima kasih sudah ikut merayakan ulang tahun ${child.name}.`}</p>

            {hasForm && (
                <div className="bt11-rsvp-box" data-reveal="">
                    <form ref={formRef} className="bt11-rsvp-form" noValidate hidden={Boolean(done)} onSubmit={onSubmit}>
                        {formStatus && (
                            <p className="bt11-form-status" role="alert">
                                {formStatus}
                            </p>
                        )}

                        <div className={cx('bt11-field', errors.name && 'has-error')}>
                            <label htmlFor="bt11-rsvp-name">Nama kamu</label>
                            <input
                                id="bt11-rsvp-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                maxLength={60}
                                required
                                value={draft.name}
                                aria-invalid={errors.name ? true : undefined}
                                aria-describedby={errorId('name')}
                                onChange={(e) => update('name', e.target.value)}
                                onBlur={() => validateField('name')}
                            />
                            {errors.name && (
                                <p className="bt11-field__error" id="bt11-rsvp-name-error">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {withAttendance && (
                            <fieldset className={cx('bt11-field', errors.attendance && 'has-error')} aria-describedby={errorId('attendance')}>
                                <legend>Bisa datang?</legend>
                                <div className="bt11-choice-group">
                                    {(
                                        [
                                            ['yes', 'Ya, kami akan datang'],
                                            ['no', 'Maaf, belum bisa datang'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <label key={value} className="bt11-choice">
                                            <input
                                                type="radio"
                                                name="attendance"
                                                value={value}
                                                required
                                                checked={draft.attendance === value}
                                                aria-invalid={errors.attendance ? true : undefined}
                                                onChange={() => update('attendance', value)}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.attendance && (
                                    <p className="bt11-field__error" id="bt11-rsvp-attendance-error">
                                        {errors.attendance}
                                    </p>
                                )}
                            </fieldset>
                        )}

                        {withAttendance && draft.attendance === 'yes' && (
                            <div className={cx('bt11-field', errors.guests && 'has-error')}>
                                <label htmlFor="bt11-rsvp-guests">Jumlah tamu, termasuk kamu</label>
                                <div className="bt11-stepper">
                                    <button
                                        type="button"
                                        className="bt11-stepper__btn"
                                        aria-label="Kurangi satu tamu"
                                        disabled={draft.guests <= 1}
                                        onClick={() => step(-1)}
                                    >
                                        −
                                    </button>
                                    <input
                                        id="bt11-rsvp-guests"
                                        name="guests"
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        max={rsvp.maxGuests}
                                        value={Number.isFinite(draft.guests) ? draft.guests : ''}
                                        aria-invalid={errors.guests ? true : undefined}
                                        aria-describedby={cx('bt11-rsvp-guests-hint', errorId('guests'))}
                                        onChange={(e) => update('guests', e.target.value === '' ? NaN : Math.round(Number(e.target.value)))}
                                        onBlur={() => validateField('guests')}
                                    />
                                    <button
                                        type="button"
                                        className="bt11-stepper__btn"
                                        aria-label="Tambah satu tamu"
                                        disabled={draft.guests >= rsvp.maxGuests}
                                        onClick={() => step(1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="bt11-field__hint" id="bt11-rsvp-guests-hint">
                                    Maksimal {rsvp.maxGuests} orang per jawaban.
                                </p>
                                {errors.guests && (
                                    <p className="bt11-field__error" id="bt11-rsvp-guests-error">
                                        {errors.guests}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className={cx('bt11-field', errors.message && 'has-error')}>
                            <label htmlFor="bt11-rsvp-message">
                                {withAttendance ? 'Pesan' : 'Ucapan'} untuk {child.name}{' '}
                                {withAttendance && <span className="bt11-optional">(opsional)</span>}
                            </label>
                            <textarea
                                id="bt11-rsvp-message"
                                name="message"
                                rows={3}
                                maxLength={rsvp.messageMaxLength}
                                value={draft.message}
                                aria-invalid={errors.message ? true : undefined}
                                aria-describedby={cx('bt11-rsvp-message-count', errorId('message'))}
                                onChange={(e) => update('message', e.target.value)}
                                onBlur={() => validateField('message')}
                            />
                            <p className="bt11-field__hint bt11-field__hint--end" id="bt11-rsvp-message-count">
                                {draft.message.length} / {rsvp.messageMaxLength}
                            </p>
                            {errors.message && (
                                <p className="bt11-field__error" id="bt11-rsvp-message-error">
                                    {errors.message}
                                </p>
                            )}
                        </div>

                        <button className="bt11-btn bt11-btn--send bt11-btn--big" type="submit" disabled={sending} aria-busy={sending}>
                            {sending ? 'Mengirim…' : withAttendance ? 'Kirim jawaban' : 'Kirim ucapan'}
                        </button>
                        {rsvpService.mode === 'demo' && (
                            <p className="bt11-small">Mode contoh: jawaban hanya disimpan di perangkat ini, tidak dikirim ke tuan rumah.</p>
                        )}
                    </form>

                    <div ref={successRef} className="bt11-rsvp-success" hidden={!done}>
                        <h3 ref={headingRef} tabIndex={-1}>
                            {successTitle}
                        </h3>
                        <p>{done?.note}</p>
                        {done && <pre className="bt11-rsvp-preview">{summary(done.payload, withAttendance, child.name)}</pre>}
                        <div className="bt11-actions">
                            <button className="bt11-btn bt11-btn--ghost" type="button" onClick={edit}>
                                {withAttendance ? 'Ubah jawaban' : 'Kirim ucapan lagi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {features.gift && (
                <div className="bt11-gift-callout" data-reveal="">
                    <img src={smileAssets.gift} alt="" width={56} height={56} />
                    <p>Ingin mengirim tanda kasih untuk {child.name}?</p>
                    <button className="bt11-btn bt11-btn--secondary" type="button" aria-haspopup="dialog" onClick={onOpenGift}>
                        Kirim kado digital
                    </button>
                </div>
            )}

            {features.wishes && (
                <div className="bt11-wishes" data-reveal="">
                    <h3>Ucapan untuk {child.name}</h3>
                    {wishes.length === 0 && !loadingWishes && <p className="bt11-small">Belum ada ucapan. Jadilah yang pertama!</p>}
                    <ul>
                        {wishes.map((w) => (
                            <li key={w.id} className="bt11-wish">
                                <p className="bt11-wish__head">
                                    <strong>{w.name}</strong>
                                    {w.example && <span className="bt11-demo-pill">contoh</span>}
                                    <span className="bt11-wish__date">{wishDate(w)}</span>
                                </p>
                                <p>{w.message}</p>
                            </li>
                        ))}
                    </ul>
                    {hasMore && (
                        <button
                            className="bt11-btn bt11-btn--ghost bt11-btn--small"
                            type="button"
                            disabled={loadingWishes}
                            onClick={() => void loadWishes(page + 1)}
                        >
                            {loadingWishes ? 'Memuat…' : 'Muat ucapan lainnya'}
                        </button>
                    )}
                </div>
            )}
        </SceneSection>
    );
});
