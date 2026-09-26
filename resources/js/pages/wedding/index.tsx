import LandingCta from '@/components/landing/landing-cta';
import LandingFeatures from '@/components/landing/landing-features';
import LandingFooter from '@/components/landing/landing-footer';
import LandingHeader from '@/components/landing/landing-header';
import LandingPackages from '@/components/landing/landing-packages';
import ThemeSampleCard from '@/components/landing/theme-sample-card';
import { useAuthGate } from '@/hooks/use-auth-gate';
import { type SharedData } from '@/types';
import { type WeddingPageProps } from '@/types/landing';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronRight, Palette, PenLine, Send, Wallet, type LucideIcon } from 'lucide-react';

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
    {
        icon: Palette,
        title: 'Pilih tema pernikahan',
        description: 'Lihat contoh undangan setiap tema lebih dulu, lalu pilih desain yang paling cocok dengan konsep acara Anda.',
    },
    {
        icon: PenLine,
        title: 'Isi data mempelai & acara',
        description: 'Masukkan nama kedua mempelai, jadwal akad dan resepsi, lokasi, galeri foto, serta cerita perjalanan cinta Anda.',
    },
    {
        icon: Wallet,
        title: 'Aktifkan paket',
        description: 'Mulai dari paket gratis, atau pilih paket Premium dan Eksklusif untuk fitur lengkap dan masa aktif lebih panjang.',
    },
    {
        icon: Send,
        title: 'Bagikan ke tamu',
        description: 'Kirim link undangan personal untuk setiap tamu lewat WhatsApp, lalu pantau RSVP dan ucapan dari dashboard.',
    },
];

export default function WeddingIndex({ appName, seoTitle, features, packagesByType, themeSamples, themeCount, contact }: WeddingPageProps) {
    const { auth } = usePage<SharedData>().props;
    const { requireAuth, modal } = useAuthGate();

    const startPlainInvitation = () => requireAuth(route('customer.invitations.create'), {});

    const startFromTheme = (themeId: number) =>
        requireAuth(route('customer.invitations.create.theme', { theme_id: themeId }), { themeId });

    const startFromPackage = (packageId: number) =>
        requireAuth(route('customer.invitations.create.theme', { package_id: packageId }), { packageId });

    const weddingThemesHref = route('themes.index', { event_type: 'wedding' });

    return (
        <>
            {/* Description, canonical, Open Graph and JSON-LD (incl. BreadcrumbList) are server-rendered by <x-seo>. */}
            <Head title={seoTitle}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=playfair-display:500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white">
                <LandingHeader auth={auth} onCreateInvitation={startPlainInvitation} />

                <main>
                    <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 pt-32 pb-20">
                        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
                            <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
                                <ol className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <li>
                                        <Link href={route('home')} className="transition-colors hover:text-rose-500">
                                            Beranda
                                        </Link>
                                    </li>
                                    <li aria-hidden="true">
                                        <ChevronRight className="size-4" />
                                    </li>
                                    <li aria-current="page" className="font-medium text-rose-600">
                                        Undangan Pernikahan
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="font-serif text-4xl leading-tight font-bold text-gray-800 sm:text-5xl lg:text-6xl">
                                Undangan Pernikahan Digital
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
                                Buat undangan pernikahan online yang elegan untuk hari bahagia Anda. Pilih dari {themeCount} tema pernikahan, isi
                                data mempelai dan rangkaian acara, lalu bagikan link undangan ke tamu lewat WhatsApp.
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={startPlainInvitation}
                                    className="group inline-flex min-w-[250px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-rose-500 hover:shadow-xl"
                                >
                                    Buat Undangan Pernikahan
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <Link
                                    href={weddingThemesHref}
                                    className="inline-flex min-w-[250px] items-center justify-center rounded-full border-2 border-rose-300 bg-white px-8 py-4 text-base font-semibold text-rose-600 shadow-sm transition-all duration-300 hover:bg-rose-50"
                                >
                                    Lihat Tema Pernikahan
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                                    Cara Membuat Undangan Pernikahan Online
                                    <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Selesai dalam Empat Langkah</span>
                                </h2>
                                <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                            </div>

                            <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {STEPS.map((step, i) => (
                                    <li key={step.title} className="rounded-2xl bg-gradient-to-br from-white to-rose-50/40 p-6 text-center shadow-md">
                                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 shadow-md">
                                            <step.icon className="size-8 text-white" aria-hidden="true" />
                                        </div>
                                        <h3 className="mb-2 font-serif text-lg leading-tight font-bold text-gray-800">
                                            {i + 1}. {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <LandingFeatures features={features} />

                    <section className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                                    Tema Undangan Pernikahan
                                    <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Lihat Contohnya Sebelum Memilih</span>
                                </h2>
                                <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                            </div>

                            {themeSamples.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {themeSamples.map((theme) => (
                                        <ThemeSampleCard key={theme.id} theme={theme} onCreate={startFromTheme} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Tema pernikahan akan segera hadir.</p>
                            )}

                            <div className="mt-14 text-center">
                                <Link
                                    href={weddingThemesHref}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-orange-500 hover:shadow-xl"
                                >
                                    Lihat Semua {themeCount} Tema Undangan Pernikahan
                                    <ArrowRight className="size-5" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <LandingPackages packagesByType={packagesByType} whatsappLink={contact.whatsapp_link} onSelectPackage={startFromPackage} />
                    <LandingCta auth={auth} onCreateInvitation={startPlainInvitation} />
                </main>

                <LandingFooter contact={contact} appName={appName} />
            </div>

            {modal}
        </>
    );
}
