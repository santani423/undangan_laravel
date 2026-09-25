import EventTypeTabs from '@/components/landing/event-type-tabs';
import LandingHeader from '@/components/landing/landing-header';
import LandingLogo from '@/components/landing/landing-logo';
import ThemeSampleCard from '@/components/landing/theme-sample-card';
import { useAuthGate } from '@/hooks/use-auth-gate';
import { eventTypeLabel, groupByEventType } from '@/lib/event-types';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ThemeItem {
    id: number;
    name: string;
    slug: string;
    event_type: string;
    thumbnail: string;
    color_primary: string;
    color_secondary: string;
    sample_url: string | null;
}

interface PageProps extends SharedData {
    themes: ThemeItem[];
    event_type?: string;
    [key: string]: unknown;
}

const ALL_TYPES = '';

export default function ThemesIndex() {
    const { themes, auth, event_type: initialEventType } = usePage<PageProps>().props;
    const { requireAuth, modal } = useAuthGate();

    const handleCreate = (themeId: number) => requireAuth(route('customer.invitations.create.theme', { theme_id: themeId }), { themeId });

    const groups = useMemo(() => groupByEventType(themes), [themes]);

    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState(() =>
        initialEventType && groups.some(([type]) => type === initialEventType) ? initialEventType : ALL_TYPES,
    );

    const tabs = [
        { value: ALL_TYPES, label: 'Semua', count: themes.length },
        ...groups.map(([type, list]) => ({ value: type, label: eventTypeLabel(type), count: list.length })),
    ];

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return themes.filter((t) => (!eventType || t.event_type === eventType) && (!query || t.name.toLowerCase().includes(query)));
    }, [themes, search, eventType]);

    const heading = eventType ? `Tema ${eventTypeLabel(eventType)}` : 'Semua Tema Undangan';

    return (
        <>
            <Head title={heading}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=playfair-display:500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white">
                <LandingHeader auth={auth} onCreateInvitation={() => requireAuth(route('customer.invitations.create'), {})} />

                {/* Hero */}
                <section className="bg-gradient-to-b from-rose-50 via-white to-white pt-32 pb-10 text-center">
                    <div className="mx-auto max-w-3xl px-4">
                        <h1 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                            {heading}
                            <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Pilih Desain, Langsung Pakai</span>
                        </h1>
                        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                        <p className="mt-6 text-gray-600">{themes.length} tema tersedia untuk berbagai acara spesial Anda</p>

                        <div className="relative mx-auto mt-8 max-w-md">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Cari tema..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 w-full rounded-full border border-gray-200 bg-white pr-4 pl-11 text-sm shadow-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Event type tabs */}
                <div className="sticky top-18 z-40 border-b border-gray-100 bg-white/95 pt-3 pb-1 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <EventTypeTabs tabs={tabs} active={eventType} onChange={setEventType} />
                    </div>
                </div>

                {/* Content */}
                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-24 text-center text-gray-500">
                            <span className="text-6xl">🔍</span>
                            <p className="mt-4 text-lg font-medium">Tidak ada tema ditemukan</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setEventType(ALL_TYPES);
                                }}
                                className="mt-4 text-sm font-semibold text-rose-500 hover:underline"
                            >
                                Tampilkan Semua Tema
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((theme) => (
                                <ThemeSampleCard key={theme.id} theme={theme} onCreate={handleCreate} />
                            ))}
                        </div>
                    )}
                </main>

                <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
                        <Link href="/" aria-label="Undesia">
                            <LandingLogo variant="dark" />
                        </Link>
                        <p className="text-sm text-gray-400">© {new Date().getFullYear()} Undesia · Semua hak dilindungi</p>
                    </div>
                </footer>
            </div>

            {modal}
        </>
    );
}
