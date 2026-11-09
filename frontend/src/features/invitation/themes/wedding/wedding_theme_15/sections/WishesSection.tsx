import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { IconAlert } from '../components/Icons';
import { DemoBadge, EmptyState, Reveal, SectionHeading, Spinner } from '../components/ui';
import { useTheme } from '../lib/context';
import { relativeTime } from '../lib/date';
import { LIMITS, validateWish } from '../lib/rsvp';
import { setApp, useApp } from '../lib/store';
import type { Wish } from '../lib/types';

type ListState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; wishes: Wish[]; page: number; hasMore: boolean; loadingMore: boolean };

/** Scene 8: digital guestbook beside the wishing tree. Every wish adds a glowing tag to the tree. */
export function WishesSection() {
    const { wedding, rsvp } = useTheme();
    const uid = useId();
    const version = useApp((s) => s.wishesVersion);
    const [list, setList] = useState<ListState>({ kind: 'loading' });
    const [name, setName] = useState(wedding.guest.name);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [fresh, setFresh] = useState<string | null>(null);

    const load = useCallback(async () => {
        setList({ kind: 'loading' });
        try {
            const { wishes, hasMore } = await rsvp.listWishes(1);
            setList({ kind: 'ready', wishes, page: 1, hasMore, loadingMore: false });
        } catch {
            setList({ kind: 'error' });
        }
    }, [rsvp]);

    useEffect(() => {
        void load();
    }, [load, version]);

    useEffect(() => {
        if (list.kind === 'ready') setApp({ wishCount: list.wishes.length });
    }, [list]);

    const loadMore = async () => {
        if (list.kind !== 'ready' || list.loadingMore) return;
        setList({ ...list, loadingMore: true });
        try {
            const next = await rsvp.listWishes(list.page + 1);
            setList({ kind: 'ready', wishes: [...list.wishes, ...next.wishes], page: list.page + 1, hasMore: next.hasMore, loadingMore: false });
        } catch {
            setList({ ...list, loadingMore: false });
            setError('Ucapan berikutnya belum bisa dimuat. Coba lagi sebentar lagi.');
        }
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (sending) return;
        const errs = validateWish(name, message);
        const first = errs.name ?? errs.message;
        if (first) return setError(first);
        setError(null);
        setNotice(null);
        setSending(true);
        try {
            const { wish, sample } = await rsvp.addWish(name.slice(0, LIMITS.nameMax), message.slice(0, LIMITS.wishMax));
            setMessage('');
            if (rsvp.mode === 'local-demo') setNotice('Ucapan tersimpan di browser ini (mode demo).');
            else if (sample) setNotice('Ini undangan contoh — ucapanmu tampil di sini, tetapi tidak disimpan.');
            else setNotice('Terima kasih atas doa dan ucapanmu 💛');
            setFresh(wish.id);
            setList((l) =>
                l.kind === 'ready'
                    ? { ...l, wishes: [wish, ...l.wishes] }
                    : { kind: 'ready', wishes: [wish], page: 1, hasMore: false, loadingMore: false },
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ucapan gagal terkirim. Coba lagi sebentar lagi.');
        } finally {
            setSending(false);
        }
    };

    return (
        <section id="wishes" data-scene className="wt15-section wt15-section--left wt15-section--tall" aria-labelledby="wt15-wishes-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-wishes-title"
                    eyebrow="Wishes"
                    title={
                        <>
                            Pohon <em>harapan</em>
                        </>
                    }
                />
                <Reveal as="p" className="wt15-lead" delay={0.1}>
                    Gantungkan doa dan ucapanmu di pohon harapan kami — setiap pesan menjadi satu cahaya kecil di dahannya.
                </Reveal>
                {rsvp.mode === 'local-demo' && (
                    <DemoBadge>Mode demo: ucapan hanya tersimpan di browser ini dan tidak terlihat oleh tamu lain.</DemoBadge>
                )}

                <form className="wt15-form" noValidate onSubmit={onSubmit}>
                    <div className="wt15-field">
                        <label htmlFor={`${uid}-name`}>Nama</label>
                        <input
                            id={`${uid}-name`}
                            autoComplete="name"
                            value={name}
                            maxLength={LIMITS.nameMax}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="wt15-field">
                        <label htmlFor={`${uid}-msg`}>Ucapan &amp; doa</label>
                        <textarea
                            id={`${uid}-msg`}
                            rows={3}
                            value={message}
                            maxLength={LIMITS.wishMax}
                            onChange={(e) => setMessage(e.target.value)}
                            aria-describedby={`${uid}-count`}
                        />
                        <p className="wt15-field__hint" id={`${uid}-count`}>
                            {message.length}/{LIMITS.wishMax}
                        </p>
                    </div>
                    {error && (
                        <p className="wt15-field__error" role="alert">
                            <IconAlert width={15} height={15} /> {error}
                        </p>
                    )}
                    <button type="submit" className="wt15-btn wt15-btn--primary wt15-btn--block" disabled={sending} aria-busy={sending}>
                        {sending ? <Spinner label="Mengirim ucapan" /> : 'Kirim Ucapan'}
                    </button>
                    {notice && (
                        <p key={notice} className="wt15-result wt15-result--ok wt15-small wt15-fade-in" role="status">
                            {notice}
                        </p>
                    )}
                </form>

                <div className="wt15-wishes" aria-live="polite" aria-busy={list.kind === 'loading'}>
                    {list.kind === 'loading' && (
                        <div className="wt15-wishes__state">
                            <Spinner label="Memuat ucapan" />
                        </div>
                    )}
                    {list.kind === 'error' && (
                        <div className="wt15-wishes__state">
                            <p>Ucapan belum bisa dimuat.</p>
                            <button type="button" className="wt15-btn wt15-btn--ghost wt15-btn--sm" onClick={() => void load()}>
                                Coba lagi
                            </button>
                        </div>
                    )}
                    {list.kind === 'ready' && list.wishes.length === 0 && (
                        <EmptyState title="Belum ada ucapan" text="Jadilah yang pertama menggantungkan doa di pohon harapan ✨" />
                    )}
                    {list.kind === 'ready' && list.wishes.length > 0 && (
                        <ul className="wt15-wishes__list">
                            {list.wishes.map((w) => (
                                <li key={w.id} className={`wt15-wish ${w.id === fresh ? 'is-new' : ''}`}>
                                    <p className="wt15-wish__head">
                                        <strong>{w.name}</strong>
                                        {w.createdAt && (
                                            <time dateTime={/^\d{4}-/.test(w.createdAt) ? w.createdAt : undefined}>{relativeTime(w.createdAt)}</time>
                                        )}
                                    </p>
                                    <p className="wt15-wish__msg">{w.message}</p>
                                </li>
                            ))}
                            {list.hasMore && (
                                <li className="wt15-wishes__more">
                                    <button
                                        type="button"
                                        className="wt15-btn wt15-btn--ghost wt15-btn--sm"
                                        onClick={() => void loadMore()}
                                        disabled={list.loadingMore}
                                    >
                                        {list.loadingMore ? <Spinner label="Memuat ucapan" /> : 'Muat ucapan lainnya'}
                                    </button>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}
