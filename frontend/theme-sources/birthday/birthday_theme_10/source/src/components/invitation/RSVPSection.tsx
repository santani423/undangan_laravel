import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, Info, LoaderCircle, MessageCircleHeart, Minus, Plus, RotateCcw, Send, Users } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { STOP_INDEX } from '../../config/journey';
import { rsvpService } from '../../services/rsvpService';
import { setExperience } from '../../store/experience';
import { celebrate } from '../../store/celebrations';
import { useGuestName } from '../../hooks/useGuestName';
import { sfx } from '../../hooks/useMusic';
import { formatShortDate, initials, timeAgo } from '../../utils/format';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';
import { PackIcon } from '../ui/PackIcon';
import type { Attendance, RsvpPayload, Wish } from '../../types/invitation';

interface FormState {
  name: string;
  attendance: Attendance | '';
  companions: number;
  wish: string;
}
type Errors = Partial<Record<keyof FormState, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const { rsvp } = invitationConfig;
const ATTENDANCE_STYLE: Record<Attendance, string> = {
  hadir: 'peer-checked:bg-toy-mint peer-checked:shadow-[inset_0_-4px_0_var(--color-toy-mint-deep)]',
  ragu: 'peer-checked:bg-toy-butter peer-checked:shadow-[inset_0_-4px_0_var(--color-toy-butter-deep)]',
  tidak: 'peer-checked:bg-toy-coral peer-checked:shadow-[inset_0_-4px_0_var(--color-toy-coral-deep)]',
};
const ATTENDANCE_LABEL: Record<Attendance, string> = { hadir: 'Hadir', ragu: 'Masih ragu', tidak: 'Tidak hadir' };

export function validateRsvp(f: FormState): Errors {
  const errors: Errors = {};
  const name = f.name.trim();
  if (!name) errors.name = 'Nama wajib diisi.';
  else if (name.length < 2) errors.name = 'Nama minimal 2 huruf.';
  else if (name.length > 60) errors.name = 'Nama maksimal 60 karakter.';
  else if (!/\p{L}/u.test(name)) errors.name = 'Nama harus mengandung huruf.';
  if (!f.attendance) errors.attendance = 'Pilih salah satu konfirmasi kehadiran.';
  if (f.attendance === 'hadir' && (!Number.isInteger(f.companions) || f.companions < 0 || f.companions > rsvp.maxCompanions)) {
    errors.companions = `Jumlah pendamping antara 0 dan ${rsvp.maxCompanions} orang.`;
  }
  if (f.wish.trim().length > rsvp.wishMaxLength) errors.wish = `Ucapan maksimal ${rsvp.wishMaxLength} karakter.`;
  return errors;
}

function WishesWall({ wishes }: { wishes: Wish[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? wishes : wishes.slice(0, 4);
  return (
    <ToyCard studs={2} studOffset={4} className="mt-6">
      <h3 className="flex items-center gap-2 font-display text-2xl font-bold">
        <MessageCircleHeart aria-hidden="true" className="text-toy-coral-deep" /> Ucapan &amp; Doa
      </h3>
      {wishes.length === 0 ? (
        <p className="mt-3 text-sm text-toy-ink-soft">Jadilah yang pertama mengirim ucapan!</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((w) => (
            <li key={w.id} className="flex gap-3 rounded-2xl bg-white/80 p-3 shadow-[inset_0_-3px_0_rgb(59_51_85/0.06)]">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-toy-lavender/45 font-display font-bold"
              >
                {initials(w.name)}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display font-semibold">
                  <span className="break-words">{w.name}</span>
                  <span className="rounded-full bg-toy-sky/25 px-2 py-0.5 text-[11px] font-bold">{ATTENDANCE_LABEL[w.attendance]}</span>
                  {w.example && invitationConfig.showDemoNotices && <span className="demo-badge">Contoh</span>}
                </p>
                <p className="mt-1 text-sm break-words">{w.wish}</p>
                <p className="mt-1 text-xs text-toy-ink-soft">{timeAgo(w.submittedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {wishes.length > 4 && (
        <button type="button" className="toy-btn toy-btn-white toy-btn-sm mt-4" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? 'Tampilkan lebih sedikit' : `Lihat semua (${wishes.length})`}
        </button>
      )}
    </ToyCard>
  );
}

/** Scene 5a — RSVP form, demo-mode aware, plus the wishes wall. */
export function RSVPSection() {
  const guest = useGuestName();
  const ids = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const attendanceRef = useRef<HTMLInputElement>(null);
  const companionsRef = useRef<HTMLInputElement>(null);
  const wishRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>(() => {
    const own = rsvpService.getOwnSubmission();
    return own
      ? { name: own.name, attendance: own.attendance, companions: own.companions, wish: own.wish }
      : { name: guest.personalised ? guest.name : '', attendance: '', companions: 0, wish: '' };
  });
  const [status, setStatus] = useState<Status>(() => (rsvpService.getOwnSubmission() ? 'success' : 'idle'));
  const [submitError, setSubmitError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [lastMode, setLastMode] = useState(rsvpService.mode);

  const errors = validateRsvp(form);
  const visibleErrors = showErrors ? errors : {};
  const deadlinePassed = rsvp.deadlineISO ? Date.now() > Date.parse(rsvp.deadlineISO) : false;

  useEffect(() => {
    let alive = true;
    void rsvpService.listWishes().then((list) => alive && setWishes(list));
    if (status === 'success') setExperience({ rsvpSubmitted: true });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const found = validateRsvp(form);
    if (Object.keys(found).length > 0) {
      if (found.name) nameRef.current?.focus();
      else if (found.attendance) attendanceRef.current?.focus();
      else if (found.companions) companionsRef.current?.focus();
      else if (found.wish) wishRef.current?.focus();
      return;
    }
    setStatus('submitting');
    setSubmitError('');
    const payload: RsvpPayload = {
      name: form.name.trim(),
      attendance: form.attendance as Attendance,
      companions: form.attendance === 'hadir' ? form.companions : 0,
      wish: form.wish.trim(),
      submittedAt: new Date().toISOString(),
    };
    const result = await rsvpService.submit(payload);
    if (result.ok) {
      setLastMode(result.mode);
      setStatus('success');
      setShowErrors(false);
      setExperience({ rsvpSubmitted: true });
      celebrate('mailbox', 1.1);
      sfx('chime');
      setWishes(await rsvpService.listWishes());
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      setStatus('error');
      setSubmitError(result.error);
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  };

  const errorId = (key: keyof FormState) => `${ids}-${key}-error`;
  const firstName = form.name.trim().split(/\s+/)[0] ?? '';

  return (
    <StopBlock stop={STOP_INDEX.rsvp} as="section" id="rsvp" labelledBy="rsvp-title" wide>
      <ToyCard studs={4}>
        <p className="eyebrow">
          <PackIcon name="check" size={16} className="text-toy-mint-deep" /> Konfirmasi Kehadiran
        </p>
        <h2 id="rsvp-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Kamu datang, kan?
        </h2>
        {rsvp.deadlineISO && (
          <p className="mt-1 text-sm text-toy-ink-soft">Mohon konfirmasi sebelum {formatShortDate(rsvp.deadlineISO)}.</p>
        )}

        {rsvpService.mode === 'demo' && (
          <p className="mt-4 flex gap-2 rounded-2xl border-2 border-dashed border-toy-lavender-deep/40 bg-toy-lavender/20 p-3 text-sm">
            <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-toy-lavender-deep" />
            <span>
              <strong>Mode demo:</strong> jawaban hanya disimpan di perangkat ini (localStorage) dan <strong>tidak dikirim</strong> ke
              server atau penyelenggara.
            </span>
          </p>
        )}

        {status === 'success' ? (
          <div ref={resultRef} tabIndex={-1} className="mt-5 animate-pop-in rounded-3xl bg-toy-mint/35 p-5 text-center" role="status">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-toy-mint shadow-[0_4px_0_var(--color-toy-mint-deep)]">
              <PackIcon name="check" size={30} />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">Terima kasih, {firstName}!</p>
            <p className="mt-1">
              {form.attendance === 'hadir'
                ? `Kami tunggu kehadiranmu${form.companions > 0 ? ` bersama ${form.companions} pendamping` : ''}.`
                : form.attendance === 'ragu'
                  ? 'Kabari kami lagi ya kalau sudah pasti.'
                  : 'Terima kasih atas doa baiknya.'}
            </p>
            <p className="mt-2 text-sm font-semibold text-toy-ink-soft">
              {lastMode === 'demo'
                ? 'Jawaban tersimpan di perangkat ini saja (mode demo) — belum terkirim ke penyelenggara.'
                : 'Konfirmasi sudah terkirim ke penyelenggara.'}
            </p>
            <button type="button" className="toy-btn toy-btn-white toy-btn-sm mt-4" onClick={() => setStatus('idle')}>
              <RotateCcw size={16} aria-hidden="true" /> Ubah jawaban
            </button>
          </div>
        ) : (
          <form className="mt-5 space-y-5" onSubmit={onSubmit} noValidate aria-describedby={deadlinePassed ? `${ids}-deadline` : undefined}>
            {showErrors && Object.keys(errors).length > 0 && (
              <p className="flex items-center gap-2 rounded-2xl bg-toy-coral/25 px-3 py-2 text-sm font-semibold" role="alert">
                <CircleAlert size={18} aria-hidden="true" /> Periksa kembali isian yang ditandai.
              </p>
            )}

            <div>
              <label htmlFor={`${ids}-name`} className="font-display text-base font-semibold">
                Nama tamu <span className="text-toy-coral-deep">*</span>
              </label>
              <input
                ref={nameRef}
                id={`${ids}-name`}
                className="toy-input mt-1.5"
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
                <p id={errorId('name')} className="mt-1 text-sm font-semibold text-toy-coral-deep">
                  {visibleErrors.name}
                </p>
              )}
            </div>

            <fieldset aria-describedby={visibleErrors.attendance ? errorId('attendance') : undefined}>
              <legend className="font-display text-base font-semibold">
                Konfirmasi kehadiran <span className="text-toy-coral-deep">*</span>
              </legend>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {rsvp.attendanceOptions.map((opt, i) => (
                  <label key={opt.value} className="relative cursor-pointer">
                    <input
                      ref={i === 0 ? attendanceRef : undefined}
                      type="radio"
                      name="attendance"
                      value={opt.value}
                      checked={form.attendance === opt.value}
                      onChange={() => update('attendance', opt.value)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex h-full min-h-16 flex-col items-center justify-center rounded-2xl border-[3px] border-toy-ink/10 bg-white px-1 py-2 text-center transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-toy-ink peer-checked:border-transparent ${ATTENDANCE_STYLE[opt.value]}`}
                    >
                      <span className="font-display text-base leading-tight font-semibold">{opt.label}</span>
                      <span className="text-[11px] leading-tight text-toy-ink-soft">{opt.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {visibleErrors.attendance && (
                <p id={errorId('attendance')} className="mt-1 text-sm font-semibold text-toy-coral-deep">
                  {visibleErrors.attendance}
                </p>
              )}
            </fieldset>

            <div>
              <label htmlFor={`${ids}-companions`} className="flex items-center gap-1.5 font-display text-base font-semibold">
                <Users size={18} aria-hidden="true" /> Jumlah pendamping
              </label>
              <p id={`${ids}-companions-hint`} className="text-xs text-toy-ink-soft">
                {form.attendance === 'hadir' ? `Selain kamu, maksimal ${rsvp.maxCompanions} orang.` : 'Aktif jika memilih “Hadir”.'}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  className="toy-icon-btn"
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
                  className="toy-input w-20 text-center font-display text-lg font-semibold"
                  value={form.companions}
                  disabled={form.attendance !== 'hadir'}
                  onChange={(e) => update('companions', e.target.value === '' ? 0 : Number(e.target.value))}
                  aria-invalid={visibleErrors.companions ? true : undefined}
                  aria-describedby={`${ids}-companions-hint${visibleErrors.companions ? ` ${errorId('companions')}` : ''}`}
                />
                <button
                  type="button"
                  className="toy-icon-btn"
                  aria-label="Tambah pendamping"
                  disabled={form.attendance !== 'hadir' || form.companions >= rsvp.maxCompanions}
                  onClick={() => update('companions', Math.min(rsvp.maxCompanions, form.companions + 1))}
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
              {visibleErrors.companions && (
                <p id={errorId('companions')} className="mt-1 text-sm font-semibold text-toy-coral-deep">
                  {visibleErrors.companions}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${ids}-wish`} className="font-display text-base font-semibold">
                Ucapan &amp; doa untuk {invitationConfig.child.nickname}
              </label>
              <textarea
                ref={wishRef}
                id={`${ids}-wish`}
                className="toy-input mt-1.5 min-h-28 resize-y"
                value={form.wish}
                onChange={(e) => update('wish', e.target.value)}
                maxLength={rsvp.wishMaxLength + 20}
                aria-invalid={visibleErrors.wish ? true : undefined}
                aria-describedby={`${ids}-wish-count${visibleErrors.wish ? ` ${errorId('wish')}` : ''}`}
                placeholder="Tulis ucapan selamat ulang tahun…"
              />
              <div className="mt-1 flex justify-between gap-2 text-xs">
                {visibleErrors.wish ? (
                  <p id={errorId('wish')} className="font-semibold text-toy-coral-deep">
                    {visibleErrors.wish}
                  </p>
                ) : (
                  <span className="text-toy-ink-soft">Opsional</span>
                )}
                <span id={`${ids}-wish-count`} className={form.wish.trim().length > rsvp.wishMaxLength ? 'font-bold text-toy-coral-deep' : 'text-toy-ink-soft'}>
                  {form.wish.trim().length}/{rsvp.wishMaxLength}
                </span>
              </div>
            </div>

            {status === 'error' && (
              <div ref={resultRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-2xl bg-toy-coral/25 p-3 text-sm font-semibold">
                <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                {submitError}
              </div>
            )}
            {deadlinePassed && (
              <p id={`${ids}-deadline`} className="rounded-2xl bg-toy-butter/40 p-3 text-sm font-semibold">
                Batas waktu konfirmasi sudah lewat. Silakan hubungi keluarga secara langsung.
              </p>
            )}

            <button type="submit" className="toy-btn toy-btn-coral w-full" disabled={status === 'submitting' || deadlinePassed}>
              {status === 'submitting' ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Mengirim…
                </>
              ) : (
                <>
                  <Send size={20} aria-hidden="true" /> Kirim Konfirmasi
                </>
              )}
            </button>
          </form>
        )}
      </ToyCard>
      <WishesWall wishes={wishes} />
    </StopBlock>
  );
}
