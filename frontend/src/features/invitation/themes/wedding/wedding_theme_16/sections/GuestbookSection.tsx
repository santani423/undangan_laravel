import { CircleAlert, Info, LoaderCircle, MessageSquareHeart, RotateCcw, Send } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData, useToast } from '../hooks/useAppContext';
import { formatRelative } from '../lib/date';
import { LIMITS, hasErrors, validateGuestbook, type FieldErrors, type GuestbookFormValues } from '../lib/validation';
import { createGuestbookService, onGuestbookChanged, type GuestbookEntry } from '../services/guestbookService';

const COOLDOWN_MS = 8000;

function EntryCard({ entry }: { entry: GuestbookEntry }) {
    const when = entry.dateLabel || (entry.createdAt ? formatRelative(entry.createdAt) : '');
    return (
        <li className="wt16-sub wt16-entry">
            <span aria-hidden="true" className="wt16-entry__avatar">
                {entry.name.charAt(0).toUpperCase()}
            </span>
            <div className="wt16-entry__body">
                <p className="wt16-entry__name">{entry.name}</p>
                {when && <p className="wt16-entry__time">{entry.createdAt ? <time dateTime={entry.createdAt}>{when}</time> : when}</p>}
                <p className="wt16-entry__message">{entry.message}</p>
            </div>
        </li>
    );
}

/** Section H — digital guestbook for wishes and prayers. */
export function GuestbookSection() {
    const { config } = useInvitationData();
    const { notify } = useToast();
    const { guestbookEndpoint } = config.backend;
    const service = useMemo(
        () => createGuestbookService(guestbookEndpoint, config.meta.slug, config.guestbook.pageSize),
        [guestbookEndpoint, config.meta.slug, config.guestbook.pageSize],
    );
    const formId = useId();

    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [values, setValues] = useState<GuestbookFormValues>({ name: config.greeting.recipientName, message: '' });
    const [errors, setErrors] = useState<FieldErrors<GuestbookFormValues>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const lastSubmit = useRef<{ message: string; at: number } | null>(null);
    const inFlight = useRef(false);
    const request = useRef(0);

    const load = useCallback(() => {
        const id = ++request.current;
        setListState('loading');
        service
            .list(1)
            .then((result) => {
                if (id !== request.current) return;
                setEntries(result.entries);
                setHasMore(result.hasMore);
                setPage(1);
                setListState('ready');
            })
            .catch(() => id === request.current && setListState('error'));
    }, [service]);

    // Only the newest request may update the list (see `request`).
    useEffect(() => load(), [load]);

    // An RSVP with a message also lands in the guestbook: show it.
    useEffect(() => onGuestbookChanged(load), [load]);

    const loadMore = () => {
        if (loadingMore) return;
        setLoadingMore(true);
        service
            .list(page + 1)
            .then((result) => {
                setEntries((current) => [...current, ...result.entries]);
                setHasMore(result.hasMore);
                setPage((p) => p + 1);
            })
            .catch(() => notify('Ucapan berikutnya belum dapat dimuat.', 'error'))
            .finally(() => setLoadingMore(false));
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
            const { entry, sample } = await service.submit(values);
            lastSubmit.current = { message, at: Date.now() };
            setEntries((current) => [entry, ...current]);
            setListState('ready');
            setValues((current) => ({ ...current, message: '' }));
            notify(
                sample ? 'Terkirim — ini undangan contoh, jadi ucapan tidak disimpan.' : 'Terima kasih! Ucapan Anda telah ditambahkan.',
                sample ? 'info' : 'success',
            );
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Ucapan gagal dikirim.');
        } finally {
            inFlight.current = false;
            setSubmitting(false);
        }
    };

    return (
        <SectionShell id="buku-tamu" eyebrow="Buku Tamu" title="Ucapan & Doa" icon="heart" width="lg">
            <form className="wt16-form wt16-form--tight" noValidate onSubmit={onSubmit} aria-busy={submitting}>
                {submitError && (
                    <p className="wt16-alert" role="alert">
                        <CircleAlert aria-hidden="true" size={16} />
                        {submitError} Silakan coba lagi.
                    </p>
                )}
                <div>
                    <label className="wt16-label" htmlFor={`${formId}-name`}>
                        Nama{' '}
                        <span aria-hidden="true" className="wt16-req">
                            *
                        </span>
                    </label>
                    <input
                        id={`${formId}-name`}
                        className="wt16-input"
                        type="text"
                        autoComplete="name"
                        maxLength={LIMITS.name}
                        value={values.name}
                        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                    />
                    {errors.name && (
                        <p id={`${formId}-name-error`} className="wt16-error">
                            {errors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="wt16-label" htmlFor={`${formId}-message`}>
                        Ucapan &amp; doa{' '}
                        <span aria-hidden="true" className="wt16-req">
                            *
                        </span>
                    </label>
                    <textarea
                        id={`${formId}-message`}
                        className="wt16-input wt16-textarea wt16-textarea--tall"
                        maxLength={LIMITS.guestbookMessage}
                        value={values.message}
                        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={`${formId}-message-count${errors.message ? ` ${formId}-message-error` : ''}`}
                    />
                    <p id={`${formId}-message-count`} className="wt16-counter">
                        {values.message.length}/{LIMITS.guestbookMessage}
                    </p>
                    {errors.message && (
                        <p id={`${formId}-message-error`} className="wt16-error">
                            {errors.message}
                        </p>
                    )}
                </div>
                <button type="submit" className="wt16-btn wt16-btn--primary wt16-btn--block" disabled={submitting}>
                    {submitting ? <LoaderCircle aria-hidden="true" size={16} className="wt16-spin" /> : <Send aria-hidden="true" size={16} />}
                    {submitting ? 'Mengirim…' : 'Kirim Ucapan'}
                </button>
                {service.mode === 'demo' && (
                    <p className="wt16-notice">
                        <Info aria-hidden="true" size={16} />
                        Mode demo: ucapan hanya tersimpan di perangkat ini. Hanya nama dan ucapan yang ditampilkan.
                    </p>
                )}
            </form>

            <div className="wt16-entries" aria-live="polite">
                <h3 className="wt16-subhead">
                    <MessageSquareHeart aria-hidden="true" size={20} />
                    Ucapan dari para tamu
                </h3>

                {listState === 'loading' && (
                    <ul className="wt16-entries__list" aria-label="Memuat ucapan">
                        {[0, 1, 2].map((i) => (
                            <li key={i} className="wt16-sub wt16-entry wt16-skeleton">
                                <span className="wt16-skeleton__avatar" />
                                <span className="wt16-skeleton__lines">
                                    <span />
                                    <span />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {listState === 'error' && (
                    <div className="wt16-sub wt16-entries__error" role="alert">
                        <p>Ucapan belum dapat dimuat.</p>
                        <button type="button" className="wt16-btn wt16-btn--secondary wt16-btn--sm" onClick={load}>
                            <RotateCcw aria-hidden="true" size={16} />
                            Coba lagi
                        </button>
                    </div>
                )}

                {listState === 'ready' && entries.length === 0 && (
                    <p className="wt16-sub wt16-entries__empty">Belum ada ucapan. Jadilah yang pertama mengirimkan doa untuk mempelai!</p>
                )}

                {listState === 'ready' && entries.length > 0 && (
                    <>
                        <ul className="wt16-entries__list" aria-label="Daftar ucapan">
                            {entries.map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                            ))}
                        </ul>
                        {hasMore && (
                            <button
                                type="button"
                                className="wt16-btn wt16-btn--secondary wt16-btn--sm wt16-btn--block wt16-entries__more"
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore && <LoaderCircle aria-hidden="true" size={16} className="wt16-spin" />}
                                Tampilkan lebih banyak
                            </button>
                        )}
                    </>
                )}
            </div>
        </SectionShell>
    );
}
