import { type LandingThemeSample } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface LandingShowcaseProps {
    themes: LandingThemeSample[];
    onCreateFromTheme: (themeId: number) => void;
}

const ALL_TAB = 'all';
const ALL_TAB_LIMIT = 6;

// Keys mirror the event_type slug stored in the database; order defines tab order.
const EVENT_TYPE_LABELS: Record<string, string> = {
    wedding: 'Pernikahan',
    birthday: 'Ulang Tahun',
    khitanan: 'Khitanan',
    aqiqah: 'Aqiqah',
    gender_reveal: 'Gender Reveal',
    syukuran: 'Syukuran',
};

function eventTypeLabel(value: string): string {
    return EVENT_TYPE_LABELS[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Round-robin across types so the "Semua" tab shows a mix instead of one type's themes.
function interleaveByType(groups: [string, LandingThemeSample[]][], limit: number): LandingThemeSample[] {
    const result: LandingThemeSample[] = [];
    for (let i = 0; result.length < limit; i++) {
        const round = groups.map(([, list]) => list[i]).filter(Boolean);
        if (round.length === 0) break;
        result.push(...round);
    }
    return result.slice(0, limit);
}

function TierBadge({ theme }: { theme: LandingThemeSample }) {
    if (theme.is_exclusive) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                ★ Eksklusif
            </span>
        );
    }
    if (theme.is_premium) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                ◆ Premium
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">✓ Gratis</span>
    );
}

export default function LandingShowcase({ themes, onCreateFromTheme }: LandingShowcaseProps) {
    const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

    const groups = useMemo(() => {
        const map = new Map<string, LandingThemeSample[]>();
        for (const theme of themes) {
            const list = map.get(theme.event_type) ?? [];
            list.push(theme);
            map.set(theme.event_type, list);
        }
        const order = Object.keys(EVENT_TYPE_LABELS);
        const rank = (type: string) => (order.includes(type) ? order.indexOf(type) : order.length);
        return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b));
    }, [themes]);

    const visibleThemes =
        activeTab === ALL_TAB ? interleaveByType(groups, ALL_TAB_LIMIT) : (groups.find(([type]) => type === activeTab)?.[1] ?? []);

    const tabs = [{ value: ALL_TAB, label: 'Semua' }, ...groups.map(([type]) => ({ value: type, label: eventTypeLabel(type) }))];

    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                        Contoh Undangan Kami
                        <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Beragam Tema, Siap Dipakai</span>
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                </div>

                {groups.length > 1 && (
                    <div className="mb-10 flex justify-center">
                        <div role="tablist" className="flex max-w-full gap-2 overflow-x-auto px-1 pb-2">
                            {tabs.map((tab) => {
                                const isActive = tab.value === activeTab;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                                            isActive
                                                ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-md'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:text-rose-500'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {visibleThemes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleThemes.map((theme) => {
                            const hasSample = Boolean(theme.sample_url);

                            return (
                                <div
                                    key={theme.id}
                                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div
                                        className="relative h-48 w-full"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.color_primary ?? '#f43f5e'} 0%, ${theme.color_secondary ?? '#fb923c'} 100%)`,
                                        }}
                                    >
                                        {theme.thumbnail ? (
                                            <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-5xl opacity-30">🎨</div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <TierBadge theme={theme} />
                                        </div>
                                    </div>
                                    <div className="p-4 text-left">
                                        <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {theme.category} · {theme.event_type}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            {hasSample ? (
                                                <a
                                                    href={theme.sample_url ?? undefined}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
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
                                                onClick={() => onCreateFromTheme(theme.id)}
                                                className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-rose-600 hover:to-rose-500"
                                            >
                                                Buat Undangan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Tema akan segera hadir — nantikan koleksi desain terbaru kami.</p>
                )}

                <div className="mt-14 text-center">
                    <p className="mb-6 text-lg text-gray-600">Masih banyak template menarik lainnya untuk setiap jenis acara Anda</p>
                    <Link
                        href={route('themes.index')}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-orange-500 hover:shadow-xl"
                    >
                        Lihat Semua Tema
                        <ArrowRight className="size-5" />
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">
                        Butuh desain custom atau undangan video? <span className="text-rose-500">Konsultasikan lewat WhatsApp di footer.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
