import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, CircleCheck, Info, LoaderCircle, Pencil, Send } from 'lucide-react';
import { useToast } from '../../hooks/useAppContext';
import { useInvitationData } from '../../hooks/useInvitationData';
import { formatLongDate, isPast } from '../../lib/date';
import { LIMITS, hasErrors, validateRsvp, type Attendance, type FieldErrors, type RsvpFormValues } from '../../lib/validation';
import { createRsvpService, type RsvpRecord } from '../../services/rsvpService';
import { SectionShell } from '../ui/SectionShell';

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

/** Section G — RSVP form (local demo mode or remote endpoint). */
export function RSVPSection() {
  const { config, recipientName } = useInvitationData();
  const { notify } = useToast();
  const service = useMemo(() => createRsvpService(config.backend.rsvpEndpoint, config.meta.slug), [config]);
  const formId = useId();
  const field = (name: string) => `${formId}-${name}`;

  const [view, setView] = useState<ViewState>('loading');
  const [values, setValues] = useState<RsvpFormValues>({ guestName: recipientName ?? '', attendance: '', attendees: 1, message: '' });
  const [errors, setErrors] = useState<FieldErrors<RsvpFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [record, setRecord] = useState<RsvpRecord | null>(null);
  const [updated, setUpdated] = useState(false);
  const inFlight = useRef(false);
  const closed = isPast(config.rsvp.deadline);
  const max = config.rsvp.maxAttendees;

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
      setView('success');
      notify(result.updated ? 'Konfirmasi kehadiran diperbarui.' : 'Konfirmasi kehadiran tersimpan.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Konfirmasi gagal dikirim.');
      setView('form');
    } finally {
      inFlight.current = false;
    }
  };

  const edit = () => {
    if (record) {
      setValues({ guestName: record.guestName, attendance: record.attendance, attendees: Math.max(1, record.attendees), message: record.message });
    }
    setView('form');
  };

  const demoNotice = service.mode === 'demo' && (
    <p className="mt-4 flex items-start gap-2 rounded-md bg-champagne/40 p-3 text-xs text-ink-soft" data-testid="rsvp-demo-notice">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-deep" />
      Mode demo: konfirmasi hanya tersimpan di perangkat ini dan belum terkirim ke server mempelai.
    </p>
  );

  return (
    <SectionShell id="rsvp" eyebrow="Konfirmasi Kehadiran" title="RSVP" icon="calendar">
      <p className="body-copy text-center text-sm">
        {config.rsvp.note}
        {config.rsvp.deadline && !closed && (
          <>
            {' '}
            Mohon konfirmasi sebelum <strong className="font-medium text-ink">{formatLongDate(config.rsvp.deadline, config.weddingTimeZone)}</strong>.
          </>
        )}
      </p>

      {view === 'loading' && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft" role="status">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Memuat formulir…
        </p>
      )}

      {closed && view !== 'success' && view !== 'loading' && (
        <p className="sub-card mt-6 text-center text-sm text-ink">Batas waktu konfirmasi telah berakhir. Terima kasih atas perhatian Anda.</p>
      )}

      {view === 'success' && record && (
        <div className="sub-card mt-6 text-center" role="status" data-testid="rsvp-success">
          <CircleCheck aria-hidden="true" className="mx-auto size-10 text-leaf" />
          <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">Terima kasih, {record.guestName}!</h3>
          <p className="body-copy mt-1 text-sm">
            {updated ? 'Konfirmasi Anda telah diperbarui: ' : 'Konfirmasi Anda: '}
            <strong className="font-medium text-ink">{ATTENDANCE_SUMMARY[record.attendance]}</strong>
            {record.attendance === 'hadir' && ` (${record.attendees} orang)`}.
          </p>
          {record.message && <p className="mt-2 font-serif text-lg italic text-ink-soft">“{record.message}”</p>}
          {!closed && (
            <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={edit}>
              <Pencil aria-hidden="true" className="size-4" />
              Ubah Konfirmasi
            </button>
          )}
          {demoNotice}
        </div>
      )}

      {!closed && (view === 'form' || view === 'submitting') && (
        <form className="mt-6 space-y-5" noValidate onSubmit={onSubmit} aria-busy={view === 'submitting'} data-testid="rsvp-form">
          {submitError && (
            <p className="flex items-start gap-2 rounded-md border border-rose-deep/40 bg-[#fff1f0] p-3 text-sm text-rose-deep" role="alert">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {submitError} Silakan coba lagi.
            </p>
          )}

          <div>
            <label className="field-label" htmlFor={field('guestName')}>
              Nama lengkap <span aria-hidden="true" className="text-rose-deep">*</span>
            </label>
            <input
              id={field('guestName')}
              className="field-input"
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
              <p id={field('guestName-error')} className="field-error">
                {errors.guestName}
              </p>
            )}
          </div>

          <fieldset aria-describedby={errors.attendance ? field('attendance-error') : undefined}>
            <legend className="field-label">
              Kehadiran <span aria-hidden="true" className="text-rose-deep">*</span>
            </legend>
            <div className="grid gap-2">
              {ATTENDANCE.map((option) => (
                <label key={option.value} className="choice text-sm">
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
              <p id={field('attendance-error')} className="field-error">
                {errors.attendance}
              </p>
            )}
          </fieldset>

          {values.attendance === 'hadir' && (
            <div>
              <label className="field-label" htmlFor={field('attendees')}>
                Jumlah tamu (termasuk Anda)
              </label>
              <select
                id={field('attendees')}
                className="field-input"
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
                <p id={field('attendees-error')} className="field-error">
                  {errors.attendees}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="field-label" htmlFor={field('message')}>
              Pesan untuk mempelai <span className="font-normal text-ink-soft">(opsional)</span>
            </label>
            <textarea
              id={field('message')}
              className="field-input min-h-24 resize-y"
              maxLength={LIMITS.rsvpMessage}
              value={values.message}
              onChange={(e) => update('message', e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={field('message-count')}
            />
            <p id={field('message-count')} className="mt-1 text-right text-xs text-ink-soft">
              {values.message.length}/{LIMITS.rsvpMessage}
            </p>
            {errors.message && <p className="field-error">{errors.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={view === 'submitting'} data-testid="rsvp-submit">
            {view === 'submitting' ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="size-4" />
            )}
            {view === 'submitting' ? 'Mengirim…' : 'Kirim Konfirmasi'}
          </button>
          {demoNotice}
        </form>
      )}
    </SectionShell>
  );
}
