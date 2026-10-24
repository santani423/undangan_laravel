import { CircleAlert, Info, LoaderCircle, MessageCircleHeart, Minus, Plus, RotateCcw, Send, Users } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { StopBlock } from '../components/layout/StopBlock';
import { PackIcon } from '../components/ui/PackIcon';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { sfx } from '../hooks/useMusic';
import { cx } from '../lib/cx';
import { initials, timeAgo } from '../lib/format';
import { STOP_INDEX } from '../lib/journey';
import type { Attendance, RsvpPayload, Wish } from '../lib/types';
import type { SubmitResult } from '../services/rsvpService';
import { celebrate } from '../store/celebrations';
import { setExperience } from '../store/experience';

export interface FormState {
    name: string;
    attendance: Attendance | '';
    companions: number;
    wish: string;
}
type Errors = Partial<Record<keyof FormState, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';
/** `rsvp`: attendance + wish (RSVP feature). `wish`: only a wish (RSVP off, wishes on). */
export type FormMode = 'rsvp' | 'wish';

const ATTENDANCE_LABEL: Record<Attendance, string> = { hadir: 'Hadir', ragu: 'Masih ragu', tidak: 'Tidak hadir' };

export function validateRsvp(f: FormState, mode: FormMode, limits: { maxCompanions: number; wishMaxLength: number }): Errors {
    const errors: Errors = {};
    const name = f.name.trim();
    if (!name) errors.name = 'Nama wajib diisi.';
    else if (name.length < 2) errors.name = 'Nama minimal 2 huruf.';
    else if (name.length > 60) errors.name = 'Nama maksimal 60 karakter.';
    else if (!/\p{L}/u.test(name)) errors.name = 'Nama harus mengandung huruf.';
    if (mode === 'rsvp') {
        if (!f.attendance) errors.attendance = 'Pilih salah satu konfirmasi kehadiran.';
        if (f.attendance === 'hadir' && (!Number.isInteger(f.companions) || f.companions < 0 || f.companions > limits.maxCompanions)) {
            errors.companions = `Jumlah pendamping antara 0 dan ${limits.maxCompanions} orang.`;
        }
    }
    const wish = f.wish.trim();
    if (mode === 'wish' && wish.length < 3) errors.wish = 'Tulis ucapan minimal 3 karakter.';
    else if (wish.length > limits.wishMaxLength) errors.wish = `Ucapan maksimal ${limits.wishMaxLength} karakter.`;
    return errors;
}

function WishesWall({ wishes, hasMore, loading, onLoadMore }: { wishes: Wish[]; hasMore: boolean; loading: boolean; onLoadMore: () => void }) {
    const { showDemoNotices } = useInvitation().config;
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? wishes : wishes.slice(0, 4);
    return (
        <ToyCard studs={2} studOffset={4} className="bt10-wishes">
            <h3 className="bt10-wishes__title">
                <MessageCircleHeart aria-hidden="true" className="bt10-text-coral-deep" /> Ucapan &amp; Doa
            </h3>
            {wishes.length === 0 ? (
                <p className="bt10-muted bt10-small bt10-mt-3">{loading ? 'Memuat ucapan…' : 'Jadilah yang pertama mengirim ucapan!'}</p>
            ) : (
                <ul className="bt10-wishes__list">
                    {visible.map((w) => (
                        <li key={w.id} className="bt10-wish">
                            <span aria-hidden="true" className="bt10-wish__avatar">
                                {initials(w.name)}
                            </span>
                            <div className="bt10-wish__body">
                                <p className="bt10-wish__head">
                                    <span className="bt10-break">{w.name}</span>
                                    {w.attendance && <span className="bt10-wish__tag">{ATTENDANCE_LABEL[w.attendance]}</span>}
                                    {w.example && showDemoNotices && <span className="bt10-demo-badge">Contoh</span>}
                                </p>
                                <p className="bt10-wish__text">{w.wish}</p>
                                <p className="bt10-wish__date">{w.dateLabel || (w.submittedAt ? timeAgo(w.submittedAt) : '')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="bt10-wishes__more">
                {wishes.length > 4 && (
                    <button
                        type="button"
                        className="bt10-btn bt10-btn--white bt10-btn--sm"
                        onClick={() => setShowAll((v) => !v)}
                        aria-expanded={showAll}
                    >
                        {showAll ? 'Tampilkan lebih sedikit' : `Lihat semua (${wishes.length})`}
                    </button>
                )}
                {showAll && hasMore && (
                    <button type="button" className="bt10-btn bt10-btn--white bt10-btn--sm" onClick={onLoadMore} disabled={loading}>
                        {loading ? 'Memuat…' : 'Muat ucapan lainnya'}
                    </button>
                )}
            </div>
        </ToyCard>
    );
}

function resultNote(result: SubmitResult | null, mode: FormMode): string {
    if (!result || !result.ok) return '';
    if (result.mode === 'demo') return 'Tersimpan di perangkat ini saja (mode demo) — belum terkirim ke penyelenggara.';
    if (result.sample) return 'Ini undangan contoh — jawaban tidak disimpan.';
    return mode === 'rsvp' ? 'Konfirmasi sudah terkirim ke penyelenggara.' : 'Ucapan sudah terkirim.';
}

/** Scene 5a — RSVP form (or a wish form when RSVP is off), demo-mode aware, plus the wishes wall. */
export function RSVPSection() {
    const { config, rsvpService } = useInvitation();
    const { rsvp, features, guest, child } = config;
    const mode: FormMode = features.rsvp ? 'rsvp' : 'wish';
    const showForm = features.rsvp || features.wishes;
    const ids = useId();
    const nameRef = useRef<HTMLInputElement>(null);
    const attendanceRef = useRef<HTMLInputElement>(null);
    const companionsRef = useRef<HTMLInputElement>(null);
    const wishRef = useRef<HTMLTextAreaElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const [own] = useState<RsvpPayload | null>(() => (mode === 'rsvp' ? rsvpService.getOwnSubmission() : null));
    const [form, setForm] = useState<FormState>(() =>
        own
            ? { name: own.name, attendance: own.attendance, companions: own.companions, wish: own.wish }
            : { name: guest.personalised ? guest.name : '', attendance: '', companions: 0, wish: '' },
    );
    const [status, setStatus] = useState<Status>(own ? 'success' : 'idle');
    const [submitError, setSubmitError] = useState('');
    const [showErrors, setShowErrors] = useState(false);
    const [lastResult, setLastResult] = useState<SubmitResult | null>(own ? { ok: true, mode: rsvpService.mode, sample: false } : null);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [wishPage, setWishPage] = useState({ page: 0, hasMore: false, loading: false });

    const limits = { maxCompanions: rsvp.maxCompanions, wishMaxLength: rsvp.wishMaxLength };
    const errors = validateRsvp(form, mode, limits);
    const visibleErrors = showErrors ? errors : {};

    const loadWishes = useCallback(
        async (page: number) => {
            setWishPage((p) => ({ ...p, loading: true }));
            const result = await rsvpService.listWishes(page);
            setWishes((list) => (page === 1 ? result.wishes : [...list, ...result.wishes]));
            setWishPage({ page, hasMore: result.hasMore, loading: false });
        },
        [rsvpService],
    );

    useEffect(() => {
        if (features.wishes) void loadWishes(1);
        if (own) setExperience({ rsvpSubmitted: true });
    }, [features.wishes, loadWishes, own]);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => {
            const next = { ...f, [key]: value };
            if (key === 'attendance' && value !== 'hadir') next.companions = 0;
            return next;
        });

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (status === 'submitting') return;
        setShowErrors(true);
        const found = validateRsvp(form, mode, limits);
        if (Object.keys(found).length > 0) {
            if (found.name) nameRef.current?.focus();
            else if (found.attendance) attendanceRef.current?.focus();
            else if (found.companions) companionsRef.current?.focus();
            else if (found.wish) wishRef.current?.focus();
            return;
        }
        setStatus('submitting');
        setSubmitError('');
        const name = form.name.trim();
        const wish = form.wish.trim();
        const result =
            mode === 'rsvp'
                ? await rsvpService.submit({
                      name,
                      attendance: form.attendance as Attendance,
                      companions: form.attendance === 'hadir' ? form.companions : 0,
                      wish,
                      submittedAt: new Date().toISOString(),
                  })
                : await rsvpService.submitWish(name, wish);
        if (result.ok) {
            setLastResult(result);
            setStatus('success');
            setShowErrors(false);
            setExperience({ rsvpSubmitted: true });
            celebrate('mailbox', 1.1);
            sfx('chime');
            if (features.wishes) void loadWishes(1);
            requestAnimationFrame(() => resultRef.current?.focus());
        } else {
            setStatus('error');
            setSubmitError(result.error);
            requestAnimationFrame(() => resultRef.current?.focus());
        }
    };

    const restart = () => {
        setStatus('idle');
        if (mode === 'wish') setForm((f) => ({ ...f, wish: '' }));
    };

    const errorId = (key: keyof FormState) => `${ids}-${key}-error`;
    const firstName = form.name.trim().split(/\s+/)[0] ?? '';
    const wishLength = form.wish.trim().length;

    if (!showForm) return null;

    return (
        <StopBlock stop={STOP_INDEX.rsvp} id="rsvp" labelledBy="bt10-rsvp-title" wide>
            <ToyCard studs={4}>
                <p className="bt10-eyebrow">
                    <PackIcon name="check" size={16} className="bt10-text-mint-deep" /> {mode === 'rsvp' ? 'Konfirmasi Kehadiran' : 'Ucapan & Doa'}
                </p>
                <h2 id="bt10-rsvp-title" className="bt10-title">
                    {mode === 'rsvp' ? 'Kamu datang, kan?' : `Kirim doa untuk ${child.nickname}`}
                </h2>

                {rsvpService.mode === 'demo' && (
                    <p className="bt10-demo-note">
                        <Info size={18} aria-hidden="true" className="bt10-text-lavender-deep" />
                        <span>
                            <strong>Mode demo:</strong> jawaban hanya disimpan di perangkat ini (localStorage) dan <strong>tidak dikirim</strong> ke
                            server atau penyelenggara.
                        </span>
                    </p>
                )}

                {status === 'success' ? (
                    <div ref={resultRef} tabIndex={-1} className="bt10-success bt10-pop-in" role="status">
                        <span className="bt10-success__icon">
                            <PackIcon name="check" size={30} />
                        </span>
                        <p className="bt10-success__title">Terima kasih, {firstName}!</p>
                        <p className="bt10-mt-1">
                            {mode === 'wish'
                                ? 'Ucapan dan doamu sudah kami terima.'
                                : form.attendance === 'hadir'
                                  ? `Kami tunggu kehadiranmu${form.companions > 0 ? ` bersama ${form.companions} pendamping` : ''}.`
                                  : form.attendance === 'ragu'
                                    ? 'Kabari kami lagi ya kalau sudah pasti.'
                                    : 'Terima kasih atas doa baiknya.'}
                        </p>
                        <p className="bt10-success__note">{resultNote(lastResult, mode)}</p>
                        <button type="button" className="bt10-btn bt10-btn--white bt10-btn--sm bt10-mt-4" onClick={restart}>
                            <RotateCcw size={16} aria-hidden="true" /> {mode === 'rsvp' ? 'Ubah jawaban' : 'Kirim ucapan lagi'}
                        </button>
                    </div>
                ) : (
                    <form className="bt10-form" onSubmit={onSubmit} noValidate>
                        {showErrors && Object.keys(errors).length > 0 && (
                            <p className="bt10-notice bt10-notice--coral bt10-notice--strong" role="alert">
                                <CircleAlert size={18} aria-hidden="true" /> Periksa kembali isian yang ditandai.
                            </p>
                        )}

                        <div>
                            <label htmlFor={`${ids}-name`} className="bt10-field-label">
                                Nama tamu <span className="bt10-text-coral-deep">*</span>
                            </label>
                            <input
                                ref={nameRef}
                                id={`${ids}-name`}
                                className="bt10-input"
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                autoComplete="name"
                                maxLength={60}
                                required
                                aria-invalid={visibleErrors.name ? true : undefined}
                                aria-describedby={visibleErrors.name ? errorId('name') : undefined}
                                placeholder="Contoh: Budi Santoso"
                            />
                            {visibleErrors.name && (
                                <p id={errorId('name')} className="bt10-field-error">
                                    {visibleErrors.name}
                                </p>
                            )}
                        </div>

                        {mode === 'rsvp' && (
                            <>
                                <fieldset className="bt10-fieldset" aria-describedby={visibleErrors.attendance ? errorId('attendance') : undefined}>
                                    <legend className="bt10-field-label">
                                        Konfirmasi kehadiran <span className="bt10-text-coral-deep">*</span>
                                    </legend>
                                    <div className="bt10-choices">
                                        {rsvp.attendanceOptions.map((opt, i) => (
                                            <label key={opt.value} className="bt10-choice">
                                                <input
                                                    ref={i === 0 ? attendanceRef : undefined}
                                                    type="radio"
                                                    name={`${ids}-attendance`}
                                                    value={opt.value}
                                                    checked={form.attendance === opt.value}
                                                    onChange={() => update('attendance', opt.value)}
                                                    className="bt10-sr-only"
                                                />
                                                <span className={`bt10-choice__box bt10-choice__box--${opt.value}`}>
                                                    <span className="bt10-choice__label">{opt.label}</span>
                                                    <span className="bt10-choice__hint">{opt.hint}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {visibleErrors.attendance && (
                                        <p id={errorId('attendance')} className="bt10-field-error">
                                            {visibleErrors.attendance}
                                        </p>
                                    )}
                                </fieldset>

                                <div>
                                    <label htmlFor={`${ids}-companions`} className="bt10-field-label bt10-field-label--icon">
                                        <Users size={18} aria-hidden="true" /> Jumlah pendamping
                                    </label>
                                    <p id={`${ids}-companions-hint`} className="bt10-field-hint">
                                        {form.attendance === 'hadir'
                                            ? `Selain kamu, maksimal ${rsvp.maxCompanions} orang.`
                                            : 'Aktif jika memilih “Hadir”.'}
                                    </p>
                                    <div className="bt10-stepper">
                                        <button
                                            type="button"
                                            className="bt10-icon-btn"
                                            aria-label="Kurangi pendamping"
                                            disabled={form.attendance !== 'hadir' || form.companions <= 0}
                                            onClick={() => update('companions', Math.max(0, form.companions - 1))}
                                        >
                                            <Minus size={18} aria-hidden="true" />
                                        </button>
                                        <input
                                            ref={companionsRef}
                                            id={`${ids}-companions`}
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            max={rsvp.maxCompanions}
                                            step={1}
                                            className="bt10-input bt10-stepper__input"
                                            value={form.companions}
                                            disabled={form.attendance !== 'hadir'}
                                            onChange={(e) => update('companions', e.target.value === '' ? 0 : Number(e.target.value))}
                                            aria-invalid={visibleErrors.companions ? true : undefined}
                                            aria-describedby={`${ids}-companions-hint${visibleErrors.companions ? ` ${errorId('companions')}` : ''}`}
                                        />
                                        <button
                                            type="button"
                                            className="bt10-icon-btn"
                                            aria-label="Tambah pendamping"
                                            disabled={form.attendance !== 'hadir' || form.companions >= rsvp.maxCompanions}
                                            onClick={() => update('companions', Math.min(rsvp.maxCompanions, form.companions + 1))}
                                        >
                                            <Plus size={18} aria-hidden="true" />
                                        </button>
                                    </div>
                                    {visibleErrors.companions && (
                                        <p id={errorId('companions')} className="bt10-field-error">
                                            {visibleErrors.companions}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor={`${ids}-wish`} className="bt10-field-label">
                                Ucapan &amp; doa untuk {child.nickname}
                                {mode === 'wish' && <span className="bt10-text-coral-deep"> *</span>}
                            </label>
                            <textarea
                                ref={wishRef}
                                id={`${ids}-wish`}
                                className="bt10-input bt10-textarea"
                                value={form.wish}
                                onChange={(e) => update('wish', e.target.value)}
                                maxLength={rsvp.wishMaxLength + 20}
                                aria-invalid={visibleErrors.wish ? true : undefined}
                                aria-describedby={`${ids}-wish-count${visibleErrors.wish ? ` ${errorId('wish')}` : ''}`}
                                placeholder="Tulis ucapan selamat ulang tahun…"
                            />
                            <div className="bt10-field-foot">
                                {visibleErrors.wish ? (
                                    <p id={errorId('wish')} className="bt10-field-error bt10-mt-0">
                                        {visibleErrors.wish}
                                    </p>
                                ) : (
                                    <span className="bt10-muted">{mode === 'rsvp' ? 'Opsional' : 'Wajib diisi'}</span>
                                )}
                                <span
                                    id={`${ids}-wish-count`}
                                    className={cx(wishLength > rsvp.wishMaxLength ? 'bt10-field-count is-over' : 'bt10-field-count')}
                                >
                                    {wishLength}/{rsvp.wishMaxLength}
                                </span>
                            </div>
                        </div>

                        {status === 'error' && (
                            <div ref={resultRef} tabIndex={-1} role="alert" className="bt10-notice bt10-notice--coral bt10-notice--strong">
                                <CircleAlert size={18} aria-hidden="true" />
                                {submitError}
                            </div>
                        )}

                        <button type="submit" className="bt10-btn bt10-btn--coral bt10-btn--block" disabled={status === 'submitting'}>
                            {status === 'submitting' ? (
                                <>
                                    <LoaderCircle size={20} className="bt10-spin" aria-hidden="true" /> Mengirim…
                                </>
                            ) : (
                                <>
                                    <Send size={20} aria-hidden="true" /> {mode === 'rsvp' ? 'Kirim Konfirmasi' : 'Kirim Ucapan'}
                                </>
                            )}
                        </button>
                    </form>
                )}
            </ToyCard>
            {features.wishes && (
                <WishesWall
                    wishes={wishes}
                    hasMore={wishPage.hasMore}
                    loading={wishPage.loading}
                    onLoadMore={() => void loadWishes(wishPage.page + 1)}
                />
            )}
        </StopBlock>
    );
}
