import React, { useState, useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";

interface ThemeItem {
    id: number;
    name: string;
    slug: string;
    category: string;
    event_type: string;
    thumbnail: string;
    color_primary: string;
    color_secondary: string;
    is_premium: boolean;
    is_exclusive: boolean;
    price: number;
    usage_count: number;
    tags: string[];
}

interface PageProps {
    themes: ThemeItem[];
    auth?: { user?: { name: string } };
    [key: string]: unknown;
}

function formatPrice(price: number): string {
    if (price === 0) return "Gratis";
    return "Rp " + price.toLocaleString("id-ID");
}

function TierBadge({ theme }: { theme: ThemeItem }) {
    if (theme.is_exclusive) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                ★ Eksklusif
            </span>
        );
    }
    if (theme.is_premium) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                ◆ Premium
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            ✓ Gratis
        </span>
    );
}

function ThemeCard({ theme }: { theme: ThemeItem }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div
                className="relative h-52 w-full"
                style={{ background: `linear-gradient(135deg, ${theme.color_primary} 0%, ${theme.color_secondary} 100%)` }}
            >
                {theme.thumbnail ? (
                    <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-4xl opacity-30">🎨</span>
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow hover:bg-gray-50">
                        Gunakan Template
                    </button>
                </div>
                <div className="absolute left-3 top-3">
                    <TierBadge theme={theme} />
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{theme.category} · {theme.event_type}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">{formatPrice(theme.price)}</span>
                    <span className="text-xs text-gray-400">{theme.usage_count.toLocaleString("id-ID")}× dipakai</span>
                </div>
            </div>
        </div>
    );
}

function ThemeRow({ theme }: { theme: ThemeItem }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div
                className="h-16 w-24 flex-shrink-0 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${theme.color_primary} 0%, ${theme.color_secondary} 100%)` }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                    <TierBadge theme={theme} />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{theme.category} · {theme.event_type}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                    {(theme.tags ?? []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800">{formatPrice(theme.price)}</p>
                <p className="text-xs text-gray-400">{theme.usage_count.toLocaleString("id-ID")}× dipakai</p>
                <button className="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                    Gunakan
                </button>
            </div>
        </div>
    );
}

export default function ThemesIndex() {
    const { themes, auth } = usePage<PageProps>().props;

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterEventType, setFilterEventType] = useState("");
    const [filterTier, setFilterTier] = useState<"all" | "free" | "premium" | "exclusive">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const categories = useMemo(() => [...new Set(themes.map(t => t.category))].sort(), [themes]);
    const eventTypes = useMemo(() => [...new Set(themes.map(t => t.event_type))].sort(), [themes]);

    const filtered = useMemo(() => {
        return themes.filter(t => {
            if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterCategory && t.category !== filterCategory) return false;
            if (filterEventType && t.event_type !== filterEventType) return false;
            if (filterTier === "free" && (t.is_premium || t.is_exclusive)) return false;
            if (filterTier === "premium" && (!t.is_premium || t.is_exclusive)) return false;
            if (filterTier === "exclusive" && !t.is_exclusive) return false;
            return true;
        });
    }, [themes, search, filterCategory, filterEventType, filterTier]);

    const resetFilters = () => {
        setSearch("");
        setFilterCategory("");
        setFilterEventType("");
        setFilterTier("all");
    };

    const freeCount = themes.filter(t => !t.is_premium && !t.is_exclusive).length;
    const premiumCount = themes.filter(t => t.is_premium && !t.is_exclusive).length;
    const exclusiveCount = themes.filter(t => t.is_exclusive).length;

    return (
        <>
            <Head title="Template Undangan" />

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <Link href="/" className="text-xl font-bold text-indigo-600">Undesia</Link>
                    <nav className="hidden items-center gap-6 text-sm sm:flex">
                        <Link href="/themes" className="font-medium text-indigo-600">Template</Link>
                        <a href="#" className="text-gray-600 hover:text-gray-900">Harga</a>
                        <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <Link href="/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                                    Masuk
                                </Link>
                                <Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-14 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900">Pilih Template Undangan</h1>
                <p className="mt-3 text-gray-500">
                    {themes.length} template tersedia untuk berbagai acara spesial Anda
                </p>
                <div className="mt-6 flex justify-center gap-4 text-sm">
                    <span className="rounded-full bg-green-100 px-4 py-1.5 font-semibold text-green-700">{freeCount} Gratis</span>
                    <span className="rounded-full bg-purple-100 px-4 py-1.5 font-semibold text-purple-700">{premiumCount} Premium</span>
                    <span className="rounded-full bg-amber-100 px-4 py-1.5 font-semibold text-amber-700">{exclusiveCount} Eksklusif</span>
                </div>
            </section>

            {/* Filter bar */}
            <div className="sticky top-[57px] z-40 border-b border-gray-100 bg-white/95 backdrop-blur shadow-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
                    <input
                        type="text"
                        placeholder="Cari template..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-48"
                    />
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={filterEventType}
                        onChange={e => setFilterEventType(e.target.value)}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
                    >
                        <option value="">Semua Acara</option>
                        {eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                        {(["all", "free", "premium", "exclusive"] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setFilterTier(tier)}
                                className={`px-3 py-1.5 capitalize ${filterTier === tier ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                {tier === "all" ? "Semua" : tier === "free" ? "Gratis" : tier === "premium" ? "Premium" : "Eksklusif"}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex gap-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
                            title="Grid"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`rounded-lg p-2 ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
                            title="List"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="mx-auto max-w-7xl px-4 py-8">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-24 text-center text-gray-400">
                        <span className="text-6xl">🔍</span>
                        <p className="mt-4 text-lg font-medium">Tidak ada template ditemukan</p>
                        <button onClick={resetFilters} className="mt-4 text-sm text-indigo-600 hover:underline">
                            Tampilkan Semua
                        </button>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filtered.map(theme => <ThemeCard key={theme.id} theme={theme} />)}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(theme => <ThemeRow key={theme.id} theme={theme} />)}
                    </div>
                )}
            </main>

            <footer className="border-t border-gray-100 bg-gray-50 py-8 text-center text-sm text-gray-400">
                © 2026 Undesia · Semua hak dilindungi
            </footer>
        </>
    );
}
