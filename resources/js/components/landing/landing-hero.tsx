import { type Auth } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingHeroProps {
    auth: Auth;
    appTagline: string;
    onCreateInvitation: () => void;
}

export default function LandingHero({ auth, appTagline, onCreateInvitation }: LandingHeroProps) {
    const primaryLabel = auth.user ? 'Buat Undangan Baru' : 'Buat Undangan Sekarang';

    return (
        <section
            id="beranda"
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 pt-24 pb-16"
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-28 left-10 h-8 w-8 animate-bounce rounded-full bg-gradient-to-r from-rose-400 to-pink-400 opacity-20" />
                <div className="absolute top-40 right-16 h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-orange-300 to-rose-300 opacity-30 delay-1000" />
                <div className="absolute bottom-40 left-20 h-10 w-10 animate-bounce rounded-full bg-gradient-to-r from-pink-400 to-rose-400 opacity-20 delay-500" />
                <div className="absolute right-32 bottom-24 h-7 w-7 animate-pulse rounded-full bg-gradient-to-r from-rose-300 to-orange-300 opacity-20 delay-[2000ms]" />
                <div className="absolute top-36 right-12 h-16 w-16 rounded-full border-2 border-rose-300 opacity-10" />
                <div className="absolute bottom-44 left-16 h-20 w-20 rounded-full border-2 border-pink-300 opacity-15" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-rose-600 shadow-sm backdrop-blur">
                    <Sparkles className="size-4" />
                    Undangan Digital Modern &amp; Eksklusif
                </span>

                <h1 className="mt-6 font-serif text-4xl leading-tight font-bold text-gray-800 sm:text-5xl lg:text-6xl">
                    Rayakan Momen Spesial Anda Bersama{' '}
                    <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400 bg-clip-text text-transparent">Undesia</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">{appTagline}</p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={onCreateInvitation}
                        className="group inline-flex min-w-[250px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-rose-500 hover:shadow-xl"
                    >
                        {primaryLabel}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link
                        href={route('themes.index')}
                        className="inline-flex min-w-[250px] items-center justify-center rounded-full border-2 border-rose-300 bg-white px-8 py-4 text-base font-semibold text-rose-600 shadow-sm transition-all duration-300 hover:bg-rose-50"
                    >
                        Lihat Semua Tema
                    </Link>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0">
                <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
                    <path d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z" />
                </svg>
            </div>
        </section>
    );
}
