import { type LandingThemeSample } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface LandingShowcaseProps {
    themes: LandingThemeSample[];
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

export default function LandingShowcase({ themes }: LandingShowcaseProps) {
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

                {themes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {themes.map((theme) => (
                            <Link
                                key={theme.id}
                                href={route('themes.index')}
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                                        <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-800 opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
                                            Lihat Tema
                                        </span>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <TierBadge theme={theme} />
                                    </div>
                                </div>
                                <div className="p-4 text-left">
                                    <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {theme.category} · {theme.event_type}
                                    </p>
                                </div>
                            </Link>
                        ))}
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
