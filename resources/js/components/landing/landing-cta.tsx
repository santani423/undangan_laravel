import { type Auth } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

interface LandingCtaProps {
    auth: Auth;
    onCreateInvitation: () => void;
}

export default function LandingCta({ auth, onCreateInvitation }: LandingCtaProps) {
    const primaryLabel = auth.user ? 'Buat Undangan Baru' : 'Mulai Sekarang';

    return (
        <section className="relative overflow-hidden py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400" />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 left-10 h-20 w-20 animate-bounce rounded-full bg-white/10 delay-1000" />
                <div className="absolute top-40 right-20 h-16 w-16 animate-pulse rounded-full bg-white/10" />
                <div className="absolute bottom-32 left-32 h-12 w-12 animate-bounce rounded-full bg-white/10" />
                <div className="absolute right-40 bottom-20 h-24 w-24 animate-pulse rounded-full bg-white/10 delay-700" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-center gap-4">
                    <Sparkles className="size-8 animate-pulse text-yellow-300" />
                    <Heart className="size-10 text-pink-200" />
                    <Sparkles className="size-8 animate-pulse text-yellow-300 delay-1000" />
                </div>

                <h2 className="mb-6 font-serif text-4xl leading-tight font-bold text-white md:text-6xl">
                    Percayakan Momen Spesial Anda
                    <span className="mt-2 block text-3xl font-light text-rose-100 md:text-4xl">dengan Undesia</span>
                </h2>

                <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed font-light text-rose-100 md:text-2xl">
                    Undangan digital eksklusif, mudah dibagikan, penuh kesan. Buat momen istimewa Anda berkesan selamanya.
                </p>

                <div className="mb-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
                    <button
                        type="button"
                        onClick={onCreateInvitation}
                        className="group inline-flex min-w-[250px] items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-rose-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-rose-50"
                    >
                        {primaryLabel}
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link
                        href={route('themes.index')}
                        className="inline-flex min-w-[250px] items-center justify-center rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-rose-600"
                    >
                        Lihat Semua Tema
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 text-rose-100 sm:flex-row sm:gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-3 animate-pulse rounded-full bg-green-400" />
                        <span className="text-sm">Proses cepat &amp; mudah</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 animate-pulse rounded-full bg-green-400 delay-500" />
                        <span className="text-sm">Desain elegan &amp; modern</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 animate-pulse rounded-full bg-green-400 delay-1000" />
                        <span className="text-sm">Dukungan via WhatsApp</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0">
                <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
                    <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" />
                </svg>
            </div>
        </section>
    );
}
