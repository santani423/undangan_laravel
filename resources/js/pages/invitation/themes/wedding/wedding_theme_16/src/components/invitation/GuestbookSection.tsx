import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, Info, LoaderCircle, MessageSquareHeart, RotateCcw, Send } from 'lucide-react';
import { useToast } from '../../hooks/useAppContext';
import { useInvitationData } from '../../hooks/useInvitationData';
import { formatRelative } from '../../lib/date';
import { LIMITS, hasErrors, validateGuestbook, type FieldErrors, type GuestbookFormValues } from '../../lib/validation';
import { createGuestbookService, type GuestbookEntry } from '../../services/guestbookService';
import { SectionShell } from '../ui/SectionShell';

const COOLDOWN_MS = 8000;

function EntryCard({ entry }: { entry: GuestbookEntry }) {
  return (
    <li className="sub-card flex gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center border-2 border-gold-deep bg-champagne/60 font-serif text-lg font-semibold text-gold-ink"
      >
        {entry.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-ink">{entry.name}</p>
        <p className="text-xs text-ink-soft">
          <time dateTime={entry.createdAt}>{formatRelative(entry.createdAt)}</time>
        </p>
        <p className="mt-1.5 whitespace-pre-line break-words text-sm text-ink-soft">{entry.message}</p>
      </div>
    </li>
  );
}

/** Section H — digital guestbook for wishes and prayers. */
export function GuestbookSection() {
  const { config, recipientName } = useInvitationData();
  const { notify } = useToast();
  const service = useMemo(() => createGuestbookService(config.backend.guestbookEndpoint, config.meta.slug), [config]);
  const formId = useId();
  const pageSize = config.guestbook.pageSize;

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [visible, setVisible] = useState(pageSize);
  const [values, setValues] = useState<GuestbookFormValues>({ name: recipientName ?? '', message: '' });
  const [errors, setErrors] = useState<FieldErrors<GuestbookFormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastSubmit = useRef<{ message: string; at: number } | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    service
      .list()
      .then((list) => {
        if (!active) return;
        setEntries(list);
        setListState('ready');
      })
      .catch(() => active && setListState('error'));
    return () => {
      active = false;
    };
  }, [service]);

  const retry = () => {
    setListState('loading');
    service
      .list()
      .then((list) => {
        setEntries(list);
        setListState('ready');
      })
      .catch(() => setListState('error'));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const nextErrors = validateGuestbook(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      document.getElementById(`${formId}-${nextErrors.name ? 'name' : 'message'}`)?.focus();
      return;
    }
    const message = values.message.trim();
    const previous = lastSubmit.current;
    if (previous && previous.message === message) {
      notify('Ucapan yang sama sudah terkirim.', 'info');
      return;
    }
    if (previous && Date.now() - previous.at < COOLDOWN_MS) {
      notify('Mohon tunggu sebentar sebelum mengirim ucapan lagi.', 'info');
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await service.submit(values);
      lastSubmit.current = { message, at: Date.now() };
      setEntries((current) => [created, ...current]);
      setListState('ready');
      setValues((current) => ({ ...current, message: '' }));
      notify('Terima kasih! Ucapan Anda telah ditambahkan.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Ucapan gagal dikirim.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <SectionShell id="buku-tamu" eyebrow="Buku Tamu" title="Ucapan & Doa" icon="heart" width="lg">
      <form className="space-y-4" noValidate onSubmit={onSubmit} aria-busy={submitting} data-testid="guestbook-form">
        {submitError && (
          <p className="flex items-start gap-2 rounded-md border border-rose-deep/40 bg-[#fff1f0] p-3 text-sm text-rose-deep" role="alert">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {submitError} Silakan coba lagi.
          </p>
        )}
        <div>
          <label className="field-label" htmlFor={`${formId}-name`}>
            Nama <span aria-hidden="true" className="text-rose-deep">*</span>
          </label>
          <input
            id={`${formId}-name`}
            className="field-input"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          />
          {errors.name && (
            <p id={`${formId}-name-error`} className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor={`${formId}-message`}>
            Ucapan &amp; doa <span aria-hidden="true" className="text-rose-deep">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            className="field-input min-h-28 resize-y"
            maxLength={LIMITS.guestbookMessage}
            value={values.message}
            onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`${formId}-message-count${errors.message ? ` ${formId}-message-error` : ''}`}
          />
          <p id={`${formId}-message-count`} className="mt-1 text-right text-xs text-ink-soft">
            {values.message.length}/{LIMITS.guestbookMessage}
          </p>
          {errors.message && (
            <p id={`${formId}-message-error`} className="field-error">
              {errors.message}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={submitting} data-testid="guestbook-submit">
          {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {submitting ? 'Mengirim…' : 'Kirim Ucapan'}
        </button>
        {service.mode === 'demo' && (
          <p className="flex items-start gap-2 rounded-md bg-champagne/40 p-3 text-xs text-ink-soft">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-deep" />
            Mode demo: ucapan hanya tersimpan di perangkat ini. Hanya nama dan ucapan yang ditampilkan.
          </p>
        )}
      </form>

      <div className="mt-6" aria-live="polite">
        <h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-ink">
          <MessageSquareHeart aria-hidden="true" className="size-5 text-rose-deep" />
          Ucapan dari para tamu
          {listState === 'ready' && <span className="text-sm font-normal text-ink-soft">({entries.length})</span>}
        </h3>

        {listState === 'loading' && (
          <ul className="space-y-3" aria-label="Memuat ucapan" data-testid="guestbook-loading">
            {[0, 1, 2].map((i) => (
              <li key={i} className="sub-card flex animate-pulse gap-3">
                <span className="size-10 shrink-0 bg-champagne/70" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-1/3 rounded bg-champagne/70" />
                  <span className="block h-3 w-full rounded bg-champagne/50" />
                </span>
              </li>
            ))}
          </ul>
        )}

        {listState === 'error' && (
          <div className="sub-card text-center text-sm" role="alert">
            <p className="text-rose-deep">Ucapan belum dapat dimuat.</p>
            <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={retry}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Coba lagi
            </button>
          </div>
        )}

        {listState === 'ready' && entries.length === 0 && (
          <p className="sub-card text-center text-sm text-ink-soft" data-testid="guestbook-empty">
            Belum ada ucapan. Jadilah yang pertama mengirimkan doa untuk mempelai!
          </p>
        )}

        {listState === 'ready' && entries.length > 0 && (
          <>
            <ul className="space-y-3" data-testid="guestbook-list" aria-label="Daftar ucapan">
              {entries.slice(0, visible).map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </ul>
            {entries.length > visible && (
              <button type="button" className="btn btn-secondary btn-sm mt-3 w-full" onClick={() => setVisible((v) => v + pageSize)}>
                Tampilkan lebih banyak
              </button>
            )}
          </>
        )}
      </div>
    </SectionShell>
  );
}
