import { eventTypeLabel } from '@/lib/event-types';
import { useState } from 'react';

export interface ThemeSampleCardTheme {
    id: number;
    name: string;
    event_type: string;
    thumbnail: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    sample_url: string | null;
}

interface ThemeSampleCardProps {
    theme: ThemeSampleCardTheme;
    onCreate: (themeId: number) => void;
}

export default function ThemeSampleCard({ theme, onCreate }: ThemeSampleCardProps) {
    // Missing thumbnail files fall back to the gradient instead of a broken image.
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = Boolean(theme.thumbnail) && !imageFailed;

    return (
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
                className="relative h-48 w-full overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${theme.color_primary ?? '#f43f5e'} 0%, ${theme.color_secondary ?? '#fb923c'} 100%)`,
                }}
            >
                {showImage ? (
                    <img
                        src={theme.thumbnail ?? undefined}
                        alt={`Contoh tema undangan ${eventTypeLabel(theme.event_type).toLowerCase()} ${theme.name}`}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-5xl opacity-30">🎨</div>
                )}
            </div>
            <div className="p-4 text-left">
                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{eventTypeLabel(theme.event_type)}</p>
                <div className="mt-3 flex gap-2">
                    {theme.sample_url ? (
                        <a
                            href={theme.sample_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                            Sampel
                        </a>
                    ) : (
                        <span
                            className="flex-1 cursor-not-allowed rounded-full border border-gray-100 px-3 py-2 text-center text-xs font-semibold text-gray-400"
                            title="Sampel untuk tema ini segera hadir"
                        >
                            Segera Hadir
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onCreate(theme.id)}
                        className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-rose-600 hover:to-rose-500"
                    >
                        Buat Undangan
                    </button>
                </div>
            </div>
        </div>
    );
}
