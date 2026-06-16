import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { WishItem } from '@/types/invitation';

interface WishesSectionProps {
    wishesEndpoint: string;
    allowComments: boolean;
    onToast?: (msg: string) => void;
    styles: {
        container: string;
        formBox: string;
        formTitle: string;
        nameInput: string;
        messageInput: string;
        submitBtn: string;
        wishCard: string;
        wishAvatar: string;
        wishName: string;
        wishDate: string;
        wishMessage: string;
        loadMoreBtn: string;
    };
}

const AVATAR_COLORS = ['#2D5016', '#C9A84C', '#E8B4B8', '#6a9fd8', '#a0c87a', '#c8a0d0', '#f0a080', '#80c8c0'];

function getInitial(name: string) {
    return (name || '?').charAt(0).toUpperCase();
}

function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function WishesSection({ wishesEndpoint, allowComments, onToast, styles }: WishesSectionProps) {
    const [wishes, setWishes] = useState<WishItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const hasFetched = useRef(false);

    const fetchWishes = useCallback(
        async (pageNum: number) => {
            try {
                const url = `${wishesEndpoint}?page=${pageNum}`;
                const res = await fetch(url, { headers: { Accept: 'application/json' } });
                if (!res.ok) return;
                const data = await res.json();
                const items: WishItem[] = (data.wishes ?? []).map((w: any) => ({
                    name: w.name ?? w.author_name ?? '',
                    message: w.message ?? w.content ?? '',
                    date: w.date ?? w.approved_at ?? '',
                }));
                if (pageNum === 1) {
                    setWishes(items);
                } else {
                    setWishes((prev) => [...prev, ...items]);
                }
                // If fewer than 10 returned, no more pages
                setHasMore(items.length >= 10);
            } catch {
                setHasMore(false);
            }
        },
        [wishesEndpoint],
    );

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchWishes(1);
    }, [fetchWishes]);

    const loadMore = async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        await fetchWishes(nextPage);
        setPage(nextPage);
        setLoadingMore(false);
    };

    const submitWish = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) {
            onToast?.('Nama dan ucapan harus diisi!');
            return;
        }
        setSubmitting(true);
        try {
            await fetch(wishesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name: name.trim(), message: message.trim() }),
            });
            onToast?.('Ucapan berhasil dikirim! 💕');
            setName('');
            setMessage('');
            // Prepend to local list for instant feedback
            setWishes((prev) => [
                { name: name.trim(), message: message.trim(), date: new Date().toISOString() },
                ...prev,
            ]);
        } catch {
            onToast?.('Ucapan berhasil dikirim! 💕');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Form side */}
            {allowComments && (
                <div>
                    <div className={styles.formBox}>
                        <h3 className={styles.formTitle}>Tulis Ucapan</h3>
                        <form onSubmit={submitWish}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                className={styles.nameInput}
                            />
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                placeholder="Ucapan dan doa untuk kedua mempelai..."
                                className={styles.messageInput}
                            />
                            <button type="submit" disabled={submitting} className={styles.submitBtn}>
                                {submitting ? 'Mengirim...' : 'Kirim Ucapan ✦'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Wishes list side */}
            <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {wishes.map((w, i) => (
                        <div key={i} className={styles.wishCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                <div
                                    className={styles.wishAvatar}
                                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                                >
                                    {getInitial(w.name)}
                                </div>
                                <div>
                                    <p className={styles.wishName}>{w.name}</p>
                                    <p className={styles.wishDate}>{formatDate(w.date)}</p>
                                </div>
                            </div>
                            <p className={styles.wishMessage}>{w.message}</p>
                        </div>
                    ))}
                    {wishes.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                            Belum ada ucapan. Jadilah yang pertama!
                        </p>
                    )}
                </div>
                {hasMore && (
                    <button onClick={loadMore} disabled={loadingMore} className={styles.loadMoreBtn}>
                        {loadingMore ? 'Memuat...' : 'Lihat Lebih Banyak'}
                    </button>
                )}
            </div>
        </div>
    );
}
