import LandingLogo from '@/components/landing/landing-logo';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

/**
 * Auth pages styled after the landing hero: rose → orange gradient, floating
 * bubbles, serif headings and the form inside a white card. Wrapped in
 * .force-light because the landing design is always light.
 */
export default function AuthLandingLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="force-light relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 px-4 py-10 text-gray-800 sm:px-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-20 left-10 h-8 w-8 animate-bounce rounded-full bg-gradient-to-r from-rose-400 to-pink-400 opacity-20" />
                <div className="absolute top-40 right-16 h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-orange-300 to-rose-300 opacity-30" />
                <div className="absolute bottom-40 left-20 h-10 w-10 animate-bounce rounded-full bg-gradient-to-r from-pink-400 to-rose-400 opacity-20 delay-500" />
                <div className="absolute right-32 bottom-24 h-7 w-7 animate-pulse rounded-full bg-gradient-to-r from-rose-300 to-orange-300 opacity-20" />
                <div className="absolute top-32 right-10 h-16 w-16 rounded-full border-2 border-rose-300 opacity-10" />
                <div className="absolute bottom-44 left-14 h-20 w-20 rounded-full border-2 border-pink-300 opacity-15" />
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
                <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
            </div>

            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
                <Link href={route('home')} aria-label="Undesia — kembali ke beranda">
                    <LandingLogo />
                </Link>

                <div className="w-full rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-xl shadow-rose-200/40 backdrop-blur sm:p-8">
                    <div className="mb-6 space-y-2 text-center">
                        <h1 className="font-serif text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
                        {description && <p className="text-sm text-gray-500">{description}</p>}
                    </div>
                    {children}
                </div>

                <Link
                    href={route('home')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke beranda
                </Link>
            </div>
        </div>
    );
}
