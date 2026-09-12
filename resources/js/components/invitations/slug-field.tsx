import { buildInvitationPublicUrl, normalizeInvitationSlug } from '@/lib/invitation-slug';
import { Check, Link2, Loader2, RefreshCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'empty' | 'error';

interface SlugFieldProps {
    value: string;
    onChange: (value: string) => void;
    autoValue: string;
    autoSourceLabel: string;
    checkUrl: string;
    excludeId?: number;
    startInAutoMode?: boolean;
    disabled?: boolean;
    serverError?: string;
    label?: string;
    description?: string;
    onStatusChange?: (status: SlugStatus) => void;
}

export default function SlugField({
    value,
    onChange,
    autoValue,
    autoSourceLabel,
    checkUrl,
    excludeId,
    startInAutoMode = true,
    disabled = false,
    serverError = '',
    label = 'Slug Undangan',
    description = 'Slug ini menjadi alamat publik yang bisa dibagikan ke tamu.',
    onStatusChange,
}: SlugFieldProps) {
    const [mode, setMode] = useState<'auto' | 'manual'>(startInAutoMode ? 'auto' : 'manual');
    const [status, setStatus] = useState<SlugStatus>(value ? 'idle' : 'empty');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [previewOrigin, setPreviewOrigin] = useState('');
    const requestSeqRef = useRef(0);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const onStatusChangeRef = useRef(onStatusChange);
    useEffect(() => {
        onStatusChangeRef.current = onStatusChange;
    }, [onStatusChange]);
    useEffect(() => {
        onStatusChangeRef.current?.(status);
    }, [status]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPreviewOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (mode !== 'auto') {
            return;
        }

        const normalizedAuto = normalizeInvitationSlug(autoValue);
        if (normalizedAuto !== value) {
            onChangeRef.current(normalizedAuto);
        }
    }, [autoValue, mode, value]);

    useEffect(() => {
        if (disabled) {
            return;
        }

        const normalizedValue = normalizeInvitationSlug(value);
        if (!normalizedValue) {
            setStatus('empty');
            setSuggestions([]);
            return;
        }

        if (normalizedValue !== value) {
            onChangeRef.current(normalizedValue);
            return;
        }

        setStatus('checking');
        const timer = window.setTimeout(async () => {
            const requestId = ++requestSeqRef.current;

            try {
                const params = new URLSearchParams({ slug: normalizedValue });
                if (excludeId) {
                    params.set('exclude_id', String(excludeId));
                }

                const res = await fetch(`${checkUrl}?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                });
                const data = await res.json();

                if (requestId !== requestSeqRef.current) {
                    return;
                }

                if (data.available) {
                    setStatus('available');
                    setSuggestions([]);
                } else {
                    setStatus('taken');
                    setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
                }
            } catch {
                if (requestId === requestSeqRef.current) {
                    setStatus('error');
                }
            }
        }, 450);

        return () => window.clearTimeout(timer);
    }, [checkUrl, disabled, excludeId, value]);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const normalized = normalizeInvitationSlug(event.target.value);
        setMode('manual');
        onChangeRef.current(normalized);
    }

    function handleRegenerate() {
        const normalized = normalizeInvitationSlug(autoValue);
        setMode('auto');
        onChangeRef.current(normalized);
    }

    function handleSuggestionClick(nextSlug: string) {
        setMode('manual');
        onChangeRef.current(normalizeInvitationSlug(nextSlug));
    }

    const previewSlug = normalizeInvitationSlug(value) || normalizeInvitationSlug(autoValue);
    const previewUrl = buildInvitationPublicUrl(previewOrigin, previewSlug || 'slug-undangan');
    const statusText =
        status === 'available' ? 'Slug tersedia' :
        status === 'taken' ? 'Slug sudah digunakan' :
        status === 'checking' ? 'Memeriksa ketersediaan...' :
        status === 'error' ? 'Gagal memeriksa slug' :
        'Slug akan dicek otomatis saat Anda mengetik';

    const statusTone =
        status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        status === 'taken' ? 'bg-red-50 text-red-700 border-red-200' :
        status === 'checking' ? 'bg-sky-50 text-sky-700 border-sky-200' :
        status === 'error' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-muted text-muted-foreground border-border';

    const borderTone = serverError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
        : status === 'available'
            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200'
            : status === 'taken'
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-border focus:border-primary focus:ring-primary/20';

    return (
        <section
            className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-sm"
            data-invalid={!!serverError || status === 'taken'}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Sparkles className="size-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">{label}</h3>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className="size-3.5" />
                    Gunakan {autoSourceLabel}
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${statusTone}`}>
                    {status === 'checking' && <Loader2 className="size-3.5 animate-spin" />}
                    {status === 'available' && <Check className="size-3.5" />}
                    {status === 'taken' && <X className="size-3.5" />}
                    {status === 'error' && <X className="size-3.5" />}
                    {statusText}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    {mode === 'auto' ? 'Mode otomatis' : 'Mode manual'}
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                    {label} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        placeholder="contoh: ulang-tahun-arsya-7th"
                        disabled={disabled}
                        className={`w-full rounded-xl border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 ${borderTone} ${disabled ? 'opacity-60' : ''}`}
                    />
                    <Link2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                    Huruf kecil, angka, dan tanda hubung saja. Preview URL akan ikut berubah secara otomatis.
                </p>
                {serverError && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{serverError}</p>
                )}
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">URL Undangan</p>
                <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm font-semibold text-foreground">{previewUrl}</span>
                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Buka
                    </a>
                </div>
            </div>

            {status === 'taken' && suggestions.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Rekomendasi slug yang tersedia
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                disabled={disabled}
                                className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
