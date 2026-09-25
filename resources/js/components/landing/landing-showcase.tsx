import { eventTypeLabel, groupByEventType } from '@/lib/event-types';
import { type LandingThemeSample } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import EventTypeTabs from './event-type-tabs';
import ThemeSampleCard from './theme-sample-card';

interface LandingShowcaseProps {
    themes: LandingThemeSample[];
    onCreateFromTheme: (themeId: number) => void;
}

const DEFAULT_TAB = 'wedding';

export default function LandingShowcase({ themes, onCreateFromTheme }: LandingShowcaseProps) {
    const [selectedTab, setSelectedTab] = useState<string>(DEFAULT_TAB);
    const [isNavigating, setIsNavigating] = useState(false);

    const groups = useMemo(() => groupByEventType(themes), [themes]);

    // Fall back to the first available type when there are no wedding themes.
    const activeTab = groups.some(([type]) => type === selectedTab) ? selectedTab : (groups[0]?.[0] ?? DEFAULT_TAB);
    const visibleThemes = groups.find(([type]) => type === activeTab)?.[1] ?? [];

    const tabs = groups.map(([type]) => ({ value: type, label: eventTypeLabel(type) }));

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
                    <div className="mb-10">
                        <EventTypeTabs tabs={tabs} active={activeTab} onChange={setSelectedTab} />
                    </div>
                )}

                {visibleThemes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleThemes.map((theme) => (
                            <ThemeSampleCard key={theme.id} theme={theme} onCreate={onCreateFromTheme} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Tema akan segera hadir — nantikan koleksi desain terbaru kami.</p>
                )}

                <div className="mt-14 text-center">
                    <p className="mb-6 text-lg text-gray-600">Masih banyak template menarik lainnya untuk setiap jenis acara Anda</p>
                    <Link
                        href={route('themes.index', { event_type: activeTab })}
                        onStart={() => setIsNavigating(true)}
                        onFinish={() => setIsNavigating(false)}
                        aria-busy={isNavigating}
                        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-orange-500 hover:shadow-xl ${
                            isNavigating ? 'pointer-events-none opacity-80' : ''
                        }`}
                    >
                        {isNavigating ? 'Memuat Tema...' : `Lihat Semua Tema ${eventTypeLabel(activeTab)}`}
                        {isNavigating ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">
                        Butuh desain custom atau undangan video? <span className="text-rose-500">Konsultasikan lewat WhatsApp di footer.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
